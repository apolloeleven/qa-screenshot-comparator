/**
 * Created by zura on 3/27/18.
 */
const yargs = require('yargs');

const argv = yargs
    .options({
        url: {
            demand: true,
            alias: 'u',
            describe: 'Url for which you would like to generate sitemap.xml',
            string: true
        }
    })
    .help()
    .alias('help', 'h')
    .argv
;

const sitemapFile = 'sitemap.xml';

const SitemapGenerator = require('sitemap-generator');

// create generator
const generator = SitemapGenerator(argv.url, {
        stripQuerystring: false,
        filepath: __dirname + '/' + sitemapFile
    })
;

console.log(`Start Generating "${sitemapFile}"`);
console.time("sitemap_generation");
// register event listeners
generator.on('done', ($content) => {
    console.timeEnd("sitemap_generation");

    console.log(`Finished Generating ${sitemapFile}`);
    // sitemaps created
});

// start the crawler
generator.start();

// urlGrabber.getUrls(domain)
//     .then((urls) => {
//         console.log("grabbed urls ", urls);
//     });

//
// // Creates a sitemap object given the input configuration with URLs
// const sitemap = sm.createSitemap({
//     hostname: 'http://lobianijs.com/',
//     cacheTime: 600000,        // 600 sec - cache purge period
//     urls: [
//         { url: '/site/lobiadmin',  changefreq: 'daily', priority: 0.3 },
//     ]
// });
// // Generates XML with a callback function
// sitemap.toXML(function (err, xml) {
//     if (!err) {
//         console.log(xml)
//     }
// });
// // Gives you a string containing the XML data
// const xml = sitemap.toString();
//
// fs.appendFile('sitemap.xml', xml, () => {
//     console.log("Written");
// });