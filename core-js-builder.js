var fs = require('fs');

require('core-js-builder')({
    modules: ['es6', 'es7'], // modules / namespaces
    //blacklist: ['es6.reflect'],    // blacklist of modules / namespaces, by default - empty list
    library: false,                // flag for build without global namespace pollution, by default - false
    umd: true                      // use UMD wrapper for export `core` object, by default - true
}).then(function(code) {
    fs.writeFileSync('./dist/tmp/libs/core-js/core-js.umd.js', code);
}).catch(function (error) {
    console.log(error);
});
