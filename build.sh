#!/bin/sh

start=`date +%s`

force=false
copy=false
docs=false
locale=false

isSourceModified=false

for arg in "$@"
do
    case $arg in
        -c | --copy)
            copy=true
            ;;
        -f | --force)
            force=true
            ;;
        -d | --docs)
            docs=true
            ;;
        -l | --locale)
            locale=true
            ;;
    esac
done

RIMRAF=./node_modules/.bin/rimraf
ROLLUP=./node_modules/.bin/rollup
UGLIFYJS=./node_modules/.bin/uglifyjs
NGC=./node_modules/.bin/ngc
TSC=./node_modules/.bin/tsc
COMPODOC=./node_modules/.bin/compodoc

SUCCESS_FILE="BUILD_SUCCESS"

if [ ${force} == true ]; then
    ${RIMRAF} ./dist/
fi

mkdir -p ./dist/tmp/libs/core-js
mkdir -p ./dist/bundles/wmapp/scripts
mkdir -p ./dist/bundles/wmmobile/scripts

execCommand() {
    local task=$1
    local desc=$2
    local command=$3
    echo "$task: $desc"
    ${command} > /dev/null
    if [ "$?" -ne "0" ]; then
        echo "$task: $desc - failure"
        exit 1
    else
        echo "$task: $desc - success"
    fi
}

hasLibChanges() {
    if [ ${force} == true ]; then
        return 0
    fi

    local successFile="./dist/${SUCCESS_FILE}"

    if ! [ -e ${successFile} ]; then
        return 0
    fi

    local updateTime=`date -r ./package.json +%s`
    local buildTime=`date -r ${successFile} +%s`

	if [ ${updateTime} -le ${buildTime} ]; then
		return 1
	else
		return 0
	fi
    return 0
}

hasSourceChanges() {
    if [ ${force} == true ]; then
        return 0
    fi

    local bundle=$1
    local successFile="./dist/tmp/${bundle}/${SUCCESS_FILE}"

    if ! [ -e ${successFile} ]; then
        return 0
    fi

    local updateTime=`find ${bundle}/src -type f \( -name "*.ts" ! -name "*.doc.ts"  -o -name "*.html" \) -printf "%T@\n" | sort | tail -1 | cut -d. -f1`
    local buildTime=`date -r ${successFile} +%s`

	if [ ${updateTime} -le ${buildTime} ]; then
		return 1
	else
		return 0
	fi
    return 0
}

rollup() {
    local bundle=$1
    execCommand rollup ${bundle} "$ROLLUP -c $bundle/rollup.config.js --silent"
}

ngCompile() {
    local bundle=$1
    execCommand ngc ${bundle} "$NGC -p $bundle/tsconfig.build.json"
}

build() {
    local bundle=$1
    hasSourceChanges ${bundle}
    if [ "$?" -eq "0" ]; then
        ngCompile ${bundle}
        isSourceModified=true
        if [ "$?" -eq "0" ]; then
            rollup ${bundle}
            touch ./dist/tmp/${bundle}/${SUCCESS_FILE}
        fi
    else
        echo "No changes in $bundle"
    fi
}

bundleWeb() {
    echo "uglify: web"
    ${UGLIFYJS} \
        ./dist/tmp/core/core.umd.js \
        ./dist/tmp/transpiler/transpiler.umd.js \
        ./dist/tmp/http-service/http-service.umd.js \
        ./dist/tmp/oAuth/oAuth.umd.js \
        ./dist/tmp/security/security.umd.js \
        ./dist/tmp/components/build-task.umd.js \
        ./dist/tmp/components/components.umd.js \
        ./dist/tmp/variables/variables.umd.js \
        ./dist/tmp/mobile/placeholder/components/components.umd.js \
        ./dist/tmp/mobile/placeholder/runtime/runtime.umd.js \
        ./dist/tmp/runtime/runtime.umd.js -o \
        ./dist/bundles/wmapp/scripts/wm-loader.min.js -b

    if [ "$?" -eq "0" ]; then
        echo "uglify: web - success"
    else
        echo -e "uglify: web - failure"
    fi
}

bundleMobile() {
    echo "uglify: mobile"
    ${UGLIFYJS} \
        ./dist/tmp/core/core.umd.js \
        ./dist/tmp/transpiler/transpiler.umd.js \
        ./dist/tmp/http-service/http-service.umd.js \
        ./dist/tmp/oAuth/oAuth.umd.js \
        ./dist/tmp/security/security.umd.js \
        ./dist/tmp/components/build-task.umd.js \
        ./dist/tmp/components/components.umd.js \
        ./dist/tmp/mobile/core/core.umd.js \
        ./dist/tmp/mobile/components/build-task.umd.js \
        ./dist/tmp/mobile/components/components.umd.js \
        ./dist/tmp/variables/variables.umd.js \
        ./dist/tmp/mobile/offline/offline.umd.js \
        ./dist/tmp/mobile/variables/variables.umd.js \
        ./dist/tmp/mobile/runtime/runtime.umd.js \
        ./dist/tmp/runtime/runtime.umd.js -o \
        ./dist/bundles/wmmobile/scripts/wm-mobileloader.min.js -b
    if [ "$?" -eq "0" ]; then
        echo "uglify: mobile - success"
    else
        echo -e "uglify: mobile - failure"
    fi
}

buildApp() {
    build core
    build transpiler
    build security
    build components
    build http-service
    build oAuth
    build variables
    build mobile/placeholder/components
    build mobile/placeholder/runtime
    build mobile/core
    build mobile/components
    build mobile/offline
    build mobile/variables
    build mobile/runtime
    build runtime

    if [ "${isSourceModified}" == true ]; then
        bundleWeb
        bundleMobile
    fi
}

buildDocs() {
    if [ "${docs}" == true ]; then
        ${RIMRAF} ./dist/docs/
        execCommand "compodoc" "docs" "${COMPODOC} --config documentation/compodocrc.json"
    fi
}

copyDist() {
    if [ "${copy}" == true ]; then
        cp ./dist/bundles/wmapp/scripts/* ../wavemaker-studio-editor/src/main/webapp/wmapp/scripts/
        cp -r ./dist/bundles/* ../../wavemaker-studio-saas/wavemaker-saas-client/local/webapp/remote-studio/ 2> /dev/null
        cp -r ./dist/bundles/* ../../wavemaker-studio-saas/wavemaker-saas-client/local/webapp/static-files/ 2> /dev/null
        if [ "${docs}" == true ]; then
            cp -r ./dist/docs/* ../wavemaker-studio-editor/src/main/webapp/docs/
        fi
        if [ "${locale}" == true ]; then
            cp -r ./dist/bundles/wmapp/locales/* ../wavemaker-studio-editor/src/main/webapp/wmapp/locales/
            cp -r ./dist/bundles/wmmobile/locales/* ../wavemaker-studio-editor/src/main/webapp/wmmobile/locales/
        fi
    fi
}

copyLocale() {
    if [ "${locale}" == true ]; then
        mkdir -p ./dist/bundles/wmapp/locales/angular
        mkdir -p ./dist/bundles/wmmobile/locales/angular
        cp ./node_modules/@angular/common/locales/*.js ./dist/bundles/wmapp/locales/angular/
        cp ./node_modules/@angular/common/locales/*.js ./dist/bundles/wmmobile/locales/angular/

        mkdir -p ./dist/bundles/wmapp/locales/moment
        mkdir -p ./dist/bundles/wmmobile/locales/moment
        cp ./node_modules/moment/locale/*.js ./dist/bundles/wmapp/locales/moment/
        cp ./node_modules/moment/locale/*.js ./dist/bundles/wmmobile/locales/moment/

        mkdir -p ./dist/bundles/wmapp/locales/ngx-bootstrap
        mkdir -p ./dist/bundles/wmmobile/locales/ngx-bootstrap
        for filename in ./node_modules/ngx-bootstrap/chronos/i18n/*.js; do
            ./node_modules/.bin/rollup $filename --o ./dist/bundles/wmapp/locales/ngx-bootstrap/`basename "$filename"` -f umd --name locale --silent
            ./node_modules/.bin/rollup $filename --o ./dist/bundles/wmmobile/locales/ngx-bootstrap/`basename "$filename"` -f umd --name locale --silent
        done
    fi
}

buildCoreJs() {
    execCommand "build" "core-js" "node ./core-js-builder.js"
}

buildTsLib() {
    execCommand "rollup" "tslib" "${ROLLUP} ./node_modules/tslib/tslib.es6.js --o ./dist/tmp/libs/tslib/tslib.umd.js -f umd --name tslib --silent"
}

buildNgxBootstrap() {
    execCommand "tsc" "ngx-bootstrap" "${TSC} --outDir dist/tmp/libs/ngx-bootstrap --target es5 ./node_modules/ngx-bootstrap/bundles/ngx-bootstrap.es2015.js --allowJs --skipLibCheck --module es2015"
    execCommand "rollup" "ngx-bootstrap" "${ROLLUP} -c ./config/rollup.ngx-bootstrap.config.js --silent"
}

buildNgxToastr() {
    execCommand "tsc" "ngx-toastr" "${TSC} --outDir dist/tmp/libs/ngx-toastr --target es5 ./node_modules/ngx-toastr/fesm2015/ngx-toastr.js --allowJs --skipLibCheck --module es2015"
    execCommand "rollup" "ngx-toastr" "${ROLLUP} -c ./config/rollup.ngx-toastr.config.js --silent"
}

buildNgxMask() {
    execCommand "tsc" "ngx-mask" "${TSC} --outDir dist/tmp/libs/ngx-mask --target es5 ./node_modules/ngx-mask/esm2015/ngx-mask.js --allowJs --skipLibCheck --module es2015"
    execCommand "rollup" "ngx-mask" "${ROLLUP} -c ./config/rollup.ngx-mask.config.js --silent"
}

buildAngularWebSocket() {
    execCommand "rollup" "angular-websocket" "${ROLLUP} -c ./config/rollup.angular-websocket.config.js --silent"
}

bundleWebLibs() {
    echo "uglify: web-libs"
    $UGLIFYJS \
        ./dist/tmp/libs/tslib/tslib.umd.js \
        ./dist/tmp/libs/core-js/core-js.umd.js \
        ./node_modules/zone.js/dist/zone.js \
        ./node_modules/rxjs/bundles/rxjs.umd.js \
        ./node_modules/@angular/core/bundles/core.umd.js \
        ./node_modules/@angular/animations/bundles/animations.umd.js \
        ./node_modules/@angular/animations/bundles/animations-browser.umd.js \
        ./node_modules/@angular/common/bundles/common.umd.js \
        ./node_modules/@angular/compiler/bundles/compiler.umd.js \
        ./node_modules/@angular/platform-browser/bundles/platform-browser.umd.js \
        ./node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js \
        ./node_modules/@angular/platform-browser/bundles/platform-browser-animations.umd.js \
        ./node_modules/@angular/common/bundles/common-http.umd.js \
        ./node_modules/@angular/forms/bundles/forms.umd.js \
        ./node_modules/@angular/router/bundles/router.umd.js \
        ./dist/tmp/libs/ngx-bootstrap/ngx-bootstrap.umd.js \
        ./dist/tmp/libs/ngx-toastr/ngx-toastr.umd.js \
        ./dist/tmp/libs/angular-websocket/angular-websocket.umd.js \
        ./dist/tmp/libs/ngx-mask/ngx-mask.umd.js \
        ./node_modules/ngx-color-picker/bundles/ngx-color-picker.umd.js \
        ./node_modules/lodash/lodash.js \
        ./node_modules/moment/moment.js \
        ./node_modules/x2js/x2js.js \
        ./node_modules/d3/d3.min.js \
        ./node_modules/nvd3/build/nv.d3.min.js \
        ./node_modules/jquery/dist/jquery.min.js \
        ./node_modules/fullcalendar/dist/fullcalendar.min.js \
        ./node_modules/summernote/dist/summernote-lite.js \
        ./node_modules/jquery-ui/ui/disable-selection.js \
        ./node_modules/jquery-ui/ui/version.js \
        ./node_modules/jquery-ui/ui/widget.js \
        ./node_modules/jquery-ui/ui/scroll-parent.js \
        ./node_modules/jquery-ui/ui/plugin.js \
        ./node_modules/jquery-ui/ui/data.js \
        ./node_modules/jquery-ui/ui/widgets/mouse.js \
        ./node_modules/jquery-ui/ui/widgets/resizable.js \
        ./node_modules/jquery-ui/ui/widgets/sortable.js \
        ./node_modules/jquery-ui/ui/widgets/droppable.js \
        ./node_modules/hammerjs/hammer.min.js \
        ./node_modules/iscroll/build/iscroll.js \
        ./node_modules/js-cookie/src/js.cookie.js \
        ./dist/tmp/swipey/swipey.umd.js \
        ./swipey/src/swipey.jquery.plugin.js \
        ./components/src/widgets/common/table/datatable.js \
        -o ./dist/bundles/wmapp/scripts/wm-libs.min.js -b
    if [ "$?" -eq "0" ]; then
        echo "uglify: web-libs - success"
    else
        echo -e "uglify: web-libs - failure"
    fi
}

bundleMobileLibs() {
    echo "uglify: mobile-libs"
    $UGLIFYJS \
        ./dist/tmp/libs/tslib/tslib.umd.js \
        ./node_modules/zone.js/dist/zone.js \
        ./node_modules/rxjs/bundles/rxjs.umd.js \
        ./node_modules/@angular/core/bundles/core.umd.js \
        ./node_modules/@angular/animations/bundles/animations.umd.js \
        ./node_modules/@angular/animations/bundles/animations-browser.umd.js \
        ./node_modules/@angular/common/bundles/common.umd.js \
        ./node_modules/@angular/compiler/bundles/compiler.umd.js \
        ./node_modules/@angular/platform-browser/bundles/platform-browser.umd.js \
        ./node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js \
        ./node_modules/@angular/platform-browser/bundles/platform-browser-animations.umd.js \
        ./node_modules/@angular/common/bundles/common-http.umd.js \
        ./node_modules/@angular/forms/bundles/forms.umd.js \
        ./node_modules/@angular/router/bundles/router.umd.js \
        ./dist/tmp/libs/ngx-bootstrap/ngx-bootstrap.umd.js \
        ./dist/tmp/libs/ngx-toastr/ngx-toastr.umd.js \
        ./dist/tmp/libs/angular-websocket/angular-websocket.umd.js \
        ./dist/tmp/libs/ngx-mask/ngx-mask.umd.js \
        ./node_modules/ngx-color-picker/bundles/ngx-color-picker.umd.js \
        ./node_modules/lodash/lodash.js \
        ./node_modules/moment/moment.js \
        ./node_modules/x2js/x2js.js \
        ./node_modules/d3/d3.min.js \
        ./node_modules/nvd3/build/nv.d3.min.js \
        ./node_modules/jquery/dist/jquery.min.js \
        ./node_modules/fullcalendar/dist/fullcalendar.min.js \
        ./node_modules/summernote/dist/summernote-lite.js \
        ./node_modules/jquery-ui/ui/disable-selection.js \
        ./node_modules/jquery-ui/ui/version.js \
        ./node_modules/jquery-ui/ui/widget.js \
        ./node_modules/jquery-ui/ui/scroll-parent.js \
        ./node_modules/jquery-ui/ui/plugin.js \
        ./node_modules/jquery-ui/ui/data.js \
        ./node_modules/jquery-ui/ui/widgets/mouse.js \
        ./node_modules/jquery-ui/ui/widgets/resizable.js \
        ./node_modules/jquery-ui/ui/widgets/sortable.js \
        ./node_modules/jquery-ui/ui/widgets/droppable.js \
        ./node_modules/hammerjs/hammer.min.js \
        ./dist/tmp/swipey/swipey.umd.js \
        ./swipey/src/swipey.jquery.plugin.js \
        ./components/src/widgets/common/table/datatable.js \
        ./dist/tmp/libs/ionic-native/ionic-native-core.umd.js \
        ./dist/tmp/libs/ionic-native/ionic-native-plugins.umd.js \
        ./node_modules/iscroll/build/iscroll.js \
        ./node_modules/js-cookie/src/js.cookie.js \
        -o ./dist/bundles/wmmobile/scripts/wm-libs.min.js -b
    if [ "$?" -eq "0" ]; then
        echo "uglify: mobile-libs - success"
    else
        echo -e "uglify: mobile-libs - failure"
    fi
}

buildWebLibs() {
    build swipey
    buildCoreJs
    buildTsLib
    buildNgxBootstrap
    buildNgxToastr
    buildNgxMask
    buildAngularWebSocket

    bundleWebLibs
}

buildIonicNative() {
    execCommand "rollup" "ionic-native" "${ROLLUP} -c ./mobile/ionic-native/rollup.ionic-native.config.js --silent"
}

buildMobileLibs() {
    buildIonicNative

    bundleMobileLibs
}

buildLibs() {
    hasLibChanges

    if [ "$?" -eq "0" ]; then
        npm install
        buildWebLibs
        buildMobileLibs

        if [ "$?" -eq "0" ]; then
            touch ./dist/${SUCCESS_FILE}
        fi
    else
        echo "No changes in package.json. use --force to re-build libs"
    fi
}

buildLibs
buildApp
buildDocs
copyLocale
copyDist

end=`date +%s`

runtime=$((end-start))

echo "Execution time: ${runtime}sec"