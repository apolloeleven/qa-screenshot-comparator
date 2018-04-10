/**
 * Created by zura on 4/5/18.
 */
const path = require('path');
const getPixels = require("get-pixels");
const conf = require('./conf');

function Pixel(r, g, b, a) {
    const shiftBy = a ? 4 : 3;
    this.red = r;
    this.green = g;
    this.blue = b;
    this.alpha = a;
    this.colorRat = this.getColorRat();

    this.getColorRat = () => {
        return r << 8 * (shiftBy - 1)
            + g << 8 * (shiftBy - 2)
            + b << 8 * (shiftBy - 3)
            + a << 8 * (shiftBy - 4)
    };
}

function ImageCompare(imagePath, outputPath) {

    const LINE_THICKNESS = 2;

    this.constructor(imagePath, outputPath);
    console.log("");
}

ImageCompare.prototype = {
    constructor: async function ($imagePath, $outputPath) {
        this.imagePath = $imagePath;
        this.outputPath = $outputPath;
        // this.resource = imagecreatefrompng($imagePath);
        // this.width = imagesx(this.resource);
        // this.height = imagesy(this.resource);


        const {WIDTH, HEIGHT, DEPTH, pixels} = await this.getImageData($imagePath);

        this.pixels = [];
        let myPixels = pixels.data;

        let k = 0;
        for (let i = 0; i < WIDTH; i++) {
            let row = [];
            for (let j = 0; j < HEIGHT; j++) {
                let pixel = new Pixel(myPixels[k], myPixels[k + 1], myPixels[k + 2], (DEPTH === 4 ? myPixels[k + 3] : null));
                row.push(pixel);
                k += DEPTH;
            }
            this.pixels[i] = row;
        }

        console.log(this.pixels);

        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
    },

    getLineAsString: function (y) {
        const pixels = [];
        for (let x = 0; x < this.WIDTH; x++) {
            pixels.push(this.pixels[x][y].colorRat);
        }
        return pixels.join("_");
    },

    getImageData: (imagePath) => {
        return new Promise((resolve, reject) => {
            getPixels(imagePath, function (err, pixels) {
                if (err) {
                    console.log("Bad image path");
                    return
                }
                const WIDTH = pixels.shape[0];
                const HEIGHT = pixels.shape[1];
                const DEPTH = pixels.shape[2];

                resolve({WIDTH, HEIGHT, DEPTH, pixels});
            });
        });
    },

    /**
     *
     *
     * @author Zura Sekhniashvili <zurasekhniashvili@gmail.com>
     * @param ImageCompare $image
     * @return bool
     * @throws Exception
     */
    compare: function ($image) {
        $similarPixels = 0;
        const $thisWidth = this.WIDTH;
        const $thisHeight = this.HEIGHT;
        const $anotherWidth = $image.WIDTH;
        const $anotherHeight = $image.HEIGHT;

        if ($thisWidth !== $anotherWidth) {
            throw new Error("Images have different widths");
        }

        let ext = path.extname(this.imagePath);
        const newFilePrefix = ${this.outputPath}/${path.basename(this.imagePath, ext)};
        let $stableFile = `${newFilePrefix}_stable${ext}`;
        let $newFile = `${newFilePrefix}_new${ext}`;

        let $secondImageMap = {};
        for (let y = 0; y < $anotherHeight; y++) {
            const $string = $image.getLineAsString(y);
            if (!$secondImageMap[$string]) {
                $secondImageMap[$string] = [];
            }
            $secondImageMap[$string].push(y);
        }

        const $changedAreas = [];
        let $numberOfLatestSimilarLines = 0;
        let $lastLineOfSimilarity = -1;
        for (let y = 0; y < $thisHeight; y++) {
            const $thisLine = this.getLineAsString(y);
            if ($secondImageMap[$thisLine]) {
                $numberOfLatestSimilarLines++;
                let $offset = 0;
                let $secondImageY = $secondImageMap[$thisLine][$offset];
                if ($numberOfLatestSimilarLines >= 100) {
                    while ($offset < $secondImageMap[$thisLine].length && $secondImageMap[$thisLine][$offset] < $lastLineOfSimilarity) {
                        $secondImageMap[$thisLine].splice($offset, 1);
                    }
                    $lastLineOfSimilarity = $secondImageY;
                }
                if ($secondImageMap[$thisLine][$offset]) {
                    $changedAreas[y] = $secondImageMap[$thisLine][$offset];
                    $secondImageMap[$thisLine].splice($offset, 1);
                }
                if (!$secondImageMap[$thisLine].length) {
                    delete $secondImageMap[$thisLine];
                }
            } else {
                $numberOfLatestSimilarLines = 0;
                $changedAreas[y] = -1;
            }
        }

        // $font = __DIR__.'/Roboto-Regular.ttf';
        let $red = imagecolorallocate($resource, 255, 0, 0);

        let $isTheSame = true;
        imagesetthickness($resource, this.LINE_THICKNESS);
//        var_dump(array_values($secondImageMap));
        if ($secondImageMap.length) {

            let $drawPositions = [];
            const $additions = [].concat.apply([], Object.values($secondImageMap));

            let $startY = $additions[0];
            for (let $i = 1; $i < $additions.length; $i++) {
                if ($additions[$i] - 20 > $additions[$i - 1]) {
                    let $endY = $additions[$i - 1];
                    $drawPositions.push({
                        'startY': $startY,
                        'endY': $endY
                    });
                    $startY = $additions[$i];
                }
            }
            let $endY = $additions[$additions.length - 1];
            $drawPositions.push({
                'startY': $startY,
                'endY':$endY
            })
            ;

            $drawPositions.sort(function ($position1, $position2) {
                return $position1['startY'] - $position2['startY'];
            });

//            var_dump($drawPositions);
            for (let $drawPosition of $drawPositions)
            {
                // imagerectangle($resource, 10, $drawPosition['startY'], $anotherWidth - 10, $drawPosition['endY'], $red);
                // imagettftext($resource, 20, 0, 10, $drawPosition['startY'] - 5, $red, $font, $i + 1);
            }
            if ($drawPositions.length) {
                $isTheSame = false;
                // imagepng($resource, $newFile);
            }
        }
//        $changedAreas = array_filter($changedAreas, function ($position) {
//            return $position === -1;
//        });


        let $additions = [];
        for(let $y in $changedAreas)
        {
            let $position = $changedAreas[$y];
            if ($position === -1) {
                $additions.push($y);
            }
        }

        let $drawPositions = [];
        if ($additions.length) {
            let $startY = $additions[0];
            for (let $i = 1; $i < $additions.length; $i++) {
                if ($additions[$i] - 20 > $additions[$i - 1]) {
                    $endY = $additions[$i - 1];
                    $drawPositions.push({
                        'startY': $startY,
                        'endY': $endY
                    });
                    $startY = $additions[$i];
                }
            }
            let $endY = $additions[$additions.length - 1];
            $drawPositions.push({
                'startY': $startY,
                'endY': $endY
            });

            $drawPositions.sort(($position1, $position2) => {
                return $position1['startY'] - $position2['startY'];
            });
        }

        // imagesetthickness(this.resource, self::LINE_THICKNESS);
        // for(let $i in $drawPositions){
        //     let $drawPosition = $drawPositions[$i];
        //     imagerectangle(this.resource, 10, $drawPosition['startY'], $thisWidth - 10, $drawPosition['endY'], $red);
        //     imagettftext(this.resource, 20, 0, 10, $drawPosition['startY'] - 5, $red, $font, $i + 1);
        // }
        // if ($drawPositions.length) {
        //     $isTheSame = false;
        //     imagepng(this.resource, $stableFile);
        // }

//        if (!empty($drawPositions)){
//            var_dump($drawPositions);
//        }

        // $logger->log("Comparison finished. Images are ".($isTheSame ? 'the same' : 'different'));

// //        $firstX = 0;
// //        $secondX = 0;
// //        $firstY = 0;
// //        $secondY = 0;
// //
// //        while ($firstX < $thisWidth && $secondX < $anotherWidth && $firstY < $thisHeight && $secondY < $anotherHeight) {
// //            if (this.compareHorizontalLines($image, $firstX, $secondX) === 100) {
// //                $similarPixels++;
// //                $firstX++;
// //                $secondX++;
// //            }
// //        }
//
//         return $isTheSame;
// //        if ($similarPixels === $thisWidth * $thisHeight) {
// //            return true;
// //        }
// //
// //        this.message = "Images are similar with " . ($similarPixels / ($thisHeight * $thisWidth) * 100) . '%';
// //        return false;
        }
    ,

        /**
         * Detect how similar are two lines
         *
         * @author Zura Sekhniashvili <zurasekhniashvili@gmail.com>
         * @param ImageCompare $image
         * @param $firstX
         * @param $secondX
         * @return float|int
         */
        // compareHorizontalLines: function ($image, $firstX, $secondX) {
        //     $thisHeight = imagesy(this.resource);
        //     $similarPixels = 0;
        //     for ($y = 0; $y < $thisHeight; $y++) {
        //         if (imagecolorat(this.resource, $firstX, $y) === imagecolorat($image->getResource(), $secondX, $y)) {
        //             $similarPixels++;
        //         }
        //     }
        //
        //     return $similarPixels / $thisHeight * 100;
        // },

        // getLineAsString: function ($y) {
        //     $resource = this.resource;
        //     $thisWidth = imagesx($resource);
        //     let $pixels = [];
        //     for ($x = 0; $x < $thisWidth; $x++) {
        //         $pixels[] = imagecolorat($resource, $x, $y);
        //     }
        //     return $pixels.join("_");
        // },

//     comparePixel: function ($image, $x, $y) {
// //        var_dump(imagecolorat(this.resource, $x, $y));
// //        var_dump(imagecolorat($image->getResource(), $x, $y));
//         return imagecolorat(this.resource, $x, $y) === imagecolorat($image->getResource(), $x, $y);
//         $rgb = imagecolorat(this.resource, $x, $y);
//         $r = ($rgb >> 16) & 0xFF;
//         $g = ($rgb >> 8) & 0xFF;
//         $b = $rgb & 0xFF;
//     },

        // getResource: function () {
        //     return this.resource;
        // },

        // getMessage: function () {
        //     return this.message;
        // }
    }

    module.exports = ImageCompare;

let image = `/home/zura/NODE/sitemap-generator/runtime/de/desktop/career-de-car1411-intermundia-de.png`;
console.log(image);
