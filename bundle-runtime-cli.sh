#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd $BASEDIR

#copy datatable to libraries
mkdir -p libraries/datatable/
cp projects/components/src/widgets/common/table/datatable.js libraries/datatable/

node_modules/.bin/rollup -c rollup.build-task.js

node_modules/.bin/rimraf dist/runtime-cli

mkdir -p dist/runtime-cli

mkdir -p dist/runtime-cli/angular-app
mkdir -p dist/runtime-cli/dependencies

cp -r src dist/runtime-cli/angular-app
cp -r libraries/ dist/runtime-cli/angular-app
cp angular.json package.json package-lock.json tsconfig.json tsconfig.web-app.json dist/runtime-cli/angular-app

cp dist/transpilation/transpilation-web.cjs.js dist/transpilation/transpilation-mobile.cjs.js dist/runtime-cli/dependencies
cd -
