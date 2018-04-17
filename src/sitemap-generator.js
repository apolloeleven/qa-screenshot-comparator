/**
 * Created by zura on 4/4/18.
 */
const fs = require('fs');
const SitemapGenerator = require('sitemap-generator');
const logUpdate = require('log-update');
const conf = require('./conf');

const frames = ['-', '\\', '|', '/'];
let i = 0;

const RUNTIME = conf.RUNTIME;

module.exports.generate = (url, generateSitemap) => {

    const URLS_FILE = `${RUNTIME}/urls.json`;

    // create generator
    const generator = SitemapGenerator(url, {
        stripQuerystring: true,
        needsAuth: conf.HTTP_BASIC_AUTH,
        authUser: conf.HTTP_BASIC_AUTH_USERNAME,
        authPass: conf.HTTP_BASIC_AUTH_PASSWORD
    });

    let urls = [];
    let frame = '';
    let interval;

    return new Promise((resolve, reject) => {

        generator.on('add', (url) => {
            // console.log(`Grabbed url ${url}`);
            urls.push(url);
            // logUpdate(`☕☕ ${frame} Found ${urls.length} urls ${frame} ☕☕`);
        });
        generator.on('done', async ($content) => {
            clearInterval(interval);
            logUpdate.done();
            console.timeEnd("Sitemap generation");
            fs.writeFileSync(URLS_FILE, JSON.stringify(urls, undefined, 2));
            resolve(urls);
        });

        if (generateSitemap || !fs.existsSync(URLS_FILE)) {
            console.time("Sitemap generation");
            generator.start();
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