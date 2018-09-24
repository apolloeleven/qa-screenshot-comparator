/**
 * Created by zura on 4/5/18.
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports.isTheSame = isTheSame;

function isTheSame(expectedImage, originalImage, outputPath) {
    return exec(`php index-single.php ${expectedImage} ${originalImage} ${outputPath}`);
}
