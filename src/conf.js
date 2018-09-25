/**
 * Created by zura on 4/5/18.
 */
const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs');
const yargsConfig = require('./yargs-config');

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

const argv = yargs
    .options(yargsConfig)
    .help('h')
    .alias('help', 'h')
    .argv;

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
    yargsConfig: yargsConfig,
    SCREEN_RESOLUTIONS: {
        desktop: {width: 1440, height: 10},
        laptop: {width: 1024, height: 10},
        tablet: {width: 768, height: 10},
        mobile: {width: 360, height: 10},
    },
};