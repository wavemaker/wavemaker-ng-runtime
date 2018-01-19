import resolve from 'rollup-plugin-node-resolve';

export default {
    input: './dist/out-tsc/components/components.module.js',
    output: {
        file: './dist/tmp/wm-components.umd.js',
        format: 'umd'
    },
    name: 'wm.components',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/common/http': 'ng.common',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@utils/dom': 'wm.utils',
        '@utils/utils': 'wm.utils',
        '@utils/styler': 'wm.utils',
        '@utils/watcher': 'wm.utils',
        '@utils/expression-parser': 'wm.utils'
    },
    plugins: [
        resolve({
            // use "module" field for ES6 module if possible
            module: true, // Default: true

            // use "jsnext:main" if possible
            // – see https://github.com/rollup/rollup/wiki/jsnext:main
            jsnext: true,  // Default: false

            // use "main" field or index.js, even if it's not an ES6 module
            // (needs to be converted from CommonJS to ES6
            // – see https://github.com/rollup/rollup-plugin-commonjs
            main: true,  // Default: true

            // some package.json files have a `browser` field which
            // specifies alternative files to load for people bundling
            // for the browser. If that's you, use this option, otherwise
            // pkg.browser will be ignored
            browser: false,  // Default: false

            // not all files you want to resolve are .js files
            extensions: [ '.js', '.json' ],  // Default: ['.js']

            // whether to prefer built-in modules (e.g. `fs`, `path`) or
            // local ones with the same names
            preferBuiltins: false,  // Default: true

            // Lock the module search in this path (like a chroot). Module defined
            // outside this path will be mark has external
            jail: '/my/jail/path', // Default: '/'

            // If true, inspect resolved files to check that they are
            // ES2015 modules
            modulesOnly: true, // Default: false

            // Any additional options that should be passed through
            // to node-resolve
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        })
    ]
};