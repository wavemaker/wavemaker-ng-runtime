#!/usr/bin/env bash
set -e
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

node_modules/.bin/rimraf dist/runtime-cli

mkdir -p dist/runtime-cli
mkdir -p dist/runtime-cli/angular-app
mkdir -p dist/runtime-cli/dependencies

cp -r src dist/runtime-cli/angular-app
cp -r build-scripts dist/runtime-cli/angular-app
cp -r pwa-assets dist/runtime-cli
cp -r dist/bundles/wmapp/locales libraries
cp ./wm.package.json libraries/package.json
if [[ "${dev}" == true ]]; then
    cp -r libraries dist/runtime-cli/angular-app
fi
cp -rf angular.json package.json package-lock.json .npmrc tsconfig.json tsconfig.web-app.json wm-custom-webpack.config.js proxy.conf.json dist/runtime-cli/angular-app

cp -r src dist/runtime-cli/angular-app
cp -r build-scripts dist/runtime-cli/angular-app
cp -r pwa-assets dist/runtime-cli

cp angular.json package.json package-lock.json .npmrc tsconfig.json tsconfig.web-app.json wm-custom-webpack.config.js generate-dependency-report.js dist/runtime-cli/angular-app
cp dist/transpilation/transpilation-web.cjs.js dist/transpilation/expression-parser.cjs.js dist/transpilation/pipe-provider.cjs.js projects/runtime-base/src/components/app-component/app.component.html ./node_modules/@wavemaker/custom-widgets-m3/custom-widgets-bundle.cjs.js dist/runtime-cli/dependencies

if [[ "${publish}" == true ]]; then
    cd dist/runtime-cli/angular-app
    npm run generate-deps
    cd ../../..
    node bundle-angular-app-cli.js --publishVersion=${publishVersion}
else
    cp -r libraries dist/runtime-cli/angular-app
fi

rm -rf dist/npm-packages/package
mkdir -p dist/npm-packages/package
cp -rf dist/runtime-cli/angular-app/. dist/npm-packages/package
cp -rf dist/runtime-cli/pwa-assets dist/npm-packages/package
cp -rf dist/runtime-cli/dependencies dist/npm-packages/package

TARBALL_NAME="wavemaker-angular-app-${publishVersion}.tgz"
cd dist/npm-packages/package

if [[ "${publish}" == true ]]; then
    # this will create package-lock.json file without actually installing the node modules
    npm install --package-lock-only
    # remove the 'resolved' key from the file
    sed -i.bak '/"resolved":/d' package-lock.json
    cp package-lock.json npm-shrinkwrap.json
    # clean up backup file created by sed (macOS creates .bak files, not in linux)
    rm -f package-lock.json.bak

    cd ../../..
    tar -zcf dist/npm-packages/${TARBALL_NAME} -C dist/npm-packages/ package

    node ../process-npm-package-stats.js --path=dist/npm-packages/${TARBALL_NAME} --packageName=@wavemaker/angular-app --publishVersion=${publishVersion}
else
    yalc publish --no-dev-mod --no-sig --push --content
fi
