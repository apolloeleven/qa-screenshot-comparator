/**
 * Created by zura on 4/4/18.
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const Sitemap = require('./src/sitemap-generator');
const yargs = require('./src/cli-validator');
const argv = yargs.argv;

async function init() {
    console.time("Screenshot generation");
    let urls = await Sitemap.generate(argv.url, argv.generateSitemap);
    console.log("Start promise1");
    let promise1 = exec(`node app.js -u ${argv.url} -s=desktop -l=${argv.language}`);
    console.log("Start promise2");
    let promise2 = exec(`node app.js -u ${argv.url} -s=laptop -l=${argv.language}`);
    console.log("Start promise3");
    let promise3 = exec(`node app.js -u ${argv.url} -s=tablet -l=${argv.language}`);
    console.log("Start promise4");
    let promise4 = exec(`node app.js -u ${argv.url} -s=mobile -l=${argv.language}`);

    Promise.all([
        promise1,
        promise2,
        promise3,
        promise4
    ]).then(() => {
        console.log("All screenshots have been successfully generated");
        console.timeEnd("Screenshot generation");
    });
}

init();