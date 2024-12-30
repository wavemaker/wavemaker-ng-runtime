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
cp ./node_modules/d3/dist/d3.min.js libraries/scripts/d3/
mkdir -p libraries/scripts/@wavemaker/nvd3/build/
cp ./node_modules/@wavemaker/nvd3/build/nv.d3.min.js libraries/scripts/@wavemaker/nvd3/build/
mkdir -p libraries/scripts/fullcalendar/
cp ./node_modules/fullcalendar/main.min.js libraries/scripts/fullcalendar
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
mkdir -p libraries/scripts/tree-keyboard-navigation/
cp projects/components/widgets/basic/tree/src/keyboard-navigation.js libraries/scripts/tree-keyboard-navigation/

node --trace-warnings node_modules/.bin/rollup -c ./config/rollup.build-task.mjs

cp ./wm.package.json libraries/package.json
rm -rf dist/npm-packages/package
mkdir -p dist/npm-packages/package

TARBALL_NAME="wavemaker-app-ng-runtime-${publishVersion}.tgz"

if [[ "${publish}" == true ]]; then
    node bundle-runtime-cli.js --publishVersion=${publishVersion}
    cp -r libraries/. dist/npm-packages/package
    cd dist/npm-packages/package
    # this will create package-lock.json file without actually installing the node modules
    npm install --package-lock-only
    # remove the 'resolved' key from the file
    sed -i.bak '/"resolved":/d' package-lock.json
    cp package-lock.json npm-shrinkwrap.json
    # clean up backup file created by sed (macOS creates .bak files, not in linux)
    rm -f package-lock.json.bak

    cd ../../..
    tar -zcf dist/npm-packages/${TARBALL_NAME} -C dist/npm-packages/ package

    node ../process-npm-package-stats.js --path=dist/npm-packages/${TARBALL_NAME} --packageName=@wavemaker/app-ng-runtime --publishVersion=${publishVersion}
else
    cp -r libraries/. dist/npm-packages/package
    cd dist/npm-packages/package
    # --node-dev-mode is required, otherwise while publishing yalc is deleting the devdependencies from the final package.json file`
    yalc publish --no-dev-mod --no-sig --push --content

    cd -
fi

