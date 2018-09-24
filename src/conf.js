/**
 * Created by zura on 4/5/18.
 */
const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs');

let env;
try {
    env = require('../env');
} catch (ex) {
    env = {
        httpBasicAuth: false,
        httpBasicAuthUsername: '',
        httpBasicAuthPassword: ''
    }
}



const yargsConfig = require('./yargs-config');

yargsConfig.folder = {
    alias: 'f',
    describe: 'Folder in which the images will be saved',
    demand: false,
    string: true
};
const argv = yargs
    .options(yargsConfig)
    .help('h')
    .alias('help', 'h')
    .argv
;

const WEBSITE_NAME = argv.folder || argv.url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');
const ROOT_PATH = path.dirname(require.main.filename);

const RUNTIME = `${ROOT_PATH}/runtime`;
let SITES_FOLDER = `${RUNTIME}/websites/${WEBSITE_NAME}`;

fs.ensureDirSync(SITES_FOLDER);

module.exports = {
    PROJECT_ROOT: ROOT_PATH,
    WEBSITE_NAME: WEBSITE_NAME,
    SITES_FOLDER: SITES_FOLDER,
    RUNTIME: RUNTIME,
    HTTP_BASIC_AUTH: env.httpBasicAuth,
    HTTP_BASIC_AUTH_USERNAME: env.httpBasicAuthUsername,
    HTTP_BASIC_AUTH_PASSWORD: env.httpBasicAuthPassword,
};