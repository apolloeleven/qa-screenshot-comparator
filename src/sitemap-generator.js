/**
 * Created by zura on 4/4/18.
 */
const fs = require('fs');
const SitemapGenerator = require('sitemap-generator');
const path = require('path');
const ROOT_PATH = path.dirname(require.main.filename);

const RUNTIME = ROOT_PATH + '/runtime';

const URLS_FILE = RUNTIME + '/urls.json';

module.exports.generate = (url, generateSitemap) => {

    // create generator
    const generator = SitemapGenerator(url, {
        stripQuerystring: false
    });

    return new Promise((resolve, reject) => {
        let urls = [];
        generator.on('add', (url) => {
            // console.log(`Grabbed url ${url}`);
            urls.push(url);
        });
        generator.on('done', async ($content) => {
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