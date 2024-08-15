<?php

namespace App\Lib;

use App\Models\Timeouter;
use Illuminate\Support\Facades\Log;
use Shopify\Clients\Rest;

class TimeouterRemover
{
    public static function deleteTimeouter($session)
    {
        $file = Timeouter::where('shop', $session->getShop())->value('script_file');
        self::deleteTimeouterScriptTag($session);
        if (file_exists($file)) {
            unlink($file);
            $shopData = Timeouter::where('timeouters.shop', $session->getShop())->delete();
            if ($shopData === 1) {
                return response()->json(["status" => 'applied'], 200);
            }
        } else {
            Log::error('Nothing to delete');
            return response()->json(["status" => 'rejected'], 302);
        }
    }

    public static function deleteTimeouterScriptTag($session)
    {
        $timeouterId = Timeouter::where('shop', $session->getShop())->value('id_tag');
        $client = new Rest($session->getShop(), $session->getAccessToken());

        $client->delete("script_tags/$timeouterId");
    }
}
