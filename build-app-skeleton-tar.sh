#!/usr/bin/env bash

tar -cf dist/app-skeleton.tar \
    ./libraries \
    ./src \
    angular.json \
    package.json  \
    tsconfig.json \
    tsconfig.web-app.json
