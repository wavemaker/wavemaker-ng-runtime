#!/bin/sh

start=`date +%s`

force=false
copy=false
docs=false
locale=false
forcelibs=false

sourceModified=false

for arg in "$@"
do
    case ${arg} in
        -c | --copy)
            copy=true
            ;;
        -f | --force)
            force=true
            ;;
        -fl | --forcelibs)
            forcelibs=true
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
NGPACKAGR=./node_modules/.bin/ng-packagr
TSC=./node_modules/.bin/tsc
COMPODOC=./node_modules/.bin/compodoc

SUCCESS_FILE="BUILD_SUCCESS"

if [[ ${force} == true ]]; then
    rm -rf ./dist/
fi

mkdir -p ./dist/tmp/libs/core-js
mkdir -p ./dist/bundles/wmapp/scripts

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
    if [[ ${force} == true ]] || [[ ${forcelibs} == true ]]; then
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
hasLibJsChanges(){
    if [[ ${force} == true ]]; then
        return 0
    fi

    local successFile="./dist/LIB_${SUCCESS_FILE}"

    if ! [[ -e ${successFile} ]]; then
        return 0
    fi

    local updateTime=`date -r ./projects/components/widgets/data/table/src/datatable.js +%s`
    local buildTime=`date -r ${successFile} +%s`

	if [[ ${updateTime} -le ${buildTime} ]]; then
		return 1
	else
		return 0
	fi
    return 0
}
buildNeeded() {
    if [[ ${force} == true ]]; then
        return 1
    fi

    local bundle=$1
    local sourceLocation=$2
    local successFile="./dist/tmp/${bundle}_${SUCCESS_FILE}"

    if ! [[ -e ${successFile} ]]; then
        return 1
    fi

    local modifiedSourceFilesCount=`find ${sourceLocation} -type f \( -name "*.ts" ! -name "*.doc.ts"  -o -name "*.html" -o -name "*.json" \) -newer $successFile | wc -l`
    return $modifiedSourceFilesCount
}

rollup() {
    local bundle=$1
    execCommand rollup ${bundle} "$ROLLUP -c $bundle/rollup.config.js --silent"
}

ngPackagrBuild() {
    local bundle=$1
    local sourceLocation=$2
    local ngModuleName=$3;
    buildNeeded ${bundle} ${sourceLocation}
    if [[ "$?" -ne 0 ]]; then
        $NGPACKAGR -p $sourceLocation/ng-package.json -c $sourceLocation/tsconfig.lib.prod.json
        if [[ "$?" -eq "0" ]]; then
            touch ./dist/tmp/${bundle}_${SUCCESS_FILE}
        fi
        sourceModified=true
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
        ./libraries/components/transpile/bundles/index.umd.js \
        ./libraries/http/bundles/index.umd.js \
        ./libraries/oAuth/bundles/index.umd.js \
        ./libraries/security/bundles/index.umd.js \
        ./libraries/components/base/bundles/index.umd.js \
        ./libraries/components/input/base-form/bundles/index.umd.js \
        ./libraries/components/input/button/bundles/index.umd.js \
        ./libraries/components/input/base-form-custom/bundles/index.umd.js \
        ./libraries/components/input/dataset-aware-form/bundles/index.umd.js \
        ./libraries/components/input/text/bundles/index.umd.js \
        ./libraries/components/input/caption-position/bundles/index.umd.js \
        ./libraries/components/input/button-group/bundles/index.umd.js \
        ./libraries/components/input/checkbox/bundles/index.umd.js \
        ./libraries/components/input/checkboxset/bundles/index.umd.js \
        ./libraries/components/input/composite/bundles/index.umd.js \
        ./libraries/components/input/radioset/bundles/index.umd.js \
        ./libraries/components/input/select/bundles/index.umd.js \
        ./libraries/components/input/switch/bundles/index.umd.js \
        ./libraries/components/input/number/bundles/index.umd.js \
        ./libraries/components/input/textarea/bundles/index.umd.js \
        ./libraries/components/basic/anchor/bundles/index.umd.js \
        ./libraries/components/basic/audio/bundles/index.umd.js \
        ./libraries/components/basic/html/bundles/index.umd.js \
        ./libraries/components/basic/icon/bundles/index.umd.js \
        ./libraries/components/basic/iframe/bundles/index.umd.js \
        ./libraries/components/basic/label/bundles/index.umd.js \
        ./libraries/components/basic/picture/bundles/index.umd.js \
        ./libraries/components/basic/spinner/bundles/index.umd.js \
        ./libraries/components/basic/video/bundles/index.umd.js \
        ./libraries/components/basic/progress/progress-utils/bundles/index.umd.js \
        ./libraries/components/basic/progress/progress-bar/bundles/index.umd.js \
        ./libraries/components/basic/progress/progress-circle/bundles/index.umd.js \
        ./libraries/components/basic/rich-text-editor/bundles/index.umd.js \
        ./libraries/components/basic/search/bundles/index.umd.js \
        ./libraries/components/basic/tree/bundles/index.umd.js \
        ./libraries/components/input/calendar/bundles/index.umd.js \
        ./libraries/components/input/chips/bundles/index.umd.js \
        ./libraries/components/input/color-picker/bundles/index.umd.js \
        ./libraries/components/input/currency/bundles/index.umd.js \
        ./libraries/components/input/epoch/picker/bundles/index.umd.js \
        ./libraries/components/input/epoch/date-time-picker/bundles/index.umd.js \
        ./libraries/components/input/epoch/base-date-time/bundles/index.umd.js \
        ./libraries/components/input/epoch/date/bundles/index.umd.js \
        ./libraries/components/input/epoch/date-time/bundles/index.umd.js \
        ./libraries/components/input/epoch/time/bundles/index.umd.js \
        ./libraries/components/input/file-upload/bundles/index.umd.js \
        ./libraries/components/input/rating/bundles/index.umd.js \
        ./libraries/components/input/slider/bundles/index.umd.js \
        ./libraries/components/chart/bundles/index.umd.js \
        ./libraries/components/navigation/menu/bundles/index.umd.js \
        ./libraries/components/navigation/navbar/bundles/index.umd.js \
        ./libraries/components/navigation/breadcrumb/bundles/index.umd.js \
        ./libraries/components/navigation/popover/bundles/index.umd.js \
        ./libraries/components/dialogs/default/bundles/index.umd.js \
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
        ./libraries/components/containers/linear-layout/bundles/index.umd.js \
        ./libraries/components/containers/panel/bundles/index.umd.js \
        ./libraries/components/containers/tabs/bundles/index.umd.js \
        ./libraries/components/containers/tile/bundles/index.umd.js \
        ./libraries/components/containers/wizard/bundles/index.umd.js \
        ./libraries/components/advanced/carousel/bundles/index.umd.js \
        ./libraries/components/advanced/marquee/bundles/index.umd.js \
        ./libraries/components/advanced/login/bundles/index.umd.js \
        ./libraries/components/advanced/custom/bundles/index.umd.js \
        ./libraries/variables/bundles/index.umd.js \
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


buildApp() {
    ngPackagrBuild core projects/core '@wm/core'
    ngPackagrBuild transpiler projects/transpiler '@wm/transpiler'
    ngPackagrBuild swipey projects/swipey '@wm/swipey'
    ngPackagrBuild http-service projects/http-service '@wm/http'
    ngPackagrBuild oAuth projects/oAuth '@wm/oAuth'
    ngPackagrBuild security projects/security '@wm/security'
    ngPackagrBuild variables projects/variables '@wm/variables'
    ngPackagrBuild components-base projects/components/base '@wm/components/base'
    ngPackagrBuild components-input-button projects/components/widgets/input/button '@wm/components/input/button'
    ngPackagrBuild components-input-base-form projects/components/widgets/input/base-form '@wm/components/input/base-form'
    ngPackagrBuild components-input-base-form-custom projects/components/widgets/input/base-form-custom '@wm/components/input/base-form-custom'
    ngPackagrBuild components-input-dataset-aware-form projects/components/widgets/input/dataset-aware-form '@wm/components/input/dataset-aware-form'
    ngPackagrBuild components-input-text projects/components/widgets/input/text '@wm/components/input/text'
    ngPackagrBuild components-input-buttongroup projects/components/widgets/input/button-group '@wm/components/input/button-group'
    ngPackagrBuild components-input-caption-position projects/components/widgets/input/caption-position '@wm/components/input/caption-position'
    ngPackagrBuild components-input-checkbox projects/components/widgets/input/checkbox '@wm/components/input/checkbox'
    ngPackagrBuild components-input-checkboxset projects/components/widgets/input/checkboxset '@wm/components/input/checkboxset'
    ngPackagrBuild components-input-composite projects/components/widgets/input/composite '@wm/components/input/composite'
    ngPackagrBuild components-input-number projects/components/widgets/input/number '@wm/components/input/number'
    ngPackagrBuild components-input-radioset projects/components/widgets/input/radioset '@wm/components/input/radioset'
    ngPackagrBuild components-input-select projects/components/widgets/input/select '@wm/components/input/select'
    ngPackagrBuild components-input-textarea projects/components/widgets/input/textarea '@wm/components/input/textarea'
    ngPackagrBuild components-input-switch projects/components/widgets/input/switch '@wm/components/input/switch'
    ngPackagrBuild components-basic-anchor projects/components/widgets/basic/anchor '@wm/components/basic/anchor'
    ngPackagrBuild components-basic-audio projects/components/widgets/basic/audio '@wm/components/basic/audio'
    ngPackagrBuild components-basic-html projects/components/widgets/basic/html '@wm/components/basic/html'
    ngPackagrBuild components-basic-icon projects/components/widgets/basic/icon '@wm/components/basic/icon'
    ngPackagrBuild components-basic-iframe projects/components/widgets/basic/iframe '@wm/components/basic/iframe'
    ngPackagrBuild components-basic-label projects/components/widgets/basic/label '@wm/components/basic/label'
    ngPackagrBuild components-basic-picture projects/components/widgets/basic/picture '@wm/components/basic/picture'
    ngPackagrBuild components-basic-spinner projects/components/widgets/basic/spinner '@wm/components/basic/spinner'
    ngPackagrBuild components-basic-video projects/components/widgets/basic/video '@wm/components/basic/video'
    ngPackagrBuild components-basic-progress-progress-utils projects/components/widgets/basic/progress/progress-utils '@wm/components/basic/progress/progress-utils'
    ngPackagrBuild components-basic-progress-progress-bar projects/components/widgets/basic/progress/progress-bar '@wm/components/basic/progress/progress-bar'
    ngPackagrBuild components-basic-progress-progress-circle projects/components/widgets/basic/progress/progress-circle '@wm/components/basic/progress/progress-circle'
    ngPackagrBuild components-basic-richtexteditor projects/components/widgets/basic/rich-text-editor '@wm/components/basic/rich-text-editor'
    ngPackagrBuild components-basic-search projects/components/widgets/basic/search '@wm/components/basic/search'
    ngPackagrBuild components-basic-tree projects/components/widgets/basic/tree '@wm/components/basic/tree'

    ngPackagrBuild components-input-calendar projects/components/widgets/input/calendar '@wm/components/input/calendar'
    ngPackagrBuild components-input-chips projects/components/widgets/input/chips '@wm/components/input/chips'
    ngPackagrBuild components-input-colorpicker projects/components/widgets/input/color-picker '@wm/components/input/color-picker'
    ngPackagrBuild components-input-currency projects/components/widgets/input/currency '@wm/components/input/currency'
    ngPackagrBuild components-input-epoch-picker projects/components/widgets/input/epoch/picker '@wm/components/input/epoch/picker'
    ngPackagrBuild components-input-epoch-date-time-picker projects/components/widgets/input/epoch/date-time-picker '@wm/components/input/epoch/date-time-picker'
    ngPackagrBuild components-input-epoch-base-date-time projects/components/widgets/input/epoch/base-date-time '@wm/components/input/epoch/base-date-time'
    ngPackagrBuild components-input-epoch-date projects/components/widgets/input/epoch/date '@wm/components/input/epoch/date'
    ngPackagrBuild components-input-epoch-date-time projects/components/widgets/input/epoch/date-time '@wm/components/input/epoch/date-time'
    ngPackagrBuild components-input-epoch-time projects/components/widgets/input/epoch/time '@wm/components/input/epoch/time'
    ngPackagrBuild components-input-fileupload projects/components/widgets/input/file-upload '@wm/components/input/file-upload'
    ngPackagrBuild components-input-rating projects/components/widgets/input/rating '@wm/components/input/rating'
    ngPackagrBuild components-input-slider projects/components/widgets/input/slider '@wm/components/input/slider'

    ngPackagrBuild components-charts projects/components/widgets/chart '@wm/components/chart'

    ngPackagrBuild components-navigation-menu projects/components/widgets/navigation/menu '@wm/components/navigation/menu'
    ngPackagrBuild components-navigation-navbar projects/components/widgets/navigation/navbar '@wm/components/navigation/navbar'
    ngPackagrBuild components-navigation-breadcrumb projects/components/widgets/navigation/breadcrumb '@wm/components/navigation/breadcrumb'
    ngPackagrBuild components-navigation-popover projects/components/widgets/navigation/popover '@wm/components/navigation/popover'

    ngPackagrBuild components-containers-accordion projects/components/widgets/containers/accordion '@wm/components/containers/accordion'
    ngPackagrBuild components-containers-linearlayout projects/components/widgets/containers/linear-layout '@wm/components/containers/linear-layout'
    ngPackagrBuild components-containers-layoutgrid projects/components/widgets/containers/layout-grid '@wm/components/containers/layout-grid'
    ngPackagrBuild components-containers-panel projects/components/widgets/containers/panel '@wm/components/containers/panel'
    ngPackagrBuild components-containers-tabs projects/components/widgets/containers/tabs '@wm/components/containers/tabs'
    ngPackagrBuild components-containers-tile projects/components/widgets/containers/tile '@wm/components/containers/tile'
    ngPackagrBuild components-containers-wizard projects/components/widgets/containers/wizard '@wm/components/containers/wizard'

    ngPackagrBuild components-dialogs projects/components/widgets/dialogs/default '@wm/components/dialogs'
    ngPackagrBuild components-dialogs-alertdialog projects/components/widgets/dialogs/alert-dialog '@wm/components/dialogs/alert-dialog'
    ngPackagrBuild components-dialogs-confirmdialog projects/components/widgets/dialogs/confirm-dialog '@wm/components/dialogs/confirm-dialog'
    ngPackagrBuild components-dialogs-designdialog projects/components/widgets/dialogs/design-dialog '@wm/components/dialogs/design-dialog'
    ngPackagrBuild components-dialogs-iframedialog projects/components/widgets/dialogs/iframe-dialog '@wm/components/dialogs/iframe-dialog'
    ngPackagrBuild components-dialogs-partialdialog projects/components/widgets/dialogs/partial-dialog '@wm/components/dialogs/partial-dialog'

    ngPackagrBuild components-page projects/components/widgets/page/default '@wm/components/page'
    ngPackagrBuild components-page-footer projects/components/widgets/page/footer '@wm/components/page/footer'
    ngPackagrBuild components-page-header projects/components/widgets/page/header '@wm/components/page/header'
    ngPackagrBuild components-page-leftpanel projects/components/widgets/page/left-panel '@wm/components/page/left-panel'
    ngPackagrBuild components-page-rightpanel projects/components/widgets/page/right-panel '@wm/components/page/right-panel'
    ngPackagrBuild components-page-topnav projects/components/widgets/page/top-nav '@wm/components/page/top-nav'

    ngPackagrBuild components-prefab projects/components/widgets/prefab '@wm/components/prefab'

    ngPackagrBuild components-data-card projects/components/widgets/data/card '@wm/components/data/card'
    ngPackagrBuild components-data-pagination projects/components/widgets/data/pagination '@wm/components/data/pagination'
    ngPackagrBuild components-data-list projects/components/widgets/data/list '@wm/components/data/list'
    ngPackagrBuild components-data-table projects/components/widgets/data/table '@wm/components/data/table'
    ngPackagrBuild components-data-livetable projects/components/widgets/data/live-table '@wm/components/data/live-table'
    ngPackagrBuild components-data-form projects/components/widgets/data/form '@wm/components/data/form'

    ngPackagrBuild components-dialogs-logindialog projects/components/widgets/dialogs/login-dialog '@wm/components/dialogs/login-dialog'

    ngPackagrBuild components-advanced-carousel projects/components/widgets/advanced/carousel '@wm/components/advanced/carousel'
    ngPackagrBuild components-advanced-marquee projects/components/widgets/advanced/marquee '@wm/components/advanced/marquee'
    ngPackagrBuild components-advanced-login projects/components/widgets/advanced/login '@wm/components/advanced/login'
    ngPackagrBuild components-advanced-custom projects/components/widgets/advanced/custom '@wm/components/advanced/custom'

    buildNeeded components-transpilation projects/components/transpile
    if [[ $? -ne 0 ]]; then
        ./node_modules/.bin/ng-packagr -p projects/components/transpile/ng-package.json -c ./projects/components/transpile/tsconfig.lib.prod.json
        if [[ "$?" -eq "0" ]]; then
            touch ./dist/tmp/components-transpilation_${SUCCESS_FILE}
        fi
        sourceModified=true
    fi

    ngPackagrBuild runtime-base projects/runtime-base '@wm/runtime/base'
    ngPackagrBuild runtime-dynamic projects/runtime-dynamic '@wm/runtime/dynamic'

    if [[ "${sourceModified}" == true ]]; then
        buildWMComponentUmdLibs
        bundleWeb
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
        fi
    fi
}

copyLocale() {
    if [[ "${locale}" == true ]]; then

        local appDest=./dist/bundles/wmapp/locales

        local angularSrc=./node_modules/@angular/common/locales
        local momentSrc=./node_modules/moment/locale
        local timezoneSrc=./node_modules/moment-timezone/builds/moment-timezone-with-data.js

        mkdir -p ${appDest}/angular
        mkdir -p ${appDest}/angular/global
        mkdir -p ${appDest}/moment
        mkdir -p ${appDest}/moment-timezone

        for file in ${angularSrc}/*.js; do
            local destFileName=`echo $(basename ${file}) | tr 'A-Z' 'a-z'`;
            cp ${file} ${appDest}/angular/${destFileName}
        done
        for file in ${angularSrc}/global/*.js; do
            local destFileName=`echo $(basename ${file}) | tr 'A-Z' 'a-z'`;
            cp ${file} ${appDest}/angular/global/${destFileName}
        done

        cp ${momentSrc}/*.js ${appDest}/moment/

        cp ${timezoneSrc} ${appDest}/moment-timezone/
    fi
}

buildCoreJs() {
    execCommand "rollup" "core-js" "${ROLLUP} -c ./config/rollup.core-js.config.mjs"
}

buildTsLib() {
    execCommand "rollup" "tslib" "${ROLLUP} ./node_modules/tslib/tslib.es6.js --o ./dist/tmp/libs/tslib/tslib.umd.js -f umd --name tslib --silent"
}

buildNgxBootstrap() {
    execCommand "rollup" "ngx-bootstrap-libs" "${ROLLUP} -c ./config/rollup.ngxBootstrap.config.mjs"
    arr=(./node_modules/ngx-bootstrap/collapse/bundles/ngx-bootstrap-collapse.umd.js \
    ./node_modules/ngx-bootstrap/chronos/bundles/ngx-bootstrap-chronos.umd.js \
    ./node_modules/ngx-bootstrap/utils/bundles/ngx-bootstrap-utils.umd.js \
    ./node_modules/ngx-bootstrap/positioning/bundles/ngx-bootstrap-positioning.umd.js \
    ./node_modules/ngx-bootstrap/component-loader/bundles/ngx-bootstrap-component-loader.umd.js \
    ./node_modules/ngx-bootstrap/dropdown/bundles/ngx-bootstrap-dropdown.umd.js \
    ./node_modules/ngx-bootstrap/locale/bundles/ngx-bootstrap-locale.umd.js \
    ./node_modules/ngx-bootstrap/buttons/bundles/ngx-bootstrap-buttons.umd.js \
    ./node_modules/ngx-bootstrap/carousel/bundles/ngx-bootstrap-carousel.umd.js \
    ./node_modules/ngx-bootstrap/mini-ngrx/bundles/ngx-bootstrap-mini-ngrx.umd.js \
    ./node_modules/ngx-bootstrap/focus-trap/bundles/ngx-bootstrap-focus-trap.umd.js \
    ./node_modules/ngx-bootstrap/modal/bundles/ngx-bootstrap-modal.umd.js \
    ./node_modules/ngx-bootstrap/pagination/bundles/ngx-bootstrap-pagination.umd.js \
    ./node_modules/ngx-bootstrap/popover/bundles/ngx-bootstrap-popover.umd.js \
    ./node_modules/ngx-bootstrap/progressbar/bundles/ngx-bootstrap-progressbar.umd.js \
    ./node_modules/ngx-bootstrap/rating/bundles/ngx-bootstrap-rating.umd.js \
    ./node_modules/ngx-bootstrap/sortable/bundles/ngx-bootstrap-sortable.umd.js \
    ./node_modules/ngx-bootstrap/tabs/bundles/ngx-bootstrap-tabs.umd.js \
    ./node_modules/ngx-bootstrap/timepicker/bundles/ngx-bootstrap-timepicker.umd.js \
    ./node_modules/ngx-bootstrap/tooltip/bundles/ngx-bootstrap-tooltip.umd.js \
    ./node_modules/ngx-bootstrap/typeahead/bundles/ngx-bootstrap-typeahead.umd.js \
    ./node_modules/ngx-bootstrap/datepicker/bundles/ngx-bootstrap-datepicker.umd.js \
    ./node_modules/ngx-bootstrap/accordion/bundles/ngx-bootstrap-accordion.umd.js)
    # Create the directory to place the concatinated ngx-bootstrap UMD files
    exec $(mkdir -p "./dist/tmp/libs/ngx-bootstrap")
    # Concatinated the all bootstrap umd files
    exec $(cat ${arr[*]} > ./dist/tmp/libs/ngx-bootstrap/ngx-bootstrap.umd.js)
}

buildUmdFiles() {
    execCommand "rollup" "ngx-toastr" "${ROLLUP} -c ./config/rollup.ngx-toastr.config.mjs"
    execCommand "rollup" "angular-websocket" "${ROLLUP} -c ./config/rollup.angular-websocket.config.mjs"
    execCommand "rollup" "ng-circle-progress" "${ROLLUP} -c ./config/rollup.ng-circle-progress.config.mjs"
    execCommand "rollup" "ngx-libs" "${ROLLUP} -c ./config/rollup.ngx-libs.config.mjs"
}

buildAngularUmdLibs() {
    execCommand "rollup" "ng-libs-umd" "${ROLLUP} -c ./config/rollup.ng-libs.config.mjs"
}

buildWMComponentUmdLibs() {
    execCommand "rollup" "wm-components-umd" "${ROLLUP} -c ./config/rollup.wm-components.config.mjs"
}

bundleWebLibs() {
    bundleJS
    cpRuntimeFoundationCss
}

bundleJS() {
    echo "uglify: web-libs"
    ${TERSER} \
        ./dist/tmp/libs/tslib/tslib.umd.js \
        ./dist/tmp/libs/core-js/core-js.umd.js \
        ./node_modules/zone.js/bundles/zone.umd.js \
        ./node_modules/rxjs/dist/bundles/rxjs.umd.js \
        ./node_modules/@angular/compiler/bundles/compiler.umd.js \
        ./node_modules/@angular/core/bundles/core-signals.umd.js \
        ./node_modules/@angular/core/bundles/core-event-dispatch.umd.js \
        ./node_modules/@angular/core/bundles/core-di.umd.js \
        ./node_modules/@angular/core/bundles/core.umd.js \
        ./node_modules/@angular/common/bundles/common.umd.js \
        ./node_modules/@angular/animations/bundles/animations.umd.js \
        ./node_modules/@angular/animations/bundles/animations-browser.umd.js \
        ./node_modules/@angular/platform-browser/bundles/platform-browser.umd.js \
        ./node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js \
        ./node_modules/@angular/platform-browser/bundles/platform-browser-animations.umd.js \
        ./node_modules/@angular/common/bundles/common-http.umd.js \
        ./node_modules/@angular/router/bundles/router.umd.js \
        ./node_modules/@angular/forms/bundles/forms.umd.js \
        ./node_modules/ngx-toastr/bundles/ngx-toastr.umd.js \
        ./dist/tmp/libs/angular-websocket/angular-websocket.umd.js \
        ./dist/tmp/libs/ng-circle-progress/ng-circle-progress.umd.js \
        ./node_modules/ngx-color-picker/bundles/ngx-color-picker.umd.js \
        ./node_modules/lodash/lodash.js \
        ./node_modules/moment/moment.js \
        ./node_modules/moment-timezone/moment-timezone.js \
        ./node_modules/x2js/x2js.js \
        ./node_modules/d3/dist/d3.min.js \
        ./node_modules/he/he.js \
        ./node_modules/@wavemaker/nvd3/build/nv.d3.min.js \
        ./node_modules/jquery/dist/jquery.min.js \
        ./node_modules/@fullcalendar/core/index.global.min.js \
        ./node_modules/@fullcalendar/daygrid/index.global.min.js \
        ./node_modules/@fullcalendar/interaction/index.global.min.js \
        ./node_modules/@fullcalendar/timegrid/index.global.min.js \
        ./node_modules/@fullcalendar/core/locales-all.global.min.js \
        ./node_modules/@fullcalendar/list/index.global.min.js \
        ./node_modules/jssha/dist/sha256.js \
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
        ./node_modules/jquery-ui/ui/widgets/draggable.js \
        ./node_modules/jquery-ui/ui/widgets/droppable.js \
        ./node_modules/iscroll/build/iscroll.js \
        ./projects/components/widgets/data/table/src/datatable.js \
        ./projects/swipey/src/swipey.jquery.plugin.js \
        ./projects/jquery.ui.touch-punch/jquery.ui.touch-punch.min.js \
        ../wavemaker-ui-variables/dist/umd/index.js \
        ../custom-widgets-m3/dist/umd/index.js \
        ./node_modules/imask/dist/imask.min.js \
        ./node_modules/angular-imask/bundles/angular-imask.umd.js \
        ./node_modules/@metrichor/jmespath/dist/jmespath.umd.js \
        ./dist/tmp/libs/ngx-bootstrap/ngx-bootstrap.umd.js \
        ./node_modules/tabbable/dist/index.umd.js   \
        ./node_modules/@wavemaker/focus-trap/dist/focus-trap.umd.js \
        ./node_modules/@ztree/ztree_v3/js/jquery.ztree.all.js \
        ./projects/components/widgets/basic/tree/src/keyboard-navigation.js \
        -o ./dist/bundles/wmapp/scripts/wm-libs.js -b

         ./node_modules/.bin/terser ./dist/bundles/wmapp/scripts/wm-libs.js \
        -c -o ./dist/bundles/wmapp/scripts/wm-libs.min.js -m   -b beautify=false,ascii_only=true


    if [[ "$?" -eq "0" ]]; then
        echo "uglify: web-libs - success"
    else
        echo -e "uglify: web-libs - failure"
    fi
}

cpRuntimeFoundationCss() {
    echo "Copying foundation folder to bundle directory"

    # Create destination directory if it doesn't exist
    mkdir -p ./dist/bundles/wmapp/styles/foundation

    # The foundation folder will be built through build-foundation-css target in studio front end build.xml
    # Copy the entire foundation folder including CSS and fonts
    cp -r ../wavemaker-foundation-css/dist/styles/foundation/* ./dist/bundles/wmapp/styles/foundation/

    if [[ "$?" -eq "0" ]]; then
        echo "Foundation folder copied successfully"
    else
        echo "Failed to copy foundation folder"
        exit 1
    fi
}

buildWebLibs() {
    buildCoreJs
    buildTsLib
    buildNgxBootstrap
    buildAngularUmdLibs
    buildUmdFiles

    bundleWebLibs
}

buildLibs() {
    hasLibChanges

    if [[ "$?" -eq "0" ]]; then
        npm install
        npm update
        buildWebLibs

        if [[ "$?" -eq "0" ]]; then
            touch ./dist/LIB_${SUCCESS_FILE}
        fi
    else
        hasLibJsChanges

        if [[ "$?" -eq "0" ]]; then
        bundleWebLibs
        if [[ "$?" -eq "0" ]]; then
            touch ./dist/LIB_${SUCCESS_FILE}
        fi
        else
            echo "No changes in package.json. use --force to re-build libs"
        fi
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
