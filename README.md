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
node app.js -u=[example.com] -l=en -s=all
```

#### Generating screenshots for single resolution

```
node app.js -u=[example.com] -l=en -s=mobile
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
        imageFolder: [String: folder to save images],
        generateSitemap: [Boolean: include sitemap],
        resolution: [Object: resolution object which has 2 properties, width and height],
        withProgressBar: [Boolean: show progress bar in console],
        resolutionName: [String: current resolution name for console output]
    });
    generator.run();

```