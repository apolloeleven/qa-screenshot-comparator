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
        choices: ['desktop', 'laptop', 'tablet', 'mobile','all'],
        demand: false,
        string: true
    },
    'language': {
        alias: 'l',
        describe: 'Select Language',
        choices: ['en', 'de'],
        demand: false,
        string: true
    },
    'folder': {
        alias: 'f',
        describe: 'Folder in which the images will be saved',
        demand: false,
        string: true
    }
}
;