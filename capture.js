/**
 * Created by zura on 3/28/18.
 */
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const _cliProgress = require('cli-progress');

const sitemapParser = require('./sitemap-parser');

const captureScreenshots = async () => {

    // create a new progress bar instance and use shades_classic theme
    const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);

    let urls = await sitemapParser.getUrls(__dirname + '/sitemap.xml');
    const devicesToEmulate = [
        'iPhone 6',
        'iPhone 6 landscape',
        'iPhone 6 Plus',
        'Nexus 6',
        'iPad Pro'
    ];

    // urls = [
    //     'http://career.de.car1411dev.intermundia.de/',
    //     'http://career.de.car1411dev.intermundia.de/de/stellenangebote/leiter-projektmanagement-produktmanagement-m-w',
    //     'http://career.de.car1411dev.intermundia.de/de/was-wir-machen'
    // ];
    // urls = urls.slice(0, 10);

    // start the progress bar with a total value of 200 and start value of 0
    bar1.start(urls.length, 0);

    const browser = await puppeteer.launch();

    // capture a screenshot of each device we wish to emulate (`devicesToEmulate`)
    // for (let device of devicesToEmulate) {
    // await page.emulate(devices[device]);

    console.time("Start generating screens");
    let i = 0;
    for (let url of urls) {
        const imageName = url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');

        // console.log("Creating new page");
        const page = await browser.newPage();
        page.setViewport({width: 1440,height: 10});
        // console.log(`Opening url "${url}"`);
        await page.goto(url);
        await page.screenshot({path: `desktop/${imageName}.png`, fullPage: true});
        i++;

        // update the current value in your application..
        bar1.update(i);
    }
    console.log("\n");
    console.timeEnd("Start generating screens");
    // }

    await browser.close();

    // stop the progress bar
    bar1.stop();
};

captureScreenshots();