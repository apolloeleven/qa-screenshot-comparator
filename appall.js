/**
 * Created by zura on 4/4/18.
 */
const fs = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const yargsConfig = require('./src/yargs-config');
const yargs = require('yargs');
const _ = require('underscore');
const conf = require('./src/conf');
const Sitemap = require('./src/sitemap-generator');

const argv = yargs
    .options(yargsConfig)
    .help('h')
    .alias('help', 'h')
    .argv;

let sizes = argv.size;
if (!argv.size){
    sizes = sizes = ['desktop', 'laptop', 'mobile', 'tablet'];
}
sizes = _.isArray(sizes) ? sizes : [sizes];
const startUrls = _.isArray(argv.url) ? argv.url : [argv.url];
const languages = _.isArray(argv.language) ? argv.language : [argv.language];

if (startUrls.length !== languages.length) {
    console.error(`You must provide the same number of "language" and "url"`);
    return;
}
const RUNTIME = conf.RUNTIME;
fs.ensureDirSync(RUNTIME);

async function init() {
    let promises = [];
    console.time("Screenshot generation");

    for (let i = 0; i < startUrls.length; i++) {
        let url = startUrls[i];
        let language = languages[i];
        // Generate sitemap once and cache it. It will be used from cache by calling `node app.js` command
        await Sitemap.generate(url, argv.generateSitemap, language);
        for (let size of sizes) {
            console.log(`Start generating screens for "${size}" from url "${url}" in folder ${language}`);
            let promise = exec(`node app.js -u ${url} -s=${size} -l=${language}`);
            // promise.then((result) => {
            //     console.log(result);
            // });
            promises.push(promise);
        }
    }
    Promise.all(promises).then(() => {
        console.log("All screenshots have been successfully generated");
        console.timeEnd("Screenshot generation");
    });
}

init();