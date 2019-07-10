<?php
/**
 * User: zura
 * Date: 3/5/18
 * Time: 6:14 PM
 */

require "CliColor.php";

/**
 * Class Logger
 *
 * @author Zura Sekhniashvili <zurasekhniashvili@gmail.com>
 * @package ${NAMESPACE}
 */
class Logger
{
    private $cliColor;

    public function __construct()
    {
        $this->cliColor = new CliColor();
    }

    public function log($message)
    {
        echo self::colorizeLog("[ " . date("Y-m-d h-i-s") . " | log     ] - " . $message . PHP_EOL, 'black');
    }

    public function error($message)
    {
        echo self::colorizeLog("[ " . date("Y-m-d h-i-s") . " | ERROR   ] - " . $message . PHP_EOL, 'red');
    }

    public function warning($message)
    {
        echo self::colorizeLog("[ " . date("Y-m-d h-i-s") . " | ERROR   ] - " . $message . PHP_EOL, 'red');
    }

    public function info($message)
    {
        echo self::colorizeLog("[ " . date("Y-m-d h-i-s") . " | INFO    ] - " . $message . PHP_EOL, 'light_blue');
    }

    public function success($message)
    {
        echo self::colorizeLog("[ " . date("Y-m-d h-i-s") . " | SUCCESS ] - " . $message . PHP_EOL, 'light_green');
    }

    private function colorizeLog($message, $color)
    {
        return $this->cliColor->getColoredString($message, $color);
    }

    public function sendMessageToSlackChannel($messageArray)
    {
        if (is_array($messageArray)) {
            $message=null;
            $i = 1;
            foreach ($messageArray['message'] as  $item) {
                $message .=$i." - ". trim($item) . "\n";
                $i++;
            }

            $message = $messageArray['text'] . "\n" . $message;

        } else {
            $message = $messageArray;
        }

        $this->postMessageToSlack($message);
    }

    private function postMessageToSlack($message)
    {
        $ch = curl_init($this->slackUrl);
        $payload = json_encode(array("text" => "```".$message."```","username"=>'Career',"icon_emoji"=>":career-logo:"));
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        curl_close($ch);
    }
}
