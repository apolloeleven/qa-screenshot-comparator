/**
 * Created by zura on 3/28/18.
 */
const yargs = require('yargs');
const _cliProgress = require('cli-progress');
const path = require('path');
const logUpdate = require('log-update');
const winston = require('winston');

const conf = require('./src/conf');
const yargsConfig = require('./src/yargs-config');
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

let progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
const ROOT_PATH = path.dirname(require.main.filename);
const RUNTIME = `${ROOT_PATH}/runtime`;

for (let i in resolutions) {
    console.log(`Start generating screens for "${i}" from url "${argv.url}"`);
    let generator = new Generator({
        url: argv.url,
        generateSitemap: argv.generateSitemap,
        resolution: resolutions[i],
        resolutionName: i,
        runtime: RUNTIME,
        onUrlFound: function (data) {
            winston.log('info', `Grabbed url ${data.url}`);
            logUpdate(`☕☕ ${data.frame} Found ${data.foundUrlCount} urls. Current: ${data.url} ${data.frame} ☕☕`);
        },
        onUrlFindError: function (data) {
            winston.log('error', `Error in URL grab!!! Code: ${data.errorCode}. Message: "${data.message}". url ${data.url}`);
            logUpdate(`Error in URL grab!!! Code: ${data.errorCode}. Message: "${data.message}". url ${data.url}`);
        },
        onUrlFindFinish: function (data) {
            winston.log('info', `Totally grabbed ${data.foundUrlCount} urls`);
            logUpdate(`Finished finding urls for ${data.resolutionName}. Found: ${data.foundUrlCount}`)
        },
        onScreenshotGenerationStart: function (data) {
            progressBar.start(data.urlsCount, data.startIndex);
        },
        onScreenshotGenerationChange: function (data) {
            progressBar.update(data.currentUrlIndex);
        },
        onScreenshotGenerationFinish: function (data) {
            progressBar.stop();
            console.log(`Finished generating screenshots for ${data.resolutionName}.`)
        }
    });
    generator.run();
}