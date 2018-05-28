var fs = require('fs');

require('core-js-builder')({
    modules: ['es6', 'es7'], // modules / namespaces
    //blacklist: ['es6.reflect'],    // blacklist of modules / namespaces, by default - empty list
    library: false,                // flag for build without global namespace pollution, by default - false
    umd: true                      // use UMD wrapper for export `core` object, by default - true
}).then(code => {
    fs.writeFileSync('./dist/tmp/core-js.umd.js', code, () => {
        console.log(error);
    });
}).catch(error => {
    console.log(error);
});
