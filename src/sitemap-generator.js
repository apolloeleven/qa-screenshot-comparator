/**
 * Created by zura on 4/4/18.
 */
const fs = require('fs');
const SitemapGenerator = require('sitemap-generator');
const logUpdate = require('log-update');
const winston = require('winston');
const conf = require('./conf');

const frames = ['-', '\\', '|', '/'];
let i = 0;

const RUNTIME = conf.RUNTIME;
const SITES_FOLDER = conf.SITES_FOLDER;
winston.configure({
    transports: [
        new (winston.transports.File)({filename: `${RUNTIME}/output.log`})
    ]
});

module.exports.generate = (url, generateSitemap) => {

    const URLS_FILE = `${SITES_FOLDER}/urls.json`;

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
            winston.log('info', `Grabbed url ${url}`);
            urls.push(url);
            logUpdate(`☕☕ ${frame} Found ${urls.length} urls ${frame} ☕☕`);
        });
        generator.on('done', async ($content) => {
            winston.log('info', `Totally grabbed ${urls.length} urls`);
            clearInterval(interval);
            logUpdate.done();
            console.timeEnd("Sitemap generation");
            fs.writeFileSync(URLS_FILE, JSON.stringify(urls, undefined, 2));
            resolve(urls);
        });
        generator.on('error', async (object) => {
            winston.log('error', `Error in URL grab!!! Code: ${object.code}. Message: "${object.message}". url ${object.url}`);
            urls.push(object.url);
            logUpdate(`☕☕ ${frame} Found ${urls.length} urls ${frame} ☕☕`);
        });

        if (generateSitemap || !fs.existsSync(URLS_FILE)) {
            console.time("Sitemap generation");
            try {
                generator.start();
            } catch (e) {
                console.error(`Website is offline ${url}`);
                resolve(urls);
                return;
            }

            interval = setInterval(() => {
                frame = frames[i = ++i % frames.length];
                logUpdate(`☕☕ ${frame} Found ${urls.length} urls ${frame} ☕☕`);
            }, 80);
        } else {
            let data = fs.readFileSync(URLS_FILE, 'utf8');
            resolve(JSON.parse(data));
        }
    });
};