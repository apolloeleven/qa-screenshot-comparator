/**
 * Created by zura on 3/28/18.
 */
const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const path = require('path');
const _cliProgress = require('cli-progress');
const Sitemap = require('./src/sitemap-generator');
const yargs = require('yargs');
const winston = require('winston');

const yargsConfig = require('./src/yargs-config');
const conf = require('./src/conf');
const compareImage = require('./compare-image');

yargsConfig.size.demand = true;
const argv = yargs
    .options(yargsConfig)
    .help('h')
    .alias('help', 'h')
    .argv;

const SCREEN_RESOLUTIONS = {
    desktop: {width: 1440, height: 10},
    laptop: {width: 1024, height: 10},
    tablet: {width: 768, height: 10},
    mobile: {width: 360, height: 10},
};

const RESOLUTION = SCREEN_RESOLUTIONS[argv.size];

const progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

const RUNTIME = conf.SITES_FOLDER;
const IMAGE_FOLDER = RUNTIME + `/${argv.language}/current/${argv.size}`;

fs.emptyDirSync(IMAGE_FOLDER);

let urls;

let run = async () => {

    console.time('Everything generated');
    urls = await Sitemap.generate(argv.url, argv.generateSitemap);
    generateScreenshots(urls).catch(err => {
        winston.info(err);
    });
};

let generateScreenshots = async (urls) => {
    // create a new progress bar instance and use shades_classic theme

    progressBar.start(urls.length, 0);

    const browser = await puppeteer.launch({headless: true});

    console.time("All Screenshot generation");
    screenshotsFor(browser, urls, 0, 2).then(() => {
        winston.info("");
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
            // winston.info(`Taken screenshots for range ${startIndex} - ${startIndex + limit}`);
            if (startIndex >= urls.length) {
                resolve()
            } else {
                // winston.info(`Calling screenshots for range ${startIndex + limit} - ${startIndex + limit + limit}`);
                screenshotsFor(browser, urls, startIndex + limit, limit).then(() => {
                    resolve();
                });
            }
        }, () => {
            screenshotsFor(browser, urls, startIndex + limit, limit).then(() => {
                resolve();
            });
        });
    })

};

let takeScreenshot = (browser, url) => {
    return new Promise((resolve, reject) => {
        // winston.info(`Start generating ${url}`);
        url = decodeURI(url);
        const imageName = url.replace(/^\/|\/$/g, '').replace(/\\"&/g, '').replace(/^https?:\/\/[^\/]+\/?/, '').replace(/[\.\/]+/g, '-');
        // winston.info(`URL: "${url}" - Name: ${imageName}`);
        browser.newPage().then((page) => {
            // winston.info(`Set viewport `);
            return new Promise(async (resolve, reject) => {
                await page.setViewport(RESOLUTION);
                resolve(page);
            })
        }).then((page) => {
            // winston.info(`Go to page`);
            return new Promise(async (resolve, reject) => {
                try {
                    if (conf.HTTP_BASIC_AUTH) {
                        await page.authenticate({username: conf.HTTP_BASIC_AUTH_USERNAME, password: conf.HTTP_BASIC_AUTH_PASSWORD});
                    }
                    await page.goto(url, {timeout: 30000});
                    resolve(page);
                }catch(e){
                    console.error(`${e.message} for url ${url}`);
                    reject();
                }
            });
        }).then((page) => {
            // winston.info(`Screenshot for ${url}`);
            progressBar.update(urls.indexOf(url));
            return new Promise(async (resolve, reject) => {
                await page.screenshot({path: `${IMAGE_FOLDER}/${imageName}.png`, fullPage: true});
                let stableFile = `${IMAGE_FOLDER}/${imageName}.png`.replace('/current/', '/stable/');
                if (fs.existsSync(stableFile)) {
                    await compareImage.isTheSame(stableFile, `${IMAGE_FOLDER}/${imageName}.png`,
                        path.dirname(`${IMAGE_FOLDER}/${imageName}.png`.replace('/current/', '/output/')))
                        .then((result) => {
                            winston.info(result.stdout);
                        });
                }
                resolve(page);
            })
        }).then((page) => {
            // winston.info(`Close`);
            return page.close();
        }).then(() => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    });
};

run();