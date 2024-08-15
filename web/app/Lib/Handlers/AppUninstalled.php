<?php

declare(strict_types=1);

namespace App\Lib\Handlers;

use App\Models\Timeouter;
use Illuminate\Support\Facades\Log;
use Shopify\Webhooks\Handler;
use App\Models\Session;

class AppUninstalled implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::debug("App was uninstalled from $shop - removing all sessions and scripts");
        self::deleteTimeouterScript($shop);
        Session::where('shop', $shop)->delete();
    }

    public static function deleteTimeouterScript(string $shop)
    {
        if (Timeouter::where('shop', $shop)->first()) {
            $file = Timeouter::where('shop', $shop)->value('script_file');
            if (file_exists($file)) {
                unlink($file);
            }
            Timeouter::where('shop', $shop)->delete();
            Log::debug("Timeouter removed for $shop");
        } else {
            Log::debug("Timeouter for $shop not found. Nothing to delete");
        }
    }
}
