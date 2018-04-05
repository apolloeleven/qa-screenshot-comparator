/**
 * Created by zura on 4/5/18.
 */

const fs = require('fs'),
    PNG = require('pngjs').PNG,
    pixelmatch = require('pixelmatch');

let img1 = fs.createReadStream('/var/www/html/image-compare/stable/de/desktop/career-de-car1411-intermundia-de-de-kontakt-kontakt.png').pipe(new PNG()).on('parsed', doneReading),
    img2 = fs.createReadStream('/var/www/html/image-compare/20180330/de/desktop/career-de-car1411-intermundia-de-de-kontakt-kontakt.png').pipe(new PNG()).on('parsed', doneReading),
    filesRead = 0;

function doneReading() {
    if (++filesRead < 2) return;
    const diff = new PNG({width: img1.width, height: img1.height});

    pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: 0});

    diff.pack().pipe(fs.createWriteStream('diff.png'));
}