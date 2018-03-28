/**
 * Created by zura on 3/28/18.
 */

const fs = require('fs'),
    xml2js = require('xml2js');


module.exports.getUrls = (sitemapPath) => {
    return new Promise((resolve, reject) => {
        const parser = new xml2js.Parser();
        fs.readFile(sitemapPath, function (err, data) {
            parser.parseString(data, function (err, result) {
                if (result && result['urlset'] && result['urlset']['url']) {
                    resolve(result['urlset']['url'].map(urlObj => urlObj.loc[0]))
                }
            });
        });
    })
};