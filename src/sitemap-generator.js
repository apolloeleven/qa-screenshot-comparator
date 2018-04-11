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

module.exports.generate = (url, generateSitemap, language) => {

    const URLS_FILE = RUNTIME + `/${language}_urls.json`;

    // create generator
    const generator = SitemapGenerator(url, {
        stripQuerystring: false
    });

    let urls = [];
    let frame = '';
    let interval = setInterval(() => {
        frame = frames[i = ++i % frames.length];
        logUpdate(`♥♥ ${frame} Found ${urls.length} urls ${frame} ♥♥`);
    }, 80);

    return new Promise((resolve, reject) => {

        generator.on('add', (url) => {
            // console.log(`Grabbed url ${url}`);
            urls.push(url);
            logUpdate(`♥♥ ${frame} Found ${urls.length} urls ${frame} ♥♥`);
        });
        generator.on('done', async ($content) => {
            clearInterval(interval);
            logUpdate.done();
            console.timeEnd("Sitemap generation");
            fs.writeFileSync(URLS_FILE, JSON.stringify(urls, undefined, 2));
            resolve(urls);
        });

        console.time("Sitemap generation");
        if (generateSitemap || !fs.existsSync(URLS_FILE)) {
            generator.start();
        } else {
            let data = fs.readFileSync(URLS_FILE, 'utf8');
            resolve(JSON.parse(data));
        }
    });
};