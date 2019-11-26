#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd $BASEDIR
dev=true
publish=false
useS3=false
version='x.x.x'
while [ "$1" != "" ]; do
    case $1 in
        --use-s3)
            shift
            useS3=$1
        ;;
        --pom-version)
            shift
            version=$1
            dev=false
            publish=true
        ;;
    esac
    shift
done

#copy datatable to libraries
mkdir -p libraries/scripts/datatable/
cp projects/components/src/widgets/common/table/datatable.js libraries/scripts/datatable/
mkdir -p libraries/scripts/swipey
cp ./projects/swipey/src/swipey.jquery.plugin.js libraries/scripts/swipey/

node_modules/.bin/rollup -c rollup.build-task.js

node_modules/.bin/rimraf dist/runtime-cli

mkdir -p dist/runtime-cli

mkdir -p dist/runtime-cli/angular-app
mkdir -p dist/runtime-cli/dependencies

cp -r src dist/runtime-cli/angular-app
cp -r build-scripts dist/runtime-cli/angular-app
cp -r dist/bundles/wmapp/locales libraries
if [[ "${dev}" == true ]]; then
    cp -r libraries dist/runtime-cli/angular-app
fi
cp angular.json package.json package-lock.json tsconfig.json tsconfig.web-app.json wm-custom-webpack.config.js dist/runtime-cli/angular-app
cp ./wm.package.json libraries/package.json

if [[ "${publish}" == true ]]; then
    node bundle-runtime-cli.js -v "${version}" --useS3=${useS3} --updateWmVersion
fi
mkdir -p dist/npm-packages/wm
cp -r libraries/. dist/npm-packages/wm
tar -zcf dist/npm-packages/wm.tar.gz -C dist/npm-packages wm
rm -r dist/npm-packages/wm

cp dist/transpilation/transpilation-web.cjs.js dist/transpilation/transpilation-mobile.cjs.js dist/runtime-cli/dependencies
cd -
