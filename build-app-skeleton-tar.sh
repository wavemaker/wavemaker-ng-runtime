#!/usr/bin/env bash

tar -cf dist/app-skeleton.tar \
    ./libraries/components/ \
    ./libraries/core/ \
    ./libraries/http-service/ \
    ./libraries/oAuth/ \
    ./libraries/security/ \
    ./libraries/swipey/ \
    ./libraries/transpiler/ \
    ./libraries/variables/ \
    ./src angular.json \
    package.json  \
    tsconfig.json
