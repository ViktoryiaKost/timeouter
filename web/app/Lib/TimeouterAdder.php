<?php

declare(strict_types=1);

namespace App\Lib;

use App\Models\Timeouter;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Shopify\Auth\Session;
use Shopify\Clients\Rest;
use App\Models\ScriptTag as ScriptTagModel;

class TimeouterAdder
{
    protected const PATH_TO_SCRIPT_DIR = '/public/';
    protected const PATH_TO_START_JS_FILE = 'js/timeouterScript.js';
    protected const PATH_TO_MAIN_JS_FILE = 'js/';

    public static function call(
        Session $session,
        string $title,
        string $description,
        string $discount,
        string $duration,
        string $display,
        array $products,
        $theme,
        $status
    ): void {
        $title = self::normalizeInputText(self::clearInputText($title), 25);
        $description = self::normalizeInputText(self::clearInputText($description), 60);
        $discount = self::normalizeInputText(self::clearInputText($discount), 16);
        if (count(Timeouter::where('timeouters.shop', $session->getShop())->get()) === 0) {
            self::generateScriptFile(
                $session,
                $title,
                $description,
                $discount,
                $duration,
                $display,
                $theme[0],
                $status[0],
                $products
            );
        } else {
            self::updateScriptTagRecord(
                $session,
                $title,
                $description,
                $discount,
                $duration,
                $display,
                $theme[0],
                $status[0],
                $products
            );
        }
    }

    public static function generateScriptFile(
        Session $session,
        string $title,
        string $description,
        string $discount,
        string $duration,
        string $display,
        $theme,
        $status
    ): void {
        $scriptJsName = self::PATH_TO_MAIN_JS_FILE . 'timeouter-' . time() . '.js';
        $fromFilename = dirname(__DIR__, 2) . self::PATH_TO_SCRIPT_DIR . self::PATH_TO_START_JS_FILE;
        $toFilename = dirname(__DIR__, 2) . self::PATH_TO_SCRIPT_DIR . $scriptJsName;
        if (!copy($fromFilename, $toFilename)) {
            Log::error('error with copying file');
        } else {
            self::updateJsSettings(
                $session,
                $scriptJsName,
                $title,
                $description,
                $discount,
                $duration,
                $theme,
                $status
            );
            self::createScriptTag(
                $session,
                $scriptJsName,
                $title,
                $description,
                $discount,
                $duration,
                $display,
                $theme,
                $status
            );
        }
    }

    public static function updateScriptTagRecord(
        Session $session,
        string $title,
        string $description,
        string $discount,
        string $duration,
        string $display,
        $theme,
        $status
    ): void {
        $scriptRecord = Timeouter::where('timeouters.shop', $session->getShop());
        self::updateJsSettings(
            $session,
            $scriptRecord->value('script_file'),
            $title,
            $description,
            $discount,
            $duration,
            $theme,
            $status
        );
        $scriptRecord->update([
            'title' => $title,
            'description' => $description,
            'discount_code' => $discount,
            'duration' => $duration,
            'display_scope' => $display,
            'theme' => $theme,
            'status' => $status,
            'updated_at' => date("Y-m-d H:i:s"),
            'created_at' => date("Y-m-d H:i:s")
        ]);
    }

    public static function createScriptTag(
        Session $session,
        string $scriptJsName,
        string $title,
        string $description,
        string $discount,
        string $duration,
        string $display,
        $theme,
        $status
    ): void {
        $client = new Rest($session->getShop(), $session->getAccessToken());

        $timeouter = $client->post('script_tags', [
            "script_tag" => [
                "event" => "onload",
                "display_scope" => $display,
                "src" => env('APP_URL') . '/' . $scriptJsName,
            ],
        ]);
        self::createScriptTagRecord(
            $session,
            $scriptJsName,
            $timeouter->getDecodedBody()['script_tag']['id'],
            $title,
            $description,
            $discount,
            $duration,
            $display,
            $theme,
            $status
        );
    }

    public static function createScriptTagRecord(
        Session $session,
        string $scriptJsName,
        int $id,
        string $title,
        string $description,
        string $discount,
        string $duration,
        string $display,
        $theme,
        $status
    ): void {
        $shop = ['shop' => $session->getShop(),
            'script_file' => $scriptJsName,
            'id_tag' => $id,
            'title' => $title,
            'description' => $description,
            'discount_code' => $discount,
            'duration' => $duration,
            'display_scope' => $display,
            'theme' => $theme,
            'status' => $status,
            'updated_at' => date("Y-m-d H:i:s"),
            'created_at' => date("Y-m-d H:i:s")
        ];

        Timeouter::where('timeouters')->insert($shop);
    }

    public static function normalizeInputText(string $text, int $length, string $dots = "..."): string
    {
        return (strlen($text) > $length) ? substr($text, 0, $length - strlen($dots)) . $dots : $text;
    }

    public static function clearInputText(string $text): string
    {
        $clearText = preg_replace('/[^a-zA-Z0-9\']/', ' ', $text);

        return str_replace("'", '', $clearText);
    }

    public static function checkDuration(Session $session, string $duration)
    {
        if (Timeouter::where('timeouters.shop', $session->getShop())->value('duration') != $duration) {
            return true;
        } else {
            return false;
        }
    }

    public static function updateJsSettings(
        Session $session,
        string $scriptJsName,
        string $title,
        string $description,
        string $discount,
        string $duration,
        $theme,
        $status
    ): void {
        $script = file_get_contents($scriptJsName);
        $data = explode(';', $script, 8);
        $data[0] = sprintf("let title = '%s'", $title);
        $data[1] = sprintf("\r\nlet description = '%s'", $description);
        $data[2] = sprintf("\r\nlet discount = '%s'", $discount);
        $data[3] = sprintf("\r\nlet theme = %d", $theme);
        $data[4] = sprintf("\r\nlet status = %d", $status);
        $data[5] = sprintf("\r\nlet duration = %d", $duration);
        if (self::checkDuration($session, $duration) === true) {
            $data[6] = sprintf("\r\nlet startDate = %d", time() * 1000);
        }
        $newScript = implode(";", $data);

        file_put_contents($scriptJsName, $newScript);
    }
}
