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
TERSER='./node_modules/.bin/terser -b ascii_only=true'
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

    ${TERSER} \
        ./libraries/core/bundles/index.umd.js \
        ./libraries/swipey/bundles/index.umd.js \
        ./libraries/transpiler/bundles/index.umd.js \
        ./libraries/http/bundles/index.umd.js \
        ./libraries/oAuth/bundles/index.umd.js \
        ./libraries/security/bundles/index.umd.js \
        ./libraries/components/base/bundles/index.umd.js \
        ./libraries/build-task/bundles/index.umd.js \
        ./libraries/components/basic/default/bundles/index.umd.js \
        ./libraries/components/basic/progress//bundles/index.umd.js \
        ./libraries/components/basic/rich-text-editor/bundles/index.umd.js \
        ./libraries/components/basic/search/bundles/index.umd.js \
        ./libraries/components/basic/tree/bundles/index.umd.js \
        ./libraries/components/input/default/bundles/index.umd.js \
        ./libraries/components/input/calendar/bundles/index.umd.js \
        ./libraries/components/input/chips/bundles/index.umd.js \
        ./libraries/components/input/color-picker/bundles/index.umd.js \
        ./libraries/components/input/currency/bundles/index.umd.js \
        ./libraries/components/input/epoch/bundles/index.umd.js \
        ./libraries/components/input/file-upload/bundles/index.umd.js \
        ./libraries/components/input/rating/bundles/index.umd.js \
        ./libraries/components/input/slider/bundles/index.umd.js \
        ./libraries/components/chart/bundles/index.umd.js \
        ./libraries/components/navigation/nav/bundles/index.umd.js \
        ./libraries/components/navigation/navbar/bundles/index.umd.js \
        ./libraries/components/navigation/breadcrumb/bundles/index.umd.js \
        ./libraries/components/navigation/menu/bundles/index.umd.js \
        ./libraries/components/navigation/popover/bundles/index.umd.js \
        ./libraries/components/dialogs/alert-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/confirm-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/design-dialog/bundles/index.umd.js \
        ./libraries/components/page/default/bundles/index.umd.js \
        ./libraries/components/page/footer/bundles/index.umd.js \
        ./libraries/components/page/header/bundles/index.umd.js \
        ./libraries/components/page/left-panel/bundles/index.umd.js \
        ./libraries/components/page/right-panel/bundles/index.umd.js \
        ./libraries/components/page/top-nav/bundles/index.umd.js \
        ./libraries/components/prefab/bundles/index.umd.js \
        ./libraries/components/data/pagination/bundles/index.umd.js \
        ./libraries/components/data/card/bundles/index.umd.js \
        ./libraries/components/data/list/bundles/index.umd.js \
        ./libraries/components/data/table/bundles/index.umd.js \
        ./libraries/components/data/live-table/bundles/index.umd.js \
        ./libraries/components/data/form/bundles/index.umd.js \
        ./libraries/components/dialogs/iframe-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/login-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/partial-dialog/bundles/index.umd.js \
        ./libraries/components/containers/accordion/bundles/index.umd.js \
        ./libraries/components/containers/layout-grid/bundles/index.umd.js \
        ./libraries/components/containers/panel/bundles/index.umd.js \
        ./libraries/components/containers/tabs/bundles/index.umd.js \
        ./libraries/components/containers/tile/bundles/index.umd.js \
        ./libraries/components/containers/wizard/bundles/index.umd.js \
        ./libraries/components/advanced/carousel/bundles/index.umd.js \
        ./libraries/components/advanced/marquee/bundles/index.umd.js \
        ./libraries/components/advanced/login/bundles/index.umd.js \
        ./libraries/variables/bundles/index.umd.js \
        ./libraries/mobile/placeholder/bundles/index.umd.js \
        ./libraries/runtime/base/bundles/index.umd.js \
        ./libraries/runtime/dynamic/bundles/index.umd.js \
        -o ./dist/bundles/wmapp/scripts/wm-loader.js -b

    ./node_modules/.bin/terser ./dist/bundles/wmapp/scripts/wm-loader.js \
        -c -o ./dist/bundles/wmapp/scripts/wm-loader.min.js -m   -b beautify=false,ascii_only=true

    if [[ "$?" -eq "0" ]]; then
        echo "uglify: web - success"
    else
        echo -e "uglify: web - failure"
    fi
}

bundleMobile() {
    echo "uglify: mobile"
    ${TERSER} \
        ./libraries/core/bundles/index.umd.js \
        ./libraries/swipey/bundles/index.umd.js \
        ./libraries/transpiler/bundles/index.umd.js \
        ./libraries/http/bundles/index.umd.js \
        ./libraries/oAuth/bundles/index.umd.js \
        ./libraries/security/bundles/index.umd.js \
        ./libraries/components/base/bundles/index.umd.js \
        ./libraries/build-task/bundles/index.umd.js \
        ./libraries/components/basic/default/bundles/index.umd.js \
        ./libraries/components/basic/progress//bundles/index.umd.js \
        ./libraries/components/basic/rich-text-editor/bundles/index.umd.js \
        ./libraries/components/basic/search/bundles/index.umd.js \
        ./libraries/components/basic/tree/bundles/index.umd.js \
        ./libraries/components/input/default/bundles/index.umd.js \
        ./libraries/components/input/calendar/bundles/index.umd.js \
        ./libraries/components/input/chips/bundles/index.umd.js \
        ./libraries/components/input/color-picker/bundles/index.umd.js \
        ./libraries/components/input/currency/bundles/index.umd.js \
        ./libraries/components/input/epoch/bundles/index.umd.js \
        ./libraries/components/input/file-upload/bundles/index.umd.js \
        ./libraries/components/input/rating/bundles/index.umd.js \
        ./libraries/components/input/slider/bundles/index.umd.js \
        ./libraries/components/chart/bundles/index.umd.js \
        ./libraries/components/navigation/nav/bundles/index.umd.js \
        ./libraries/components/navigation/navbar/bundles/index.umd.js \
        ./libraries/components/navigation/breadcrumb/bundles/index.umd.js \
        ./libraries/components/navigation/menu/bundles/index.umd.js \
        ./libraries/components/navigation/popover/bundles/index.umd.js \
        ./libraries/components/dialogs/alert-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/confirm-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/design-dialog/bundles/index.umd.js \
        ./libraries/components/page/default/bundles/index.umd.js \
        ./libraries/components/page/footer/bundles/index.umd.js \
        ./libraries/components/page/header/bundles/index.umd.js \
        ./libraries/components/page/left-panel/bundles/index.umd.js \
        ./libraries/components/page/right-panel/bundles/index.umd.js \
        ./libraries/components/page/top-nav/bundles/index.umd.js \
        ./libraries/components/prefab/bundles/index.umd.js \
        ./libraries/components/data/pagination/bundles/index.umd.js \
        ./libraries/components/data/card/bundles/index.umd.js \
        ./libraries/components/data/list/bundles/index.umd.js \
        ./libraries/components/data/table/bundles/index.umd.js \
        ./libraries/components/data/live-table/bundles/index.umd.js \
        ./libraries/components/data/form/bundles/index.umd.js \
        ./libraries/components/dialogs/iframe-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/login-dialog/bundles/index.umd.js \
        ./libraries/components/dialogs/partial-dialog/bundles/index.umd.js \
        ./libraries/components/containers/accordion/bundles/index.umd.js \
        ./libraries/components/containers/layout-grid/bundles/index.umd.js \
        ./libraries/components/containers/panel/bundles/index.umd.js \
        ./libraries/components/containers/tabs/bundles/index.umd.js \
        ./libraries/components/containers/tile/bundles/index.umd.js \
        ./libraries/components/containers/wizard/bundles/index.umd.js \
        ./libraries/components/advanced/carousel/bundles/index.umd.js \
        ./libraries/components/advanced/marquee/bundles/index.umd.js \
        ./libraries/components/advanced/login/bundles/index.umd.js \
        ./libraries/mobile/core/bundles/index.umd.js \
        ./libraries/mobile-build-task/bundles/index.umd.js \
        ./libraries/mobile/components/bundles/index.umd.js \
        ./libraries/variables/bundles/index.umd.js \
        ./libraries/mobile/offline/bundles/index.umd.js \
        ./libraries/mobile/variables/bundles/index.umd.js \
        ./libraries/mobile/runtime/bundles/index.umd.js \
        ./libraries/runtime/base/bundles/index.umd.js \
        ./libraries/runtime/dynamic/bundles/index.umd.js \
        -o ./dist/bundles/wmmobile/scripts/wm-mobileloader.js -b

    ./node_modules/.bin/terser ./dist/bundles/wmmobile/scripts/wm-mobileloader.js \
        -c -o ./dist/bundles/wmmobile/scripts/wm-mobileloader.min.js -m   -b beautify=false,ascii_only=true

    if [[ "$?" -eq "0" ]]; then
        echo "uglify: mobile - success"
    else
        echo -e "uglify: mobile - failure"
    fi
}

buildApp() {
    hasSourceChanges components-base projects/components/base
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
    ngBuild components-base projects/components/base '@wm/components/base'

    ngBuild components-basic projects/components/widgets/basic '@wm/components/basic'
    ngBuild components-basic-progress projects/components/widgets/basic/progress '@wm/components/basic/progress'
    ngBuild components-basic-richtexteditor projects/components/widgets/basic/rich-text-editor '@wm/components/basic/rich-text-editor'
    ngBuild components-basic-search projects/components/widgets/basic/search '@wm/components/basic/search'
    ngBuild components-basic-tree projects/components/widgets/basic/tree '@wm/components/basic/tree'

    ngBuild components-input projects/components/widgets/input '@wm/components/input'
    ngBuild components-input-calendar projects/components/widgets/input/calendar '@wm/components/input/calendar'
    ngBuild components-input-chips projects/components/widgets/input/chips '@wm/components/input/chips'
    ngBuild components-input-colorpicker projects/components/widgets/input/color-picker '@wm/components/input/color-picker'
    ngBuild components-input-currency projects/components/widgets/input/currency '@wm/components/input/currency'
    ngBuild components-input-epoch projects/components/widgets/input/epoch '@wm/components/input/epoch'
    ngBuild components-input-fileupload projects/components/widgets/input/file-upload '@wm/components/input/file-upload'
    ngBuild components-input-rating projects/components/widgets/input/rating '@wm/components/input/rating'
    ngBuild components-input-slider projects/components/widgets/input/slider '@wm/components/input/slider'

    ngBuild components-charts projects/components/widgets/chart '@wm/components/chart'

    ngBuild components-navigation-nav projects/components/widgets/navigation/nav '@wm/components/navigation/nav'
    ngBuild components-navigation-navbar projects/components/widgets/navigation/navbar '@wm/components/navigation/navbar'
    ngBuild components-navigation-breadcrumb projects/components/widgets/navigation/breadcrumb '@wm/components/navigation/breadcrumb'
    ngBuild components-navigation-menu projects/components/widgets/navigation/menu '@wm/components/navigation/menu'
    ngBuild components-navigation-popover projects/components/widgets/navigation/popover '@wm/components/navigation/popover'

    ngBuild components-containers-accordion projects/components/widgets/containers/accordion '@wm/components/containers/accordion'
    ngBuild components-containers-layoutgrid projects/components/widgets/containers/layout-grid '@wm/components/containers/layout-grid'
    ngBuild components-containers-panel projects/components/widgets/containers/panel '@wm/components/containers/panel'
    ngBuild components-containers-tabs projects/components/widgets/containers/tabs '@wm/components/containers/tabs'
    ngBuild components-containers-tile projects/components/widgets/containers/tile '@wm/components/containers/tile'
    ngBuild components-containers-wizard projects/components/widgets/containers/wizard '@wm/components/containers/wizard'

    ngBuild components-dialogs-alertdialog projects/components/widgets/dialogs/alert-dialog '@wm/components/dialogs/alert-dialog'
    ngBuild components-dialogs-confirmdialog projects/components/widgets/dialogs/confirm-dialog '@wm/components/dialogs/confirm-dialog'
    ngBuild components-dialogs-designdialog projects/components/widgets/dialogs/design-dialog '@wm/components/dialogs/design-dialog'
    ngBuild components-dialogs-iframedialog projects/components/widgets/dialogs/iframe-dialog '@wm/components/dialogs/iframe-dialog'
    ngBuild components-dialogs-partialdialog projects/components/widgets/dialogs/partial-dialog '@wm/components/dialogs/partial-dialog'

    ngBuild components-page projects/components/widgets/page '@wm/components/page'
    ngBuild components-page-footer projects/components/widgets/page/footer '@wm/components/page/footer'
    ngBuild components-page-header projects/components/widgets/page/header '@wm/components/page/header'
    ngBuild components-page-leftpanel projects/components/widgets/page/left-panel '@wm/components/page/left-panel'
    ngBuild components-page-rightpanel projects/components/widgets/page/footer '@wm/components/page/right-panel'
    ngBuild components-page-topnav projects/components/widgets/page/top-nav '@wm/components/page/top-nav'

    ngBuild components-prefab projects/components/widgets/prefab '@wm/components/prefab'

    ngBuild components-data-card projects/components/widgets/data/card '@wm/components/data/card'
    ngBuild components-data-pagination projects/components/widgets/data/pagination '@wm/components/data/pagination'
    ngBuild components-data-list projects/components/widgets/data/list '@wm/components/data/list'
    ngBuild components-data-table projects/components/widgets/data/table '@wm/components/data/table'
    ngBuild components-data-livetable projects/components/widgets/data/live-table '@wm/components/data/live-table'
    ngBuild components-data-form projects/components/widgets/data/form '@wm/components/data/form'

    ngBuild components-dialogs-logindialog projects/components/widgets/dialogs/login-dialog '@wm/components/dialogs/login-dialog'

    ngBuild components-advanced-carousel projects/components/widgets/advanced/carousel '@wm/components/advanced/carousel'
    ngBuild components-advanced-marquee projects/components/widgets/advanced/marquee '@wm/components/advanced/marquee'
    ngBuild components-advanced-login projects/components/widgets/advanced/login '@wm/components/advanced/login'

    ngBuild mobile-core projects/mobile/core '@wm/mobile/core'
    ngBuild mobile-offline projects/mobile/offline '@wm/mobile/offline'

    ngBuild mobile-components-basic projects/mobile/components/src/widgets/basic '@wm/mobile/components/basic'
    ngBuild mobile-components-containers-segmented projects/mobile/components/src/widgets/containers/segmented-control '@wm/mobile/components/containers/segmented-control'
    ngBuild mobile-components-data-medialist projects/mobile/components/src/widgets/data/media-list '@wm/mobile/components/data/media-list'
    ngBuild mobile-components-device-barcodescanner projects/mobile/components/src/widgets/device/barcode-scanner '@wm/mobile/components/device/barcode-scanner'
    ngBuild mobile-components-device-camera projects/mobile/components/src/widgets/device/camera '@wm/mobile/components/device/camera'

    ngBuild mobile-variables projects/mobile/variables '@wm/mobile/variables'
    ngBuild mobile-runtime projects/mobile/runtime '@wm/mobile/runtime'
    ngBuild mobile-placeholder projects/mobile/placeholder '@wm/mobile/placeholder'

    if [[ ${hasChangesInComponents} -eq "0" ]]; then
        ./node_modules/.bin/ng-packagr -p projects/components/transpile/ng-package.json -c ./projects/components/transpile/tsconfig.lib.json
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
            local destFileName=`echo $(basename ${file}) | tr 'A-Z' 'a-z'`;
            cp ${file} ${appDest}/angular/${destFileName}
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

buildAngularTextMask() {
    execCommand "rollup" "angular2-text-mask" "${ROLLUP} -c ./config/rollup.angular2-text-mask.config.js --silent"
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
    ${TERSER} \
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
        ./dist/tmp/libs/angular2-text-mask/angular2-text-mask.umd.js \
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
        ./projects/components/widgets/data/table/src/datatable.js \
        -o ./dist/bundles/wmapp/scripts/wm-libs.js -b

    ./node_modules/.bin/terser ./dist/bundles/wmapp/scripts/wm-libs.js \
        -c -o ./dist/bundles/wmapp/scripts/wm-libs.min.js -m   -b beautify=false,ascii_only=true


    if [[ "$?" -eq "0" ]]; then
        echo "uglify: web-libs - success"
    else
        echo -e "uglify: web-libs - failure"
    fi
}

bundleMobileLibs() {
    echo "uglify: mobile-libs"
    ${TERSER} \
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
        ./dist/tmp/libs/angular2-text-mask/angular2-text-mask.umd.js \
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
        ./projects/components/widgets/data/table/src/datatable.js \
        ./dist/tmp/libs/ionic-native/ionic-native-core.umd.js \
        ./dist/tmp/libs/ionic-native/ionic-native-plugins.umd.js \
        ./node_modules/iscroll/build/iscroll.js \
        ./node_modules/js-cookie/src/js.cookie.js \
        -o ./dist/bundles/wmmobile/scripts/wm-libs.js -b

    ./node_modules/.bin/terser ./dist/bundles/wmmobile/scripts/wm-libs.js \
        -c -o ./dist/bundles/wmmobile/scripts/wm-libs.min.js -m   -b beautify=false,ascii_only=true


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
    buildAngularTextMask
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
