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

#copy datatable to libraries
mkdir -p libraries/scripts/datatable/
cp projects/components/widgets/data/table/src/datatable.js libraries/scripts/datatable/
mkdir -p libraries/scripts/d3/
cp ./node_modules/d3/d3.min.js libraries/scripts/d3/
mkdir -p libraries/scripts/@wavemaker.com/nvd3/build/
cp ./node_modules/@wavemaker.com/nvd3/build/nv.d3.min.js libraries/scripts/@wavemaker.com/nvd3/build/
mkdir -p libraries/scripts/fullcalendar/dist
cp ./node_modules/fullcalendar/dist/fullcalendar.min.js libraries/scripts/fullcalendar/dist
mkdir -p libraries/scripts/summernote/dist/
cp ./node_modules/summernote/dist/summernote-lite.min.js libraries/scripts/summernote/dist/
mkdir -p libraries/scripts/jquery-ui/ui/widgets/
cp ./node_modules/jquery-ui/ui/widgets/sortable.js libraries/scripts/jquery-ui/ui/widgets/
cp ./node_modules/jquery-ui/ui/widgets/droppable.js libraries/scripts/jquery-ui/ui/widgets/
cp ./node_modules/jquery-ui/ui/widgets/resizable.js libraries/scripts/jquery-ui/ui/widgets/
mkdir -p libraries/scripts/hammerjs
cp ./node_modules/hammerjs/hammer.min.js libraries/scripts/hammerjs/
mkdir -p libraries/scripts/iscroll/build
cp ./node_modules/iscroll/build/iscroll.js libraries/scripts/iscroll/build/
mkdir -p libraries/scripts/swipey
cp ./projects/swipey/src/swipey.jquery.plugin.js libraries/scripts/swipey/
mkdir -p libraries/scripts/jquery.ui.touch-punch
cp ./projects/jquery.ui.touch-punch/jquery.ui.touch-punch.min.js libraries/scripts/jquery.ui.touch-punch/


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
    node bundle-runtime-cli.js --publishVersion=${publishVersion}
fi
mkdir -p dist/npm-packages/app-ng-runtime
cp -r libraries/. dist/npm-packages/app-ng-runtime
tar -zcf dist/npm-packages/app-ng-runtime.tar.gz -C dist/npm-packages app-ng-runtime
rm -r dist/npm-packages/app-ng-runtime

cp dist/transpilation/transpilation-web.cjs.js dist/transpilation/transpilation-mobile.cjs.js dist/runtime-cli/dependencies
cd -
