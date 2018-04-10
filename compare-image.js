/**
 * Created by zura on 4/5/18.
 */

const fs = require('fs-extra'),
    PNG = require('pngjs').PNG,
    path = require('path');
    pixelmatch = require('pixelmatch');

const ImageCompare = require('./src/image-comparator');

module.exports.isTheSame = isTheSame;

function isTheSame(expectedImage, originalImage, outputImage) {
    return new Promise((resolve, reject) => {

        let imageComparator = new ImageCompare(expectedImage, originalImage);
        // imageComparator.compare();

    });
}

//
isTheSame('5hueFdG.png',
    '/var/www/html/image-compare/20180330/de/desktop/career-de-car1411-intermundia-de.png',
    'career-de-car1411-intermundia-de.png');
//
// isTheSame('/var/www/html/image-compare/stable/de/desktop/career-de-car1411-intermundia-de-de-kontakt-kontakt.png',
//     '/var/www/html/image-compare/20180330/de/desktop/career-de-car1411-intermundia-de-de-kontakt-kontakt.png',
//     'difference.png');


// let img1 = fs.createReadStream('/var/www/html/image-compare/stable/de/desktop/career-de-car1411-intermundia-de-de-kontakt-kontakt.png').pipe(new PNG()).on('parsed', doneReading),
//     img2 = fs.createReadStream('/var/www/html/image-compare/20180330/de/desktop/career-de-car1411-intermundia-de-de-kontakt-kontakt.png').pipe(new PNG()).on('parsed', doneReading),
//     filesRead = 0;
//
// function doneReading() {
//     if (++filesRead < 2) return;
//     const diff = new PNG({width: img1.width, height: img1.height});
//
//     pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: 0});
//
//     diff.pack().pipe(fs.createWriteStream('diff.png'));
// }