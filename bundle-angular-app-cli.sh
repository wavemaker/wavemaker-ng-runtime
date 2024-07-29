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

mkdir -p dist/npm-packages/package
cp -rf dist/runtime-cli/angular-app/. dist/npm-packages/package

TARBALL_NAME="wavemaker-angular-app-${publishVersion}.tgz"

cd dist/npm-packages/package
npm install && rm -rf node_modules
cd ../../..
tar -zcf dist/npm-packages/${TARBALL_NAME} -C dist/npm-packages/ package

if [[ "${publish}" == true ]]; then
    node ../process-npm-package-stats.js --path=dist/npm-packages/${TARBALL_NAME} --packageName=@wavemaker/app-ng-runtime --publishVersion=${publishVersion}
fi

rm -r dist/npm-packages/package
