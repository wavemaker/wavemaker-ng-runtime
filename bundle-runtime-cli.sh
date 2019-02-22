#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd $BASEDIR
publish=false
useS3=false
version='x.x.x'
while [ "$1" != "" ]; do
    case $1 in
        --use-s3)
            shift
            useS3=$1
            publish=true
        ;;
        --pom-version)
            shift
            version=$1
            publish=true
        ;;
    esac
    shift
done

#copy datatable to libraries
mkdir -p dist/npm-packages/wm/scripts/datatable/
cp projects/components/src/widgets/common/table/datatable.js dist/npm-packages/wm/scripts/datatable/

node_modules/.bin/rollup -c rollup.build-task.js

node_modules/.bin/rimraf dist/runtime-cli

mkdir -p dist/runtime-cli

mkdir -p dist/runtime-cli/angular-app
mkdir -p dist/runtime-cli/dependencies

cp -r src dist/runtime-cli/angular-app
cp -r build-scripts dist/runtime-cli/angular-app

#cp -r libraries/ dist/runtime-cli/angular-app
cp angular.json package.json package-lock.json tsconfig.json tsconfig.web-app.json dist/runtime-cli/angular-app
cp ./wm.package.json dist/npm-packages/wm/package.json

if [[ "${publish}" == true ]]; then
    node bundle-runtime-cli.js -v "${version}" --useS3=${useS3} --updateWmVersion
fi
tar -zcf dist/npm-packages/wm.tar.gz -C dist/npm-packages wm

cp dist/transpilation/transpilation-web.cjs.js dist/transpilation/transpilation-mobile.cjs.js dist/runtime-cli/dependencies
cd -
