#!/usr/bin/env bash
BASEDIR=$(dirname "$0")
cd $BASEDIR
dev=true
publish=false
publishVersion='x.x.x'
while [ "$1" != "" ]; do
    case $1 in
        --publish-version)
            shift
            publishVersion=$1
            dev=false
            publish=true
        ;;
    esac
    shift
done

cp -r src dist/runtime-cli/angular-app
cp -r build-scripts dist/runtime-cli/angular-app
cp -r pwa-assets dist/runtime-cli
if [[ "${dev}" == true ]]; then
    cp -r libraries dist/runtime-cli/angular-app
fi
cp -rf angular.json package.json package-lock.json .npmrc tsconfig.json tsconfig.web-app.json wm-custom-webpack.config.js dist/runtime-cli/angular-app
cp ./wm.package.json libraries/package.json

if [[ "${publish}" == true ]]; then
    node bundle-angular-app-cli.js --publishVersion=${publishVersion}
fi

mkdir -p dist/npm-packages/angular-app
cp -rf dist/runtime-cli/angular-app/. dist/npm-packages/angular-app

cd dist/npm-packages/angular-app
npm install
npm pack
cp "wavemaker-angular-app-${publishVersion}.tgz" "../"

