/**
 * Created by zura on 3/28/18.
 */
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

const sitemapParser = require('./sitemap-parser');

const captureScreenshots = async () => {
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

    const browser = await puppeteer.launch();

    // capture a screenshot of each device we wish to emulate (`devicesToEmulate`)
    // for (let device of devicesToEmulate) {
    // await page.emulate(devices[device]);

    console.time("Start generating screens");
    for (let url of urls) {
        const imageName = url.replace(/^\/|\/$/g, '').replace(/^https?:\/\//, '').replace(/[\.\/]+/g, '-');

        console.log(`Opening url "${url}"`);
        const page = await browser.newPage();
        await page.setViewport({width: 1440,height: 10});
        await page.goto(url);
        await page.screenshot({path: `desktop/${imageName}.png`, fullPage: true});
    }
    console.timeEnd("Start generating screens");
    // }

    await browser.close()
};

captureScreenshots();