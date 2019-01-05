#!/usr/bin/env bash

./node_modules/.bin/uglifyjs \
    ./libraries/core/bundles/core.umd.js \
    ./libraries/transpiler/bundles/transpiler.umd.js \
    ./libraries/http-service/bundles/http-service.umd.js \
    ./libraries/oAuth/bundles/oAuth.umd.js \
    ./libraries/security/bundles/security.umd.js \
    ./libraries/build-task/bundles/components.umd.js \
    ./libraries/components/bundles/components.umd.js \
    ./libraries/variables/bundles/variables.umd.js \
    ./libraries/mobile/placeholder/bundles/mobile-placeholder.umd.js \
    ./libraries/runtime-base/bundles/runtime-base.umd.js \
    ./libraries/runtime-dynamic/bundles/runtime-dynamic.umd.js \
    -o ./dist/wm-loader.min.js -b
