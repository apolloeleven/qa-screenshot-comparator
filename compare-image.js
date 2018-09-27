/**
 * Created by zura on 4/5/18.
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports.isTheSame = isTheSame;

function isTheSame(expectedImage, originalImage, outputPath) {
    const phpFile = __dirname + '/index-single.php';
    return exec(`php ${phpFile} ${expectedImage} ${originalImage} ${outputPath}`);
}
