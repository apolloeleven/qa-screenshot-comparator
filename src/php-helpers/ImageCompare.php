<?php
/**
 * User: zura
 * Date: 3/5/18
 * Time: 5:02 PM
 */

/**
 * Class ImageCompare
 *
 * @author Zura Sekhniashvili <zurasekhniashvili@gmail.com>
 * @package ${NAMESPACE}
 */
class ImageCompare
{
    private $resource = null;
    private $width;
    private $height;
    private $imagePath = null;
    private $outputPath = null;

    private $message = '';

    const LINE_THICKNESS = 2;

    public function __construct($imagePath, $outputPath)
    {
        $this->imagePath = $imagePath;
        $this->outputPath = $outputPath;
        $this->resource = imagecreatefrompng($imagePath);
        $this->width = imagesx($this->resource);
        $this->height = imagesy($this->resource);
    }

    /**
     *
     *
     * @author Zura Sekhniashvili <zurasekhniashvili@gmail.com>
     * @param ImageCompare $image
     * @return bool
     * @throws Exception
     */
    public function compare(ImageCompare $image)
    {
        global $logger;
        $similarPixels = 0;
        $thisWidth = imagesx($this->resource);
        $thisHeight = imagesy($this->resource);
        $resource = $image->getResource();
        $anotherWidth = imagesx($resource);
        $anotherHeight = imagesy($resource);

        if ($thisWidth != $anotherWidth) {
            throw new Exception("Images have different widths");
        }

        $pathInfo = pathinfo($this->imagePath);
        $stableFile = $this->outputPath . '/' . $pathInfo['filename'] . '_stable.' . $pathInfo['extension'];
        $newFile = $this->outputPath . '/' . $pathInfo['filename'] . '_new.' . $pathInfo['extension'];

//        if ($thisHeight != $anotherHeight) {
//            imagepng($this->resource, $stableFile);
//            imagepng($resource, $newFile);
//            throw new Exception("Images have different heights");
//        }

//        return imagecolorat($this->resource, $x, $y) === imagecolorat($image->getResource(), $x, $y);
//        $rgb = imagecolorat($this->resource, 0, 0);
//        $r = ($rgb >> 16) & 0xFF;
//        $g = ($rgb >> 8) & 0xFF;
//        $b = $rgb & 0xFF;
//        var_dump($r, $g, $b, imagecolorat($this->resource, 0, 0));
//
//        $rgb2 = imagecolorat($resource, 0, 0);
//        $r = ($rgb2 >> 16) & 0xFF;
//        $g = ($rgb2 >> 8) & 0xFF;
//        $b = $rgb2 & 0xFF;
//        var_dump($r, $g, $b, imagecolorat($resource, 0, 0));
//        echo (substr($image->getLineAsString(0), 0, 300)).PHP_EOL;
//        echo (substr($this->getLineAsString(0), 0, 300)).PHP_EOL;
        $secondImageMap = [];
        for ($y = 0; $y < $anotherHeight; $y++) {
            $string = $image->getLineAsString($y);
            if (!isset($secondImageMap[$string])) {
                $secondImageMap[$string] = [];
            }
            $secondImageMap[$string][] = $y;
        }
//        $logger->log("Converted second image into hashmap");

        $changedAreas = [];
        $numberOfLatestSimilarLines = 0;
        $lastLineOfSimilarity = -1;
        for ($y = 0; $y < $thisHeight; $y++) {
            $thisLine = $this->getLineAsString($y);
            if (isset($secondImageMap[$thisLine])) {
                $numberOfLatestSimilarLines++;
                $offset = 0;
                $secondImageY = $secondImageMap[$thisLine][$offset];
                if ($numberOfLatestSimilarLines >= 100) {
                    while ($offset < count($secondImageMap[$thisLine]) && $secondImageMap[$thisLine][$offset] < $lastLineOfSimilarity) {
                        array_splice($secondImageMap[$thisLine], $offset, 1);
                    }
                    $lastLineOfSimilarity = $secondImageY;
                }
                if (isset($secondImageMap[$thisLine][$offset])) {
                    $changedAreas[$y] = $secondImageMap[$thisLine][$offset];
                    array_splice($secondImageMap[$thisLine], $offset, 1);
                }
                if (empty($secondImageMap[$thisLine])) {
                    unset($secondImageMap[$thisLine]);
                }
            } else {
                $numberOfLatestSimilarLines = 0;
                $changedAreas[$y] = -1;
            }
        }

        $font = __DIR__ . '/Roboto-Regular.ttf';
        $red = imagecolorallocate($resource, 255, 0, 0);

        $isTheSame = true;
        imagesetthickness($resource, self::LINE_THICKNESS);
//        var_dump(array_values($secondImageMap));
        if (!empty($secondImageMap)) {

            $drawPositions = [];
            $additions = call_user_func_array('array_merge', array_values($secondImageMap));

            $startY = $additions[0];
            for ($i = 1; $i < count($additions); $i++) {
                if ($additions[$i] - 20 > $additions[$i - 1]) {
                    $endY = $additions[$i - 1];
                    $drawPositions[] = [
                        'startY' => $startY,
                        'endY' => $endY
                    ];
                    $startY = $additions[$i];
                }
            }
            $endY = $additions[count($additions) - 1];
            $drawPositions[] = [
                'startY' => $startY,
                'endY' => $endY
            ];

            usort($drawPositions, function($position1, $position2){
                return $position1['startY'] - $position2['startY'];
            });

//            var_dump($drawPositions);
            foreach ($drawPositions as $i => $drawPosition) {
                imagerectangle($resource, 10, $drawPosition['startY'], $anotherWidth - 10, $drawPosition['endY'], $red);
                imagettftext($resource, 20, 0, 10, $drawPosition['startY'] - 5, $red, $font, $i + 1);
            }
            if (!empty($drawPositions)) {
                $isTheSame = false;
                if (!file_exists(dirname($newFile))){
                    mkdir(dirname($newFile), 0777, true);
                }
                imagepng($resource, $newFile);
            }
        }
//        $changedAreas = array_filter($changedAreas, function ($position) {
//            return $position === -1;
//        });


        $additions = [];
        foreach ($changedAreas as $y => $position) {
            if ($position === -1){
                $additions[] = $y;
            }
        }

        $drawPositions = [];
        if (!empty($additions)) {
            $startY = $additions[0];
            for ($i = 1; $i < count($additions); $i++) {
                if ($additions[$i] - 20 > $additions[$i - 1]) {
                    $endY = $additions[$i - 1];
                    $drawPositions[] = [
                        'startY' => $startY,
                        'endY' => $endY
                    ];
                    $startY = $additions[$i];
                }
            }
            $endY = $additions[count($additions) - 1];
            $drawPositions[] = [
                'startY' => $startY,
                'endY' => $endY
            ];

            usort($drawPositions, function($position1, $position2){
                return $position1['startY'] - $position2['startY'];
            });
        }

        imagesetthickness($this->resource, self::LINE_THICKNESS);
        foreach ($drawPositions as $i => $drawPosition) {
            imagerectangle($this->resource, 10, $drawPosition['startY'], $thisWidth - 10, $drawPosition['endY'], $red);
            imagettftext($this->resource, 20, 0, 10, $drawPosition['startY'] - 5, $red, $font, $i + 1);
        }
        if (!empty($drawPositions)) {
            $isTheSame = false;

            if (!file_exists(dirname($stableFile))){
                mkdir(dirname($stableFile), 0777, true);
            }
            imagepng($this->resource, $stableFile);
        }

//        if (!empty($drawPositions)){
//            var_dump($drawPositions);
//        }

//        $logger->log("Comparison finished. Images are " . ($isTheSame ? 'the same' : 'different'));

//        $firstX = 0;
//        $secondX = 0;
//        $firstY = 0;
//        $secondY = 0;
//
//        while ($firstX < $thisWidth && $secondX < $anotherWidth && $firstY < $thisHeight && $secondY < $anotherHeight) {
//            if ($this->compareHorizontalLines($image, $firstX, $secondX) === 100) {
//                $similarPixels++;
//                $firstX++;
//                $secondX++;
//            }
//        }

        return $isTheSame;
//        if ($similarPixels === $thisWidth * $thisHeight) {
//            return true;
//        }
//
//        $this->message = "Images are similar with " . ($similarPixels / ($thisHeight * $thisWidth) * 100) . '%';
//        return false;
    }

    /**
     * Detect how similar are two lines
     *
     * @author Zura Sekhniashvili <zurasekhniashvili@gmail.com>
     * @param ImageCompare $image
     * @param $firstX
     * @param $secondX
     * @return float|int
     */
    public function compareHorizontalLines(ImageCompare $image, $firstX, $secondX)
    {
        $thisHeight = imagesy($this->resource);
        $similarPixels = 0;
        for ($y = 0; $y < $thisHeight; $y++) {
            if (imagecolorat($this->resource, $firstX, $y) === imagecolorat($image->getResource(), $secondX, $y)) {
                $similarPixels++;
            }
        }

        return $similarPixels / $thisHeight * 100;
    }

    public function getLineAsString($y)
    {
        $resource = $this->resource;
        $thisWidth = imagesx($resource);
        $pixels = [];
        for ($x = 0; $x < $thisWidth; $x++) {
            $rgb = imagecolorat($resource, $x, $y);
            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >> 8) & 0xFF;
            $b = $rgb & 0xFF;
            $pixels[] = $rgb;
//            var_dump("$rgb ($r, $g, $b)");
        }
        return implode("_", $pixels);
    }

    public function comparePixel(ImageCompare $image, $x, $y)
    {
        var_dump(imagecolorat($this->resource, $x, $y));
//        var_dump(imagecolorat($image->getResource(), $x, $y));
        return imagecolorat($this->resource, $x, $y) === imagecolorat($image->getResource(), $x, $y);
        $rgb = imagecolorat($this->resource, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
    }

    public function getResource()
    {
        return $this->resource;
    }

    public function getMessage()
    {
        return $this->message;
    }
}