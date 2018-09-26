<p align="center">
    <h1 align="center">
    QA Screenshot comparator
    </h1>
    <br>
</p>

> This handy tool gives us the possibility to generate website screenshots for any resolution.

###




#### Generating screenshots for all resolutions

```
node app.js -u=[example.com] -s=all
```

#### Generating screenshots for single resolution

```
node app.js -u=[example.com] -s=mobile
```

#### Available sizes

``
[ desktop, laptop, tablet, mobile, all ]
``

### Use from code directly
```
const Generator = require('./generator');
let generator = new Generator({
    url: [String: url],
    generateSitemap: [String: whether to generate sitemap],
    resolution: [Object: resolution object which has 2 properties, width and height],
    withProgressBar: [Boolean: show progress bar in console],
    resolutionName: [String: current resolution name for console output and folder name],
    runtime: [String: path to folder to save screenshots]
});
generator.run();

```

### Common resolutions

```
{
    desktop: {width: 1440, height: 10},
    laptop: {width: 1024, height: 10},
    tablet: {width: 768, height: 10},
    mobile: {width: 360, height: 10},
}
```