/**
 * Created by zura on 4/5/18.
 */
const fs = require('fs-extra');
const path = require('path');
const getPixels = require("get-pixels");
const Jimp = require("jimp");
const gm = require('gm').subClass({imageMagick: true});
const conf = require('./conf');

function ImageCompare(imagePath, outputPath) {

    this.LINE_THICKNESS = 1;

    this.constructor(imagePath, outputPath);
}

ImageCompare.prototype = {
    constructor: async function ($imagePath, $outputPath) {
        this.imagePath = $imagePath;
        this.outputPath = $outputPath;
        this.onReady = () => {
        };
        // this.resource = imagecreatefrompng($imagePath);
        // this.width = imagesx(this.resource);
        // this.height = imagesy(this.resource);


        const {WIDTH, HEIGHT, DEPTH, pixels} = await this.getImageData($imagePath);
        this.pixels = [];
        let myPixels = pixels.data;

        let k = 0;
        for (let j = 0; j < HEIGHT; j++) {
            let row = [];
            for (let i = 0; i < WIDTH; i++) {
                let pixelColor = this.getPixelColor(myPixels[k], myPixels[k + 1], myPixels[k + 2], (DEPTH === 4 ? myPixels[k + 3] : null));
                row[i] = pixelColor;
                k += DEPTH;
            }
            this.pixels[j] = row;
        }

        // console.log(this);

        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;
        if (this.onReady && typeof this.onReady === 'function') {
            this.onReady(WIDTH, HEIGHT, DEPTH, pixels);
        }
    },

    getPixelColor: function (r, g, b, a) {
        const shiftBy = a ? 4 : 3;
        const color = (r << 8 * (shiftBy - 1))
            + (g << 8 * (shiftBy - 2))
            + (b << 8 * (shiftBy - 3))
            + (a << 8 * (shiftBy - 4))
        ;
        return `${r}$${g}$${b}$${a}`;
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

                // console.log("read111111111111111 ", pixels.data);
                resolve({WIDTH, HEIGHT, DEPTH, pixels});
            });
        });
    },

    /**
     *
     *
     * @author Zura Sekhniashvili <zurasekhniashvili@gmail.com>
     * @return bool
     * @throws Exception
     * @param {ImageCompare} current
     */
    compare: function (current) {
        let $similarPixels = 0;
        const $thisWidth = this.WIDTH;
        const stableHeight = this.HEIGHT;
        const $anotherWidth = current.WIDTH;
        const currentHeight = current.HEIGHT;

        if ($thisWidth !== $anotherWidth) {
            throw new Error("Images have different widths");
        }

        let ext = path.extname(this.imagePath);
        const newFilePrefix = `${this.outputPath}/${path.basename(this.imagePath, ext)}`;
        let $stableFile = `${newFilePrefix}_stable${ext}`;
        let $newFile = `${newFilePrefix}_current${ext}`;

        let currentImageMap = {};
        for (let y = 0; y < currentHeight; y++) {
            const line = current.pixels[y].join('_');
            if (!currentImageMap[line]) {
                currentImageMap[line] = [];
            }
            currentImageMap[line].push(y);
        }

        // console.log(JSON.stringify(currentImageMap, undefined, 2));

        const $changedAreas = [];
        let $numberOfLatestSimilarLines = 0;
        let $lastLineOfSimilarity = -1;
        for (let y = 0; y < stableHeight; y++) {
            const stableLine = this.pixels[y].join('_');
            if (currentImageMap[stableLine]) {
                $numberOfLatestSimilarLines++;
                let $offset = 0;
                let $secondImageY = currentImageMap[stableLine][$offset];
                if ($numberOfLatestSimilarLines >= 100) {
                    while ($offset < currentImageMap[stableLine].length && currentImageMap[stableLine][$offset] < $lastLineOfSimilarity) {
                        currentImageMap[stableLine].splice($offset, 1);
                    }
                    $lastLineOfSimilarity = $secondImageY;
                }
                if (currentImageMap[stableLine][$offset]) {
                    $changedAreas[y] = currentImageMap[stableLine][$offset];
                    currentImageMap[stableLine].splice($offset, 1);
                }
                if (!currentImageMap[stableLine].length) {
                    delete currentImageMap[stableLine];
                }
            } else {
                $numberOfLatestSimilarLines = 0;
                $changedAreas[y] = -1;
            }
        }

        // console.log(currentImageMap);
        // return;
        // $font = __DIR__.'/Roboto-Regular.ttf';
        // let $red = imagecolorallocate($resource, 255, 0, 0);

        let $isTheSame = true;
        // imagesetthickness($resource, this.LINE_THICKNESS);
//        var_dump(array_values($secondImageMap));
        if (Object.keys(currentImageMap).length) {

            let $drawPositions = [];
            const $additions = [].concat.apply([], Object.values(currentImageMap));

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
                'endY': $endY
            });

            $drawPositions.sort(function ($position1, $position2) {
                return $position1['startY'] - $position2['startY'];
            });

            if ($drawPositions.length) {
                $isTheSame = false;
                fs.copySync(current.imagePath, $newFile);
                // imagepng($resource, $newFile);
            }
            // console.log($drawPositions, $anotherWidth);
            for (let $drawPosition of $drawPositions) {
                drawRectangle($newFile, 10, $drawPosition['startY'], $anotherWidth - 10, $drawPosition['endY'], '#FF0000', this.LINE_THICKNESS);
                // gm($stableFile).drawRectangle(10, $drawPosition['startY'], $anotherWidth - 10, $drawPosition['endY']);
                // imagerectangle($resource, 10, $drawPosition['startY'], $anotherWidth - 10, $drawPosition['endY'], $red);
                // imagettftext($resource, 20, 0, 10, $drawPosition['startY'] - 5, $red, $font, $i + 1);
            }
        }
//        $changedAreas = array_filter($changedAreas, function ($position) {
//            return $position === -1;
//        });


        let $additions = [];
        for (let $y in $changedAreas) {
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
                    const $endY = $additions[$i - 1];
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


        if ($drawPositions.length) {
            $isTheSame = false;
            fs.copySync(this.imagePath, $stableFile);
        }
        // imagesetthickness(this.resource, self::LINE_THICKNESS);
        for (let $drawPosition of $drawPositions) {
            // drawRectangle($stableFile, 10, $drawPosition['startY'], $anotherWidth - 10, $drawPosition['endY'], '#FF0000', this.LINE_THICKNESS);
            // imagerectangle(this.resource, 10, $drawPosition['startY'], $thisWidth - 10, $drawPosition['endY'], $red);
            // imagettftext(this.resource, 20, 0, 10, $drawPosition['startY'] - 5, $red, $font, $i + 1);
        }

//        if (!empty($drawPositions)){
//            var_dump($drawPositions);
//        }

        console.log("Comparison finished. Images are " + ($isTheSame ? 'the same' : 'different'));

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
    },

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

// let image = `/home/zura/NODE/sitemap-generator/runtime/de/desktop/career-de-car1411-intermundia-de.png`;
// console.log(image);

function drawRectangle(file, x0, y0, x1, y1, color, width) {

    gm(file)
        .stroke(color, width)
        .fill('transparent')
        .drawRectangle(x0, y0, x1, y1)


        // .resize(240, 240)
        // .noProfile()
        .write(file, function (err) {
            if (err) console.log(err);
        })
    ;
}

