/**
 * Created by zura on 3/28/18.
 */

const yargs = require('yargs');

const argv = yargs
    .options({
        url: {
            demand: true,
            alias: 'u',
            describe: 'Please provide website url',
            string: true
        }
    })
    .help()
    .alias('help', 'h')
    .argv
;

const SitemapGenerator = require('sitemap-generator');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const _cliProgress = require('cli-progress');
const ScreenshotsCapturerFn = require('./capture');
const screenshotsCapturer = new ScreenshotsCapturerFn('desktop');

// create generator
const generator = SitemapGenerator(argv.url, {
        stripQuerystring: false
    })
;

let run = async () => {

    let urls = [];
    generator.on('add', (url) => {
        console.log(`Url grabbed "${url}"`);
        urls.push(url);
    });
    generator.on('done', async ($content) => {
        console.timeEnd("Sitemap generation");
        generateScreenshots(urls);
    });

    console.time("Sitemap generation");
    generator.start();
};

let generateScreenshots = async (urls) => {
    // create a new progress bar instance and use shades_classic theme
    const progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    progressBar.start(urls.length, 0);

    let i = 0;
    // console.time("Start screenshot generation");
    for (let url of urls) {
        // console.log(`Start generating ${url}`);
        const browser = await puppeteer.launch();

        const imageName = url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');

        // console.log("Creating new page");
        const page = await browser.newPage();
        page.setViewport({width: 1440, height: 10});
        // console.log(`Opening url "${url}"`);
        await page.goto(url);
        await page.screenshot({path: `desktop/${imageName}.png`, fullPage: true});
        // console.log(`Finish generating ${url}`);
        i++;
        progressBar.update(i);
    }
    await screenshotsCapturer.browser.close();
    console.timeEnd('Start screenshot generation');
    // stop the progress bar
    progressBar.stop();
};

run();