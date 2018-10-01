const winston = require('winston');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const conf = require('./src/conf');
const compareImage = require('./compare-image');
const path = require('path');
const SitemapGenerator = require('sitemap-generator');
const frames = ['-', '\\', '|', '/'];
let siteMapIndex = 0;

class Generator {
    constructor(params) {
        this.url = params.url;
        this.generateSitemap = params.generateSitemap;
        this.urls = [];
        this.resolutionName = params.resolutionName;
        this.RUNTIME = params.runtime;
        this.websiteName = this.url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');
        this.sitesFolder = `${this.RUNTIME}/websites/${this.websiteName}`;

        //Event listeners
        this.onUrlFound = params.onUrlFound;
        this.onUrlFindFinish = params.onUrlFindFinish;
        this.onUrlFindError = params.onUrlFindError;
        this.onScreenshotGenerationStart = params.onScreenshotGenerationStart;
        this.onScreenshotGenerate = params.onScreenshotGenerate;
        this.onScreenshotCompare = params.onScreenshotCompare;
        this.onScreenshotGenerationFinish = params.onScreenshotGenerationFinish;

        fs.ensureDirSync(this.sitesFolder);

        winston.configure({
            transports: [
                new (winston.transports.File)({filename: `${this.RUNTIME}/output.log`})
            ]
        });
    }

    async run() {
        this.urls = await this.generateSiteMap(this.url, this.generateSitemap);
        let promiseArray = [];
        let imageFolder = '';

        if (this.resolutionName === 'all') {
            for (let resolution in conf.SCREEN_RESOLUTIONS) {
                imageFolder = `${this.sitesFolder}/current/${resolution}`;
                fs.emptyDirSync(imageFolder);
                promiseArray.push(this.generateScreenshots(this.urls, resolution, imageFolder).catch(err => {
                    winston.info(err);
                }));
            }
        } else {
            imageFolder = `${this.sitesFolder}/current/${this.resolutionName}`;
            fs.emptyDirSync(imageFolder);
            promiseArray.push(this.generateScreenshots(this.urls, this.resolutionName, imageFolder).catch(err => {
                winston.info(err);
            }));
        }

        return Promise.all(promiseArray);
    }

    generateScreenshots(urls, resolutionName, imageFolder) {
        return new Promise(async (resolve, reject) => {
            this.triggerEvent('onScreenshotGenerationStart', {
                urlsCount: this.urls.length,
                startIndex: 0,
                urls: this.urls,
                resolutionName: resolutionName
            });

            //todo maybe better if 1 browser created, not resolution count
            const browser = await puppeteer.launch({headless: true});
            this.screenshotsFor(browser, urls, 0, 2, resolutionName, imageFolder).then(() => {
                browser.close();
                this.triggerEvent("onScreenshotGenerationFinish", {
                    resolutionName: resolutionName,
                    folderName: this.sitesFolder
                });
                resolve()
            });
        });
    };

    screenshotsFor(browser, urls, startIndex, limit, resolutionName, imageFolder) {
        return new Promise((resolve, reject) => {
            let promises = [];
            let size = Math.min(urls.length, startIndex + limit);
            for (let i = startIndex; i < size; i++) {
                let promise = this.takeScreenshot(browser, urls[i], resolutionName, imageFolder);
                promises.push(promise);
            }
            Promise.all(promises).then(() => {
                if (startIndex >= urls.length) {
                    resolve()
                } else {
                    this.screenshotsFor(browser, urls, startIndex + limit, limit, resolutionName, imageFolder).then(() => {
                        resolve();
                    });
                }
            }, () => {
                this.screenshotsFor(browser, urls, startIndex + limit, limit, resolutionName, imageFolder).then(() => {
                    resolve();
                });
            });
        })

    };

    takeScreenshot(browser, url, resolutionName, imageFolder) {
        return new Promise((resolve, reject) => {
            url = decodeURI(url);
            const imageName = url.replace(/^\/|\/$/g, '').replace(/\\"&/g, '').replace(/^https?:\/\/[^\/]+\/?/, '').replace(/[\.\/]+/g, '-');
            browser.newPage().then((page) => {
                return new Promise(async (resolve, reject) => {
                    await page.setViewport(conf.SCREEN_RESOLUTIONS[resolutionName]);
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

                return new Promise(async (resolve, reject) => {
                    let newFile = `${imageFolder}/${imageName}.png`;
                    await page.screenshot({path: newFile, fullPage: true});
                    this.triggerEvent('onScreenshotGenerate', {
                        'currentUrlIndex': this.urls.indexOf(url),
                        'path': newFile,
                        'url': url,
                        resolutionName: resolutionName
                    });
                    let stableFile = newFile.replace('/current/', '/stable/');
                    if (fs.existsSync(stableFile)) {
                        let output = newFile.replace('/current/', '/output/');
                        await compareImage.isTheSame(stableFile, newFile,
                            path.dirname(output))
                            .then((result) => {
                                winston.info(result.stdout);
                            });
                        let params = {
                            currentUrlIndex: this.urls.indexOf(url),
                            url: url,
                            new: newFile,
                            stable: stableFile,
                            resolutionName: resolutionName,
                            folderName: this.sitesFolder
                        };
                        let newImage = output.replace(/\.png$/, '_new.png');
                        fs.access(newImage, fs.constants.R_OK, (err) => {
                            if (!err) {
                                params.newImage = newImage;
                                let stableImage = output.replace(/\.png$/, '_stable.png');
                                fs.access(stableImage, fs.constants.R_OK, (err) => {
                                    if (!err) {
                                        params.stableImage = stableImage;
                                    }
                                    this.triggerEvent('onScreenshotCompare', params);
                                });
                            } else {
                                this.triggerEvent('onScreenshotCompare', params);
                            }
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

    generateSiteMap(url, generateSitemap) {

        const URLS_FILE = `${this.sitesFolder}/urls.json`;

        // create generator
        const generator = SitemapGenerator(url, {
            stripQuerystring: true,
            needsAuth: conf.HTTP_BASIC_AUTH,
            authUser: conf.HTTP_BASIC_AUTH_USERNAME,
            authPass: conf.HTTP_BASIC_AUTH_PASSWORD
        });
        const crawler = generator.getCrawler();
        const extRegex = new RegExp(`\\.(pdf|xml|tif)$`, 'i');
        crawler.addFetchCondition(parsedUrl => !parsedUrl.path.match(extRegex));

        let urls = [];
        let frame = '';
        let interval;

        return new Promise((resolve, reject) => {

            generator.on('add', (url) => {
                urls.push(url);
                this.triggerEvent("onUrlFound", {
                    frame: frame,
                    foundUrlCount: urls.length,
                    url: url
                });
            });
            generator.on('done', async ($content) => {
                clearInterval(interval);
                this.triggerEvent("onUrlFindFinish", {
                    foundUrlCount: urls.length
                });
                fs.writeFileSync(URLS_FILE, JSON.stringify(urls, undefined, 2));
                resolve(urls);
            });
            generator.on('error', async (object) => {
                urls.push(object.url);
                this.triggerEvent("onUrlFindError", {
                    foundUrlCount: urls.length,
                    url: object.url,
                    errorCode: object.code,
                    message: object.message
                });
            });

            if (generateSitemap || !fs.existsSync(URLS_FILE)) {
                try {
                    generator.start();
                } catch (e) {
                    console.error(`Website is offline ${url}`);
                    resolve(urls);
                    return;
                }
                interval = setInterval(() => {
                    frame = frames[siteMapIndex = ++siteMapIndex % frames.length];
                }, 80);
            } else {
                let data = fs.readFileSync(URLS_FILE, 'utf8');
                resolve(JSON.parse(data));
            }
        });
    };

    triggerEvent(eventName, data) {
        if (typeof this[eventName] === 'function') {
            this[eventName](data);
        }
    }
}

// export the class
module.exports = Generator;