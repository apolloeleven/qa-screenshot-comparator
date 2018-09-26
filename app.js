/**
 * Created by zura on 3/28/18.
 */
const yargs = require('yargs');
const conf = require('./src/conf');
const yargsConfig = require('./src/yargs-config');
const path = require('path');
const Generator = require('./generator');

let resolutions = [];
const argv = yargs
    .options(yargsConfig)
    .help('h')
    .alias('help', 'h')
    .argv;

if (argv.size !== 'all') {
    resolutions[argv.size] = conf.SCREEN_RESOLUTIONS[argv.size];
} else {
    resolutions = conf.SCREEN_RESOLUTIONS;
}

const ROOT_PATH = path.dirname(require.main.filename);
const RUNTIME = `${ROOT_PATH}/runtime`;

for (let i in resolutions) {
    console.log(`Start generating screens for "${i}" from url "${argv.url}"`);
    let generator = new Generator({
        url: argv.url,
        generateSitemap: argv.generateSitemap,
        resolution: resolutions[i],
        withProgressBar: true,
        resolutionName: i,
        runtime: RUNTIME
    });
    generator.run();
}