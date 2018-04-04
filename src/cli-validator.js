/**
 * Created by zura on 4/4/18.
 */
const yargs = require('yargs');

module.exports = yargs

    .option('generateSitemap', {
        demand: false,
        alias: 'sm',
        describe: 'If you want to generate sitemap also or use previously generated',
        boolean: true
    })
    .option('url', {
        demand: true,
        alias: 'u',
        describe: 'Please provide website url',
        string: true
    })
    .option('language', {
        alias: 'l',
        describe: 'Please specify the language',
        choices: ['en', 'de'],
        demand: true,
        string: true
    })
    .help('h')
    .alias('help', 'h')
;
