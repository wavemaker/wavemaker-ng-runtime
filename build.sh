#!/bin/sh

start=`date +%s`

force=false
copy=false
docs=false
locale=false

isSourceModified=false

for arg in "$@"
do
    case ${arg} in
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
UGLIFYJS='./node_modules/.bin/uglifyjs -b ascii_only=true'
NGC=./node_modules/.bin/ngc
NG=./node_modules/.bin/ng
TSC=./node_modules/.bin/tsc
COMPODOC=./node_modules/.bin/compodoc

SUCCESS_FILE="BUILD_SUCCESS"

if [[ ${force} == true ]]; then
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
    if [[ "$?" -ne "0" ]]; then
        echo "$task: $desc - failure"
        exit 1
    else
        echo "$task: $desc - success"
    fi
}

hasLibChanges() {
    if [[ ${force} == true ]]; then
        return 0
    fi

    local successFile="./dist/LIB_${SUCCESS_FILE}"

    if ! [[ -e ${successFile} ]]; then
        return 0
    fi

    local updateTime=`date -r ./package.json +%s`
    local buildTime=`date -r ${successFile} +%s`

	if [[ ${updateTime} -le ${buildTime} ]]; then
		return 1
	else
		return 0
	fi
    return 0
}

hasSourceChanges() {

    if [[ ${force} == true ]]; then
        return 0
    fi

    local bundle=$1
    local sourceLocation=$2
    local successFile="./dist/tmp/${bundle}_${SUCCESS_FILE}"

    if ! [[ -e ${successFile} ]]; then
        return 0
    fi

    local updateTime=`find ${sourceLocation} -type f \( -name "*.ts" ! -name "*.doc.ts"  -o -name "*.html" \) -printf "%T@\n" | sort | tail -1 | cut -d. -f1`
    local buildTime=`date -r ${successFile} +%s`

	if [[ ${updateTime} -le ${buildTime} ]]; then
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

ngBuild() {
    local bundle=$1
    local sourceLocation=$2
    local ngModuleName=$3;
    hasSourceChanges ${bundle} ${sourceLocation}
    if [[ "$?" -eq "0" ]]; then
        execCommand ng-build ${ngModuleName} "$NG build $ngModuleName"
        isSourceModified=true
        if [[ "$?" -eq "0" ]]; then
            touch ./dist/tmp/${bundle}_${SUCCESS_FILE}
        fi
    else
        echo "No changes in $bundle"
    fi
}

bundleWeb() {
    echo "uglify: web"

    ${UGLIFYJS} \
        ./dist/npm-packages/wm/core/bundles/index.umd.js \
        ./dist/npm-packages/wm/swipey/bundles/index.umd.js \
        ./dist/npm-packages/wm/transpiler/bundles/index.umd.js \
        ./dist/npm-packages/wm/http/bundles/index.umd.js \
        ./dist/npm-packages/wm/oAuth/bundles/index.umd.js \
        ./dist/npm-packages/wm/security/bundles/index.umd.js \
        ./dist/npm-packages/wm/build-task/bundles/index.umd.js \
        ./dist/npm-packages/wm/components/bundles/index.umd.js \
        ./dist/npm-packages/wm/variables/bundles/index.umd.js \
        ./dist/npm-packages/wm/mobile/placeholder/bundles/index.umd.js \
        ./dist/npm-packages/wm/runtime/base/bundles/index.umd.js \
        ./dist/npm-packages/wm/runtime/dynamic/bundles/index.umd.js \
        -o ./dist/bundles/wmapp/scripts/wm-loader.min.js -b

    ./node_modules/.bin/uglifyjs ./dist/bundles/wmapp/scripts/wm-loader.min.js \
        -c -o ./dist/bundles/wmapp/scripts/wm-loader.min.compressed.js -b beautify=false,ascii_only=true

    if [[ "$?" -eq "0" ]]; then
        echo "uglify: web - success"
    else
        echo -e "uglify: web - failure"
    fi
}

bundleMobile() {
    echo "uglify: mobile"
    ${UGLIFYJS} \
        ./dist/npm-packages/wm/core/bundles/index.umd.js \
        ./dist/npm-packages/wm/swipey/bundles/index.umd.js \
        ./dist/npm-packages/wm/transpiler/bundles/index.umd.js \
        ./dist/npm-packages/wm/http/bundles/index.umd.js \
        ./dist/npm-packages/wm/oAuth/bundles/index.umd.js \
        ./dist/npm-packages/wm/security/bundles/index.umd.js \
        ./dist/npm-packages/wm/build-task/bundles/index.umd.js \
        ./dist/npm-packages/wm/components/bundles/index.umd.js \
        ./dist/npm-packages/wm/mobile/core/bundles/index.umd.js \
        ./dist/npm-packages/wm/mobile-build-task/bundles/index.umd.js \
        ./dist/npm-packages/wm/mobile/components/bundles/index.umd.js \
        ./dist/npm-packages/wm/variables/bundles/index.umd.js \
        ./dist/npm-packages/wm/mobile/offline/bundles/index.umd.js \
        ./dist/npm-packages/wm/mobile/variables/bundles/index.umd.js \
        ./dist/npm-packages/wm/mobile/runtime/bundles/index.umd.js \
        ./dist/npm-packages/wm/runtime/base/bundles/index.umd.js \
        ./dist/npm-packages/wm/runtime/dynamic/bundles/index.umd.js \
        -o ./dist/bundles/wmmobile/scripts/wm-mobileloader.min.js -b

    ./node_modules/.bin/uglifyjs ./dist/bundles/wmmobile/scripts/wm-mobileloader.min.js \
        -c -o ./dist/bundles/wmmobile/scripts/wm-mobileloader.min.compressed.js -b beautify=false,ascii_only=true

    if [[ "$?" -eq "0" ]]; then
        echo "uglify: mobile - success"
    else
        echo -e "uglify: mobile - failure"
    fi
}

buildApp() {
    hasSourceChanges components projects/components
    local hasChangesInComponents=$?

    hasSourceChanges mobile-components projects/mobile/components
    local hasChangesInMobileComponents=$?

    ngBuild core projects/core '@wm/core'
    ngBuild transpiler projects/transpiler '@wm/transpiler'
    ngBuild swipey projects/swipey '@wm/swipey'
    ngBuild http-service projects/http-service '@wm/http'
    ngBuild oAuth projects/oAuth '@wm/oAuth'
    ngBuild security projects/security '@wm/security'
    ngBuild variables projects/variables '@wm/variables'
    ngBuild components projects/components '@wm/components'

    ngBuild mobile-core projects/mobile/core '@wm/mobile/core'
    ngBuild mobile-offline projects/mobile/offline '@wm/mobile/offline'
    ngBuild mobile-components projects/mobile/components '@wm/mobile/components'
    ngBuild mobile-variables projects/mobile/variables '@wm/mobile/variables'
    ngBuild mobile-runtime projects/mobile/runtime '@wm/mobile/runtime'
    ngBuild mobile-placeholder projects/mobile/placeholder '@wm/mobile/placeholder'


    if [[ ${hasChangesInComponents} -eq "0" ]]; then
        ./node_modules/.bin/ng-packagr -p projects/components/ng-package-buildtask.json -c ./projects/components/tsconfig.lib.json
    fi

    if [[ ${hasChangesInMobileComponents} -eq "0" ]]; then
        ./node_modules/.bin/ng-packagr -p projects/mobile/components/ng-package-buildtask.json -c ./projects/mobile/components/tsconfig.lib.json
    fi

    ngBuild runtime-base projects/runtime-base '@wm/runtime/base'
    ngBuild runtime-dynamic projects/runtime-dynamic '@wm/runtime/dynamic'

    if [[ "${isSourceModified}" == true ]]; then
        bundleWeb
        bundleMobile
    fi
}

buildDocs() {
    if [[ "${docs}" == true ]]; then
        ${RIMRAF} ./dist/docs/
        execCommand "compodoc" "docs" "${COMPODOC} --config documentation/compodocrc.json"
    fi
}

copyDist() {
    if [[ "${copy}" == true ]]; then
        cp ./dist/bundles/wmapp/scripts/* ../wavemaker-studio-editor/src/main/webapp/wmapp/scripts/
        cp -r ./dist/bundles/* ../../wavemaker-studio-saas/wavemaker-saas-client/local/webapp/remote-studio/ 2> /dev/null
        cp -r ./dist/bundles/* ../../wavemaker-studio-saas/wavemaker-saas-client/local/webapp/static-files/ 2> /dev/null
        if [[ "${docs}" == true ]]; then
            cp -r ./dist/docs/* ../wavemaker-studio-editor/src/main/webapp/docs/
        fi
        if [[ "${locale}" == true ]]; then
            cp -r ./dist/bundles/wmapp/locales/* ../wavemaker-studio-editor/src/main/webapp/wmapp/locales/
            cp -r ./dist/bundles/wmmobile/locales/* ../wavemaker-studio-editor/src/main/webapp/wmmobile/locales/
        fi
    fi
}

copyLocale() {
    if [[ "${locale}" == true ]]; then

        local appDest=./dist/bundles/wmapp/locales
        local mobileDest=./dist/bundles/wmmobile/locales

        local angularSrc=./node_modules/@angular/common/locales
        local fullCalendarSrc=./node_modules/fullcalendar/dist/locale
        local momentSrc=./node_modules/moment/locale

        mkdir -p ${appDest}/angular
        mkdir -p ${mobileDest}/angular
        mkdir -p ${appDest}/fullcalendar
        mkdir -p ${appDest}/moment
        mkdir -p ${mobileDest}/moment

        for file in ${angularSrc}/*.js; do
            local fileName=`echo $(basename ${file}) | tr 'A-Z' 'a-z'`
            cp ${angularSrc}/${fileName} ${appDest}/angular/${fileName}
        done
        cp  ${appDest}/angular/*.js  ${mobileDest}/angular/

        cp ${fullCalendarSrc}/*.js ${appDest}/fullcalendar/

        cp ${momentSrc}/*.js ${appDest}/moment/
        cp ${momentSrc}/*.js ${mobileDest}/moment/
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

buildNgCircleProgressbar() {
    execCommand "tsc" "ng-circle-progress" "${TSC} ./node_modules/ng-circle-progress/index.js --target es5 --outDir dist/tmp/libs/ng-circle-progress --allowJs --skipLibCheck --module es2015"
    execCommand "rollup" "ng-circle-progress" "${ROLLUP} -c ./config/rollup.ng-circle-progress.config.js --silent"
}

bundleWebLibs() {
    echo "uglify: web-libs"
    ${UGLIFYJS} \
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
        ./dist/tmp/libs/ng-circle-progress/ng-circle-progress.umd.js \
        ./node_modules/ngx-color-picker/bundles/ngx-color-picker.umd.js \
        ./node_modules/lodash/lodash.js \
        ./node_modules/moment/moment.js \
        ./node_modules/x2js/x2js.js \
        ./node_modules/d3/d3.min.js \
        ./node_modules/wm-nvd3/build/nv.d3.min.js \
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
        ./projects/components/src/widgets/common/table/datatable.js \
        -o ./dist/bundles/wmapp/scripts/wm-libs.min.js -b

    ./node_modules/.bin/uglifyjs ./dist/bundles/wmapp/scripts/wm-libs.min.js \
        -c -o ./dist/bundles/wmapp/scripts/wm-libs.min.compressed.js -b beautify=false,ascii_only=true


    if [[ "$?" -eq "0" ]]; then
        echo "uglify: web-libs - success"
    else
        echo -e "uglify: web-libs - failure"
    fi
}

bundleMobileLibs() {
    echo "uglify: mobile-libs"
    ${UGLIFYJS} \
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
        ./dist/tmp/libs/ng-circle-progress/ng-circle-progress.umd.js \
        ./node_modules/ngx-color-picker/bundles/ngx-color-picker.umd.js \
        ./node_modules/lodash/lodash.js \
        ./node_modules/moment/moment.js \
        ./node_modules/x2js/x2js.js \
        ./node_modules/d3/d3.min.js \
        ./node_modules/wm-nvd3/build/nv.d3.min.js \
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
        ./projects/components/src/widgets/common/table/datatable.js \
        ./dist/tmp/libs/ionic-native/ionic-native-core.umd.js \
        ./dist/tmp/libs/ionic-native/ionic-native-plugins.umd.js \
        ./node_modules/iscroll/build/iscroll.js \
        ./node_modules/js-cookie/src/js.cookie.js \
        -o ./dist/bundles/wmmobile/scripts/wm-libs.min.js -b

    ./node_modules/.bin/uglifyjs ./dist/bundles/wmmobile/scripts/wm-libs.min.js \
        -c -o ./dist/bundles/wmmobile/scripts/wm-libs.min.compressed.js -b beautify=false,ascii_only=true


    if [[ "$?" -eq "0" ]]; then
        echo "uglify: mobile-libs - success"
    else
        echo -e "uglify: mobile-libs - failure"
    fi
}

buildWebLibs() {
    buildCoreJs
    buildTsLib
    buildNgxBootstrap
    buildNgxToastr
    buildNgxMask
    buildAngularWebSocket
    buildNgCircleProgressbar

    bundleWebLibs
}

buildIonicNative() {
    execCommand "rollup" "ionic-native" "${ROLLUP} -c ./projects/mobile/ionic-native/rollup.ionic-native.config.js --silent"
}

buildMobileLibs() {
    buildIonicNative

    bundleMobileLibs
}

buildLibs() {
    hasLibChanges

    if [[ "$?" -eq "0" ]]; then
        npm install
        buildWebLibs
        buildMobileLibs

        if [[ "$?" -eq "0" ]]; then
            touch ./dist/LIB_${SUCCESS_FILE}
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
