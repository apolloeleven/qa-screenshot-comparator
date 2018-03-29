/**
 * Created by zura on 3/28/18.
 */
const fs = require('fs');
const yargs = require('yargs');
const SitemapGenerator = require('sitemap-generator');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const _cliProgress = require('cli-progress');

const argv = yargs
    .options({
        generateSitemap: {
            demand: false,
            alias: 's',
            describe: 'If you want to generate sitemap also or use previously generated',
            boolean: true
        },
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
const RUNTIME = __dirname + '/runtime';
const IMAGE_FOLDER = RUNTIME + '/desktop';
const URLS_FILE = RUNTIME + '/urls.json';

if (!fs.existsSync(RUNTIME)) {
    fs.mkdirSync(RUNTIME);
}

if (!fs.existsSync(IMAGE_FOLDER)) {
    fs.mkdirSync(IMAGE_FOLDER);
}


let run = async () => {

    let urls = await getUrls(argv.url);
    generateScreenshots(urls).catch(err => {
        console.log(err);
    });
};

let getUrls = async (url) => {

    // create generator
    const generator = SitemapGenerator(url, {
            stripQuerystring: false
        })
    ;
    return new Promise((resolve, reject) => {
        let urls = [];
        generator.on('add', (url) => {
            console.log(`Grabbed url ${url}`);
            urls.push(url);
        });
        generator.on('done', async ($content) => {
            console.timeEnd("Sitemap generation");
            fs.writeFileSync(URLS_FILE, JSON.stringify(urls));
            resolve(urls);
        });

        console.time("Sitemap generation");
        if (argv.generateSitemap || !fs.existsSync(URLS_FILE)){
            generator.start();
        } else {
            let data = fs.readFileSync(URLS_FILE, 'utf8');
            resolve(JSON.parse(data));
        }
    });
};

let generateScreenshots = async (urls) => {
    // create a new progress bar instance and use shades_classic theme
    const progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);
    progressBar.start(urls.length, 0);

    let i = 0;
    const browser = await puppeteer.launch();
    console.time("Start screenshot generation");
    for (let url of urls) {
        // console.log(`Start generating ${url}`);
        const imageName = url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');

        // console.log("Creating new page");
        const page = await browser.newPage();
        page.setViewport({width: 1440, height: 10});
        // console.log(`Opening url "${url}"`);
        await page.goto(url);
        await page.screenshot({path: `${IMAGE_FOLDER}/${imageName}.png`, fullPage: true});
        page.close();
        // console.log(`Finish generating ${url}`);
        i++;
        progressBar.update(i);
    }
    let pages = await browser.pages();
    if (pages.length) {
        await browser.close();
    }
    console.log('\n');
    console.timeEnd('Start screenshot generation');
    // stop the progress bar
    progressBar.stop();
};

let screenshotsFor = (urls) => {
    let promises = [];

};

let takeScreenshot = (browser, url) => {
    return new Promise((resolve, reject) => {
        // console.log(`Start generating ${url}`);
        const imageName = url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');
        browser.newPage().then((page) => {
            return new Promise((resolve, reject) => {
                page.setViewport({width: 1440, height: 10})
                    .then(() => {
                        return page.goto(url);
                    })
                    .then(() => {
                        return page.screenshot({path: `${IMAGE_FOLDER}/${imageName}.png`, fullPage: true});
                    })
                    .then(() => {
                        resolve(page);
                        return page.close();
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        });
    });
};

Promise.all([])

run();