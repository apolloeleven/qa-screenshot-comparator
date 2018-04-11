<?php
/**
 * User: zura
 * Date: 3/2/18
 * Time: 6:53 PM
 */

require "ImageCompare.php";
require "Logger.php";


$logger = new Logger();
if (!isset($argv[1]) || !isset($argv[2]) || !isset($argv[3])) {
    exit("Please provide both images and output path to compare");
}

$image1 = new ImageCompare($argv[1], $argv[3]);
$image2 = new ImageCompare($argv[2], $argv[3]);

try {
    $result = $image1->compare($image2);
    if ($result) {
        $logger->success("Images are the same");
    } else {
        $logger->warning("Images are different: " . $image1->getMessage());
    }
} catch (\Exception $e) {
    exit($e->getMessage() . PHP_EOL);
}

