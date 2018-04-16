/**
 * Created by zura on 4/5/18.
 */
const path = require('path');
const yargs = require('yargs');

const argv = yargs
    .option('url', {
        demand: true,
        alias: 'u',
        describe: 'Please provide website url',
        string: true
    })
    .option('folder', {
        alias: 'f',
        describe: 'Folder in which the images will be saved',
        demand: false,
        string: true
    })
    .help('h')
    .alias('help', 'h')
    .argv
;

const WEBSITE_NAME = argv.folder || argv.url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');
const ROOT_PATH = path.dirname(require.main.filename);

module.exports = {
    PROJECT_ROOT: ROOT_PATH,
    WEBSITE_NAME: WEBSITE_NAME,
    RUNTIME: `${ROOT_PATH}/runtime/${WEBSITE_NAME}`
};