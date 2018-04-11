/**
 * Created by zura on 3/28/18.
 */
const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const _cliProgress = require('cli-progress');
const Sitemap = require('./src/sitemap-generator');
const yargs = require('./src/cli-validator');
const conf = require('./src/conf');
const compareImage = require('./compare-image');
const path = require('path');

const argv = yargs
    .option('size', {
        demand: true
    })
    .argv;

const SCREEN_RESOLUTIONS = {
    desktop: {width: 1440, height: 10},
    laptop: {width: 1024, height: 10},
    tablet: {width: 768, height: 10},
    mobile: {width: 360, height: 10},
};

const RESOLUTION = SCREEN_RESOLUTIONS[argv.size];

const progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

const RUNTIME = conf.RUNTIME;
const IMAGE_FOLDER = RUNTIME + `/current/${argv.language}/${argv.size}`;

console.log(IMAGE_FOLDER);
// if (fs.existsSync(IMAGE_FOLDER)){
//     fx.rmdirSync(IMAGE_FOLDER);
// }
fs.ensureDirSync(RUNTIME);
fs.emptyDirSync(IMAGE_FOLDER);

let urls;

let run = async () => {

    console.time('Everything generated');
    urls = await Sitemap.generate(argv.url, argv.generateSitemap, argv.language);
    generateScreenshots(urls).catch(err => {
        console.log(err);
    });
};

let generateScreenshots = async (urls) => {
    // create a new progress bar instance and use shades_classic theme

    progressBar.start(urls.length, 0);

    const browser = await puppeteer.launch({headless: true});

    console.time("All Screenshot generation");
    screenshotsFor(browser, urls, 0, 2).then(() => {
        console.log("");
        console.timeEnd(`All Screenshot generation`);
        console.timeEnd('Everything generated');
        // let pages = await browser.pages();
        // if (pages.length) {
        browser.close();
        // }

        // stop the progress bar
        progressBar.stop();
    });
};

let screenshotsFor = (browser, urls, startIndex, limit) => {
    return new Promise((resolve, reject) => {
        let promises = [];
        let size = Math.min(urls.length, startIndex + limit);
        for (let i = startIndex; i < size; i++) {
            let promise = takeScreenshot(browser, urls[i]);
            promises.push(promise);
        }
        Promise.all(promises).then(() => {
            // console.log(`Taken screenshots for range ${startIndex} - ${startIndex + limit}`);
            if (startIndex >= urls.length) {
                resolve()
            } else {
                // console.log(`Calling screenshots for range ${startIndex + limit} - ${startIndex + limit + limit}`);
                screenshotsFor(browser, urls, startIndex + limit, limit).then(() => {
                    resolve();
                });
            }
        });
    })

};

let takeScreenshot = (browser, url) => {
    return new Promise((resolve, reject) => {
        // console.log(`Start generating ${url}`);
        const imageName = url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');
        browser.newPage().then((page) => {
            // console.log(`Set viewport `);
            return new Promise(async (resolve, reject) => {
                await page.setViewport(RESOLUTION);
                resolve(page);
            })
        }).then((page) => {
            // console.log(`Go to page`);
            return new Promise(async (resolve, reject) => {
                await page.goto(url);
                resolve(page);
            });
        }).then((page) => {
            // console.log(`Screenshot for ${url}`);
            progressBar.update(urls.indexOf(url));
            return new Promise(async (resolve, reject) => {
                await page.screenshot({path: `${IMAGE_FOLDER}/${imageName}.png`, fullPage: true});
                await compareImage.isTheSame(`${IMAGE_FOLDER}/${imageName}.png`.replace('/current/', '/stable/'),
                    `${IMAGE_FOLDER}/${imageName}.png`,
                    path.dirname(`${IMAGE_FOLDER}/${imageName}.png`.replace('/current/', '/output/')))
                    .then((result) => {
                        console.log(result);
                    });
                resolve(page);
            })
        }).then((page) => {
            // console.log(`Close`);
            return page.close();
        }).then(() => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
};

run();