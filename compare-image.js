/**
 * Created by zura on 4/5/18.
 */

const fs = require('fs-extra'),
    PNG = require('pngjs').PNG,
    path = require('path');
    pixelmatch = require('pixelmatch');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const gm = require('gm').subClass({imageMagick: true});

const ImageCompare = require('./src/image-comparator');

module.exports.isTheSame = isTheSame;

function isTheSame(expectedImage, originalImage, outputPath) {
    return exec(`php index-single.php ${expectedImage} ${originalImage} ${outputPath}`);
    return new Promise(async (resolve, reject) => {


        let stable = new ImageCompare(originalImage, outputPath);
        let current = new ImageCompare(originalImage, outputPath);
        let counter = 0;
        stable.onReady = () => {
            counter++;
            compare();
        };
        current.onReady = () => {
            counter++;
            compare();
        };


        function compare(){
            if (counter > 1){
                stable.compare(current);
            }
        }
    });
}

// gm('2_s.png')
//     .stroke('#FF0000', 2)
//     .fill('transparent')
//     .drawRectangle(100, 150, 200, 300)
//
//
//     // .resize(240, 240)
//     // .noProfile()
//     .write('2_o.png', function (err) {
//       if (!err) console.log('done');
//     })
// ;
// isTheSame('/home/zura/NODE/sitemap-generator/runtime_old/stable/de/desktop/career-de-car1411-intermundia-de-de-aktuelles-termine.png',
//     '/home/zura/NODE/sitemap-generator/runtime_old/current/de/desktop/career-de-car1411-intermundia-de-de-aktuelles-termine.png', './')
//     .then((result) => {
//         console.log(result);
//     });
// isTheSame('2_n.png','2_s.png', './')
//     .then((result) => {
//         console.log(result);
//     });


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