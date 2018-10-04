<p align="center">
    <h1 align="center">
    QA Screenshot comparator
    </h1>
    <br>
</p>

> This handy tool gives us the possibility to generate website screenshots for any resolution.

###

[![npm version](https://badge.fury.io/js/1.0.3.svg)](https://www.npmjs.com/package/qa-screenshot-comparator)

## Requirements

You need to have node version above 8

## Installation

1. If you want to install the project as standalone application, clone the project and run `npm install`

2. If you want to install the project as dependency of your application and use its API, run `npm install qa-screenshot-comparator`

## Usage

### Generating screenshots for resolution(s) via CLI

```
node app.js [options]
```
##### CLI Options

    -h, --help
    -v, --version

    -u URL, --url
    -s SIZE, --size
    -f FOLDER, --folder
    
##### Examples
Generating screenshots for all resolutions
```
node app.js -u=http://example.com -s=all -f=first_website_folder
```

Generating screenshots for only for desktop
```
node app.js -u=http://example.com -s=desktop -f=first_website_folder
```

Generating screenshots for desktop and mobile
```
node app.js -u=http://example.com -s=desktop -s=mobile -f=first_website_folder
```

### API 
```node
const {generator} = require('qa-screenshot-comparator');

let generatorInstance = new generator({
    url: <Required> [String: website url],
    resolutionName: <Required> [String|Array: resolution(s)], // Available options [ desktop, laptop, tablet, mobile, all ]
    runtime: <Required> [String: The path for the generation of screenshots],
    generateSitemap: <Optional - default: true> [Boolean: whether to generate sitemap for url],
    authParams: <Optional - default: {}> [Object: HTTP basic auth params],
    includeThumbnails: <Optional - default: false> [Boolean: whether to generate thumbnails for each image],
    thumbnailWidth: <Optional - default: 240> [Number: thumnail width in pixels],
    folderName: <Optional - default: automatically generated from url> [String: folder name],
    onUrlFound: function (data) { },
    onUrlFindError: function (data) { },
    onUrlFindFinish: function (data) { },
    onScreenshotGenerationStart: function (data) { },
    onScreenshotGenerate: function (data) { },
    onScreenshotCompare: function (data) { },
    onScreenshotGenerationFinish: function (data) { },
    onScreenshotThumbnailGenerate: function (data) { },
    onScreenshotThumbnailGenerateError: function (data) { }
});
generatorInstance.run();
```

#### `authParams` is an object with this template
```node
let authParams = {
    HTTP_BASIC_AUTH: [Boolean: whether to run authentication],
    HTTP_BASIC_AUTH_USERNAME: [String: auth username],
    HTTP_BASIC_AUTH_PASSWORD: [String: auth password]
};
```

#### Generator event listeners

| Events                             | Description                                                                                                     | Response object properties                                                                           |
| -----------------------------------|-----------------------------------------------------------------------------------------------------------------| -----------------------------------------------------------------------------------------------------|
| onUrlFind                          | Triggered on each url find event while generating site map.                                                     |   foundUrlCount<br>url                                                                               |
| onUrlFindError                     | Triggered on site map url generation error                                                                      |   foundUrlCount<br>url<br>errorCode<br>message                                                       |
| onUrlFindFinish                    | Triggered when site map generation is finished                                                                  |   foundUrlCount                                                                                      |
| onScreenshotGenerationStart        | Triggered when screenshot generation starts for specific resolution                                             |   urlsCount<br>startIndex<br>urls<br>resolutionName                                                  |
| onScreenshotGenerate               | Triggered when each screenshot image is generated for specific resolution                                       |   currentUrlIndex<br>path<br>url<br>resolutionName                                                   |
| onScreenshotCompare                | Triggered when existing screenshot is compared to newly generated image for specific resolution                 |   currentUrlIndex<br>url<br>new<br>stable<br>resolutionName<br>folderName<br>stableImage<br>newImage |
| onScreenshotGenerationFinish       | Triggered when screenshot generation is finished for specific resolution                                        |   resolutionName<br>folderName                                                                       |
| onScreenshotThumbnailGenerate      | Triggered when thumbnail is generated for a specific image                                                      |    $1                                                                                                |
| onScreenshotThumbnailGenerateError | Triggered when thumbnail generation failed for a specific image                                                 |    $1                                                                                                |

#### Resolutions
```
{
    desktop: {width: 1440, height: 10},
    laptop: {width: 1024, height: 10},
    tablet: {width: 768, height: 10},
    mobile: {width: 360, height: 10},
}
```
