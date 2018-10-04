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

#### Here is the width of the generated screenshots for each resolution name

| `resolutionName`  | pixels |
-----------|-------
| desktop  | 1440px |
| laptop   | 1024px |
| tablet   | 768px  |
| mobile   | 360px  |

<table>
    <tr>
        <th>Events</th>
        <th>Description</th>
        <th>Response object properties</th>
    </tr>
    <tbody>
    <tr>
        <td>onUrlFind</td>
        <td>Triggered on each url find event while generating site map</td>
        <td>
            <ol>
                <li><code>foundUrlCount: [Number]</code></li>
                <li><code>url: [String]</code></li>
            </ol>
        </td>
    </tr>
    <tr>
        <td>onUrlFindError</td>
        <td>Triggered on site map url generation error</td>
        <td>
            <ol>
                 <li><code>foundUrlCount: [Number]</code></li>
                 <li><code>url: [String]</code></li>
                 <li><code>errorCode: [String]</code></li>
                 <li><code>message: [String]</code></li>
            </ol>
        </td>
    </tr>
    <tr>
        <td>onUrlFindFinish</td>
        <td>Triggered when site map generation is finished</td>
        <td>
                    <ol>
                         <li><code>foundUrlCount: [Number]</code></li>
                    </ol>
                </td>
    </tr>
    <tr>
        <td>onScreenshotGenerationStart</td>
        <td>Triggered when screenshot generation starts for specific resolution</td>
        <td>
                    <ol>
                         <li><code>foundUrlCount: [Number]</code></li>
                         <li><code>startIndex: [Number]</code></li>
                         <li><code>urlsCount: [Number]</code></li>
                         <li><code>urls: [Array]</code></li>
                         <li><code>resolutionName: [String]</code></li>
                    </ol>
                </td>
    </tr>
    <tr>
        <td>onScreenshotGenerate</td>
        <td>Triggered when each screenshot image is generated for specific resolution</td>
        <td>
                    <ol>
                         <li><code>currentUrlIndex: [Number]</code></li>
                         <li><code>path: [String]</code></li>
                         <li><code>resolutionName: [String]</code></li>
                    </ol>
                </td>
    </tr>
    <tr>
        <td>onScreenshotCompare</td>
        <td>Triggered when existing screenshot is compared to newly generated image for specific resolution</td>
        <td>
                    <ol>
                         <li><code>currentUrlIndex: [Number]</code></li>
                         <li><code>url: [String]</code></li>
                         <li><code>new: [String]</code></li>
                         <li><code>stable: [String]</code></li>
                         <li><code>resolutionName: [String]</code></li>
                         <li><code>folderName: [String]</code></li>
                         <li><code>stableImage: [String]</code></li>
                         <li><code>newImage: [String]</code></li>
                    </ol>
                </td>
    </tr>
    <tr>
        <td>onScreenshotGenerationFinish</td>
        <td>Triggered when screenshot generation is finished for specific resolution</td>
        <td>
            <ol>
                <li><code>resolutionName: [String]</code></li>
                <li><code>folderName: [String]</code></li>
            </ol>
        </td>
    </tr>
    <tr>
        <td>onScreenshotThumbnailGenerate</td>
        <td>Triggered when thumbnail is generated for a specific image</td>
        <td></td>
    </tr>
    <tr>
        <td>onScreenshotThumbnailGenerateError</td>
        <td>Triggered when thumbnail generation failed for a specific image</td>
        <td></td>
    </tr>
    </tbody>
</table>