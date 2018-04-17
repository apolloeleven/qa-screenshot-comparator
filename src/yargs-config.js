/**
 * Created by zura on 4/4/18.
 */
module.exports = {
    'generateSitemap': {
        demand: false,
        alias: 'sm',
        describe: 'If you want to generate sitemap also or use previously generated',
        boolean: true
    },
    'url': {
        demand: true,
        alias: 'u',
        describe: 'Please provide website url',
        string: true
    },
    'size': {
        alias: 's',
        describe: 'Choose the resolution',
        choices: ['desktop', 'laptop', 'tablet', 'mobile'],
        demand: false,
        string: true
    }
};