const Sitemap = require('./src/sitemap-generator');
const winston = require('winston');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const _cliProgress = require('cli-progress');
const conf = require('./src/conf');

class Generator {
    constructor(params) {
        this.url = params.url;
        this.imageFolder = params.imageFolder;
        this.generateSitemap = params.generateSitemap;
        this.resolution = params.resolution;
        this.urls = [];
        this.withProgressBar = !!params.withProgressBar;
        this.resolutionName = params.resolutionName;

        this.progressBar = null;
        if (this.withProgressBar) {
            this.progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
        }

        fs.emptyDirSync(this.imageFolder);
    }

    async run() {
        this.urls = await Sitemap.generate(this.url, this.generateSitemap);
        this.generateScreenshots(this.urls).catch(err => {
            winston.info(err);
        });
    }

    async generateScreenshots(urls) {
        // create a new progress bar instance and use shades_classic theme

        this.alterProgressBar("start");
        const browser = await puppeteer.launch({headless: true});

        console.time(`\n All Screenshot generation - ${this.resolutionName}`);
        this.screenshotsFor(browser, urls, 0, 2).then(() => {
            winston.info("");
            console.timeEnd(`\n All Screenshot generation - ${this.resolutionName}`);
            browser.close();
            this.alterProgressBar("stop");
        });
    };

    screenshotsFor(browser, urls, startIndex, limit) {
        return new Promise((resolve, reject) => {
            let promises = [];
            let size = Math.min(urls.length, startIndex + limit);
            for (let i = startIndex; i < size; i++) {
                let promise = this.takeScreenshot(browser, urls[i]);
                promises.push(promise);
            }
            Promise.all(promises).then(() => {
                if (startIndex >= urls.length) {
                    resolve()
                } else {
                    this.screenshotsFor(browser, urls, startIndex + limit, limit).then(() => {
                        resolve();
                    });
                }
            }, () => {
                this.screenshotsFor(browser, urls, startIndex + limit, limit).then(() => {
                    resolve();
                });
            });
        })

    };

    takeScreenshot(browser, url) {
        return new Promise((resolve, reject) => {
            url = decodeURI(url);
            const imageName = url.replace(/^\/|\/$/g, '').replace(/\\"&/g, '').replace(/^https?:\/\/[^\/]+\/?/, '').replace(/[\.\/]+/g, '-');
            browser.newPage().then((page) => {
                return new Promise(async (resolve, reject) => {
                    await page.setViewport(this.resolution);
                    resolve(page);
                })
            }).then((page) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        if (conf.HTTP_BASIC_AUTH) {
                            await page.authenticate({
                                username: conf.HTTP_BASIC_AUTH_USERNAME,
                                password: conf.HTTP_BASIC_AUTH_PASSWORD
                            });
                        }
                        await page.goto(url, {timeout: 30000});
                        resolve(page);
                    } catch (e) {
                        console.error(`${e.message} for url ${url}`);
                        reject();
                    }
                });
            }).then((page) => {
                this.alterProgressBar("update",url);
                return new Promise(async (resolve, reject) => {
                    await page.screenshot({path: `${this.imageFolder}/${imageName}.png`, fullPage: true});
                    let stableFile = `${this.imageFolder}/${imageName}.png`.replace('/current/', '/stable/');
                    if (fs.existsSync(stableFile)) {
                        await compareImage.isTheSame(stableFile, `${IMAGE_FOLDER}/${imageName}.png`,
                            path.dirname(`${this.imageFolder}/${imageName}.png`.replace('/current/', '/output/')))
                            .then((result) => {
                                winston.info(result.stdout);
                            });
                    }
                    resolve(page);
                })
            }).then((page) => {
                return page.close();
            }).then(() => {
                resolve();
            }).catch(err => {
                reject(err);
            });
        });
    };

    alterProgressBar(action,currentUrl = null) {
        if (this.progressBar) {
            switch (action) {
                case "start":
                    this.progressBar.start(this.urls.length, 0);
                    break;
                case "stop":
                    this.progressBar.stop();
                    break;
                case "update":
                    this.progressBar.update(this.urls.indexOf(currentUrl));
                    break;
                default:
                    return;
            }
        }
    }
}


// export the class
module.exports = Generator;