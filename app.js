/**
 * Created by zura on 3/28/18.
 */
const yargs = require('yargs');
const conf = require('./src/conf');
const Generator = require('./generator');

conf.yargsConfig.size.demand = true;

let resolutions = [];
const argv = yargs
    .options(conf.yargsConfig)
    .help('h')
    .alias('help', 'h')
    .argv;

if (argv.size !== 'all') {
    resolutions[argv.size] = conf.SCREEN_RESOLUTIONS[argv.size];
} else {
    resolutions = conf.SCREEN_RESOLUTIONS;
}

for(let i in resolutions) {
    const IMAGE_FOLDER = conf.SITES_FOLDER + `/${argv.language}/current/${i}`;
    console.log(`Start generating screens for "${i}" from url "${argv.url}" in folder "${argv.language}"`);
    let generator = new Generator({
        url: argv.url,
        imageFolder: IMAGE_FOLDER,
        generateSitemap: argv.generateSitemap,
        resolution: resolutions[i],
        withProgressBar: true,
        resolutionName: i
    });
    generator.run();
}