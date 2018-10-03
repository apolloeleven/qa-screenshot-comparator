const winston = require('winston');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const md5 = require('md5');
const thumb = require('node-thumbnail').thumb;
const conf = require('./src/conf');
const compareImage = require('./compare-image');
const SitemapGenerator = require('sitemap-generator');

const frames = ['-', '\\', '|', '/'];
let siteMapIndex = 0;

class Generator {
    constructor(params) {
        this.url = params.url;
        this.generateSitemap = params.generateSitemap;
        this.urls = [];
        this.resolutionName = params.resolutionName;
        this.includeThumbnails = params.includeThumbnails;
        this.thumbnailWidth = params.thumbnailWidth;
        this.RUNTIME = params.runtime;
        this.websiteName = this.url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');
        this.folderName = params.folderName;
        this.sitesFolder = `${this.RUNTIME}/websites/${this.folderName ? this.folderName : this.websiteName}`;
        this.authParams = params.authParams;

        //Event listeners
        this.onUrlFound = params.onUrlFound;
        this.onUrlFindFinish = params.onUrlFindFinish;
        this.onUrlFindError = params.onUrlFindError;
        this.onScreenshotGenerationStart = params.onScreenshotGenerationStart;
        this.onScreenshotGenerate = params.onScreenshotGenerate;
        this.onScreenshotCompare = params.onScreenshotCompare;
        this.onScreenshotGenerationFinish = params.onScreenshotGenerationFinish;
        this.onScreenshotThumbnailGenerate = params.onScreenshotThumbnailGenerate;
        this.onScreenshotThumbnailGenerateError = params.onScreenshotThumbnailGenerateError;
        this.FILE_MAX_LENGTH = 214;

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

        if (typeof this.resolutionName === 'string') {
            if (this.resolutionName === 'all') {
                for (let resolution in conf.SCREEN_RESOLUTIONS) {
                    imageFolder = `${this.sitesFolder}/current/${resolution}`;
                    fs.emptyDirSync(imageFolder);
                    if (this.includeThumbnails) {
                        fs.emptyDirSync(`${imageFolder}-thumbnails`)
                    }
                    promiseArray.push(this.generateScreenshots(this.urls, resolution, imageFolder).catch(err => {
                        winston.info(err);
                    }));
                }
            } else {
                imageFolder = `${this.sitesFolder}/current/${this.resolutionName}`;
                fs.emptyDirSync(imageFolder);
                if (this.includeThumbnails) {
                    fs.emptyDirSync(`${imageFolder}-thumbnails`)
                }
                promiseArray.push(this.generateScreenshots(this.urls, this.resolutionName, imageFolder).catch(err => {
                    winston.info(err);
                }));
            }
        } else if (typeof this.resolutionName === 'object') {
            if (this.resolutionName.includes('all')) {
                for (let resolution in conf.SCREEN_RESOLUTIONS) {
                    imageFolder = `${this.sitesFolder}/current/${resolution}`;
                    fs.emptyDirSync(imageFolder);
                    if (this.includeThumbnails) {
                        fs.emptyDirSync(`${imageFolder}-thumbnails`)
                    }
                    promiseArray.push(this.generateScreenshots(this.urls, resolution, imageFolder).catch(err => {
                        winston.info(err);
                    }));
                }
            } else {
                for (let i in this.resolutionName) {
                    imageFolder = `${this.sitesFolder}/current/${this.resolutionName[i]}`;
                    fs.emptyDirSync(imageFolder);
                    if (this.includeThumbnails) {
                        fs.emptyDirSync(`${imageFolder}-thumbnails`)
                    }
                    promiseArray.push(this.generateScreenshots(this.urls, this.resolutionName[i], imageFolder).catch(err => {
                        winston.info(err);
                    }));
                }
            }
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
        return new Promise(async (resolve, reject) => {
            try {
                url = decodeURI(url);
                const imageName = url.replace(/^\/|\/$/g, '').replace(/\\"&/g, '').replace(/^https?:\/\/[^\/]+\/?/, '').replace(/[\.\/]+/g, '-');

                let page = await browser.newPage();
                await page.setViewport(conf.SCREEN_RESOLUTIONS[resolutionName]);
                if (this.authParams.HTTP_BASIC_AUTH) {
                    await page.authenticate({
                        username: this.authParams.HTTP_BASIC_AUTH_USERNAME,
                        password: this.authParams.HTTP_BASIC_AUTH_PASSWORD
                    });
                }
                await page.goto(url, {timeout: 30000});

                let image = imageName === '' ? "_" + md5(imageName) : imageName;
                let folderPath = `${imageFolder}`;
                let newFile = `${imageFolder}/${image}.png`;
                let imageMD5 = md5(image);

                //Checking file max length
                if (newFile.length >= this.FILE_MAX_LENGTH) {
                    // PngLength 4 md5Length 32 ThumbnailSuffixLength 6 SlashLength 1
                    image = image.substr(0, this.FILE_MAX_LENGTH - folderPath.length - 43) + `-${imageMD5}`;
                    newFile = `${folderPath}/${image}.png`;
                }

                await page.screenshot({path: newFile, fullPage: true});
                this.triggerEvent('onScreenshotGenerate', {
                    'currentUrlIndex': this.urls.indexOf(url),
                    'path': newFile,
                    'url': url,
                    resolutionName: resolutionName
                });

                //Generating thumbnails for screenshots async
                if (this.includeThumbnails) {
                    await thumb({
                        source: newFile,
                        destination: `${folderPath}-thumbnails`,
                        overwrite: true,
                        quiet: true,
                        concurrency: 4,
                        width: this.thumbnailWidth
                    });
                }

                //Compare images if stable folder exist
                let stableFile = newFile.replace('/current/', '/stable/');
                if (fs.existsSync(stableFile)) {
                    let output = newFile.replace('/current/', '/output/');
                    await compareImage.isTheSame(stableFile, newFile, path.dirname(output)).then((result) => {
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

                    try {
                        fs.accessSync(newImage, fs.constants.R_OK);
                        params.newImage = newImage;
                        let stableImage = output.replace(/\.png$/, '_stable.png');
                        try {
                            fs.accessSync(stableImage, fs.constants.R_OK);
                            params.stableImage = stableImage;
                            this.triggerEvent('onScreenshotCompare', params);
                        } catch (err) {
                        }
                    } catch (err) {
                        this.triggerEvent('onScreenshotCompare', params);
                    }
                }

                await page.close();
                resolve();
            } catch (error) {
                console.log(error.toString());
                resolve();
            }
        });
    };

    generateSiteMap(url, generateSitemap) {

        const URLS_FILE = `${this.sitesFolder}/urls.json`;

        // create generator
        const generator = SitemapGenerator(url, {
            stripQuerystring: true,
            needsAuth: this.authParams.HTTP_BASIC_AUTH,
            authUser: this.authParams.HTTP_BASIC_AUTH_USERNAME,
            authPass: this.authParams.HTTP_BASIC_AUTH_PASSWORD
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