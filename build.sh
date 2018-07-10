npm install
start=`date +%s`
RIMRAF=./node_modules/.bin/rimraf
ROLLUP=./node_modules/.bin/rollup
UGLIFYJS=./node_modules/.bin/uglifyjs
NGC=./node_modules/.bin/ngc
TSC=./node_modules/.bin/tsc

set -e

# Reset
Color_Off='\033[0m'       # Text Reset

# Regular Colors
Black='\033[0;30m'        # Black
Red='\033[0;31m'          # Red
Green='\033[0;32m'        # Green
Yellow='\033[0;33m'       # Yellow
Blue='\033[0;34m'         # Blue
Purple='\033[0;35m'       # Purple
Cyan='\033[0;36m'         # Cyan
White='\033[0;37m'        # White


#############################################################################


echo -e "${Cyan}Cleanup dist directory ${White} \n"
$RIMRAF ./dist

mkdir -p dist/tmp

if [ "$?" != "0" ]
then
	echo -e "${Red}Error in cleaning dist directory ${White}\n"
	exit 1
fi

################################ core-js

echo -e "${Cyan}Build core-js umd ${White} \n"
node ./core-js-builder.js
if [ "$?" != "0" ]
then
	echo -e "${Red}Error in creating core-js umd ${White}\n"
	exit 1
fi

################################ ngc

echo -e "${Cyan}Compiling typescript files using ngc ${White}"
$NGC -p ./runtime/tsconfig.build.json
$NGC -p ./mobile/placeholder/tsconfig.build.json
if [ "$?" != "0" ]
then
	echo -e "${Red}Error while ngc ${White}\n"
	exit 1
fi
echo -e "${Green}Done with ngc compilation ${White}\n"

################################ inline-templates

echo -e "${Cyan}Copy and inline html files ${White}"
node inline-templates.js
if [ "$?" != "0" ]
then
	echo -e "${Red}Error during inline templates ${White}\n"
	exit 1
fi
echo -e "${Green}Done with inline templates ${White}\n"

mkdir -p ./dist/bundles/wmapp/scripts
mkdir -p ./dist/bundles/wmmobile/scripts

################################ Bundle libs

if [ "$1" != "-sl" ]
then
    echo -e "${Cyan}Building tslib ${White}"
    $ROLLUP ./node_modules/tslib/tslib.es6.js --o ./dist/tmp/tslib.umd.js -f umd --name tslib --silent
    if [ "$?" != "0" ]
    then
    	echo -e "${Red}Error in bundling tslib files"
    	exit 1
    fi
    echo -e "${Green}Built tslib\n"

    echo -e "${Cyan}Building ngx-bootstrap ${White}"
    $TSC --outDir dist/tmp --target es5 ./node_modules/ngx-bootstrap/bundles/ngx-bootstrap.es2015.js --allowJs --skipLibCheck --module es2015
    $ROLLUP -c ./config/rollup.ngx-bootstrap.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in building ngx-bootstrap"
        exit 1
    fi
    echo -e "${Green}Built ngx-bootstrap\n"


    echo -e "${Cyan}Building ngx-toastr ${White}"
    $TSC --outDir dist/tmp --target es5 ./node_modules/ngx-toastr/esm2015/ngx-toastr.js --allowJs --skipLibCheck --module es2015
    $ROLLUP -c ./config/rollup.ngx-toastr.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in building ngx-toastr"
        exit 1
    fi
    echo -e "${Green}Built ngx-toastr\n"

    echo -e "${Cyan}Building ngx-mask ${White}"
    $TSC --outDir dist/tmp --target es5 ./node_modules/ngx-mask/esm2015/ngx-mask.js --allowJs --skipLibCheck --module es2015
    $ROLLUP -c ./config/rollup.ngx-mask.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in building ngx-mask"
        exit 1
    fi
    echo -e "${Green}Built ngx-mask\n"

    echo -e "${Cyan}Building angular-websocket ${White}"
    $TSC ./node_modules/angular2-websocket/src/angular2-websocket.ts  --target es5 --module es2015  --lib ES2017,DOM --moduleResolution node --outDir ./dist/tmp
    $ROLLUP -c ./config/rollup.angular-websocket.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in angular-websocket ${White}\n"
        exit 1
    fi
    echo -e "${Green}angular-websocket ${White}\n"



    echo -e "${Cyan}Building swipey ${White}"
    $ROLLUP -c ./swipey/rollup.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in building swipey ${White}\n"
        exit 1
    fi
    echo -e "${Green}Built swipey ${White}\n"

    echo -e "${Cyan}Bundling libs for wm-app ${White}"
    $UGLIFYJS \
        ./dist/tmp/tslib.umd.js \
        ./dist/tmp/core-js.umd.js \
        ./node_modules/zone.js/dist/zone.js \
        ./node_modules/rxjs/bundles/Rx.js \
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
        ./dist/tmp/ngx-bootstrap.umd.js \
        ./dist/tmp/ngx-toastr.umd.js \
        ./dist/tmp/angular-websocket.umd.js \
        ./dist/tmp/ngx-mask.umd.js \
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
        ./dist/tmp/swipey.umd.js \
        ./swipey/src/swipey.jquery.plugin.js \
        ./components/src/widgets/common/table/datatable.js \
        -o ./dist/bundles/wmapp/scripts/wm-libs.min.js -b

    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in bundling libs for wm-app \n"
        exit 1
    fi

    echo -e "${Green}Bundled libs for wm-app \n"

    ########## mobile components
    echo -e "${Cyan}Building ionic-native ${White}"
    $ROLLUP -c ./mobile/ionic-native/rollup.ionic-native.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in ionic-native ${White}\n"
        exit 1
    fi
    echo -e "${Green}Built ionic-native ${White}\n"

    echo -e "${Cyan}Bundling libs for wm-mobile ${White}"
    $UGLIFYJS \
        ./dist/tmp/tslib.umd.js \
        ./node_modules/zone.js/dist/zone.js \
        ./node_modules/rxjs/bundles/Rx.js \
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
        ./dist/tmp/ngx-bootstrap.umd.js \
        ./dist/tmp/ngx-toastr.umd.js \
        ./dist/tmp/ngx-mask.umd.js \
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
        ./dist/tmp/swipey.umd.js \
        ./swipey/src/swipey.jquery.plugin.js \
        ./components/src/widgets/common/table/datatable.js \
        ./dist/tmp/ionic-native-core.umd.js \
        ./dist/tmp/ionic-native-plugins.umd.js \
        ./node_modules/iscroll/build/iscroll.js \
        -o ./dist/bundles/wmmobile/scripts/wm-libs.min.js -b

    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in bundling libs for wm-mobile \n"
        exit 1
    fi
    echo -e "${Green}Bundled libs for wm-mobile\n"
fi


##################################### bundle wm-loader

########## core
echo -e "${Cyan}Building core ${White}"
$ROLLUP -c ./core/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building core ${White}\n"
    exit 1
fi
echo -e "${Green}Built core ${White}\n"

########## transpiler
echo -e "${Cyan}Building transpiler ${White}"
$ROLLUP -c ./transpiler/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building transpiler ${White}\n"
    exit 1
fi
echo -e "${Green}Built transpiler ${White}\n"

########## components
echo -e "${Cyan}Building components build task ${White}"
$ROLLUP -c ./components/rollup.wm-components.build-task.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building components build task ${White}\n"
    exit 1
fi
echo -e "${Green}Built components build task ${White}\n"

echo -e "${Cyan}Building components ${White}"
$ROLLUP -c ./components/rollup.wm-components.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building components ${White}\n"
    exit 1
fi
echo -e "${Green}Built components ${White}\n"
########## http-service
echo -e "${Cyan}Building http-service ${White}"
$ROLLUP -c ./http-service/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building http-service ${White}\n"
    exit 1
fi
echo -e "${Green}Built http-service ${White}\n"

########## oAuth
echo -e "${Cyan}Building oAuth ${White}"
$ROLLUP -c ./oAuth/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building oAuth ${White}\n"
    exit 1
fi
echo -e "${Green}Built oAuth ${White}\n"

########## Security
echo -e "${Cyan}Building Security ${White}"
$ROLLUP -c ./security/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building Security ${White}\n"
    exit 1
fi
echo -e "${Green}Built Security ${White}\n"

########## variables
echo -e "${Cyan}Building Variables ${White}"
$ROLLUP -c ./variables/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building Variables ${White}\n"
    exit 1
fi
echo -e "${Green}Built Variables ${White}\n"

########## mobile components
echo -e "${Cyan}Building mobile components task ${White}"
$ROLLUP -c ./mobile/components/rollup.wm-components.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in mobile components task ${White}\n"
    exit 1
fi
echo -e "${Green}Built mobile components task ${White}\n"
########## mobile runtime
echo -e "${Cyan}Building mobile runtime ${White}"
$ROLLUP -c ./mobile/runtime/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling runtime ${White}"
    exit 1
fi
echo -e "${Green}Built runtime ${White}\n"

########## runtime
echo -e "${Cyan}Building runtime ${White}"
$ROLLUP -c ./runtime/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling runtime ${White}"
    exit 1
fi
echo -e "${Green}Built runtime ${White}\n"

########## final bundle
echo -e "${Cyan}Bundling wm-loader ${White}"
$UGLIFYJS ./dist/tmp/wm-core.umd.js \
    ./dist/tmp/wm-transpiler.umd.js \
    ./dist/tmp/http-service.umd.js \
    ./dist/tmp/oAuth.umd.js \
    ./dist/tmp/wm-security.umd.js \
    ./dist/tmp/wm-components.build-task.umd.js \
    ./dist/tmp/wm-components.umd.js \
    ./dist/tmp/wm-variables.umd.js \
    ./dist/tmp/mobile/wm-components.umd.js \
    ./dist/tmp/mobile/wm-runtime.umd.js \
    ./dist/tmp/wm-runtime.umd.js -o \
    ./dist/bundles/wmapp/scripts/wm-loader.min.js -b
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling wm-loader ${White}\n"
    exit 1
fi
echo -e "${Green}Bundled wm-loader${White}\n"
################################ ngc
echo -e "${Cyan}Compiling typescript files for mobile using ngc ${White}"
$NGC -p ./runtime/tsconfig.build.json

################################ inline-templates

echo -e "${Cyan}Copy and inline html files ${White}"
node inline-templates.js
if [ "$?" != "0" ]
then
	echo -e "${Red}Error during inline templates ${White}\n"
	exit 1
fi
echo -e "${Green}Done with inline templates ${White}\n"

########## mobile core
echo -e "${Cyan}Building mobile core task ${White}"
$ROLLUP -c ./mobile/core/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building mobile core task ${White}\n"
    exit 1
fi
echo -e "${Green}Built mobile core task ${White}\n"


########## mobile components
echo -e "${Cyan}Building mobile components build task ${White}"
$ROLLUP -c ./mobile/components/rollup.wm-components.build-task.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building mobile components build task ${White}\n"
    exit 1
fi
echo -e "${Green}Built mobile components build task ${White}\n"

echo -e "${Cyan}Building mobile components ${White}"
$ROLLUP -c ./mobile/components/rollup.wm-components.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building mobile components ${White}\n"
    exit 1
fi
echo -e "${Green}Built mobie components ${White}\n"

########## mobile variables
echo -e "${Cyan}Building mobile variables ${White}"
$ROLLUP -c ./mobile/variables/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling mobile variables ${White}"
    exit 1
fi
echo -e "${Green}Built mobile variables ${White}\n"

########## mobile runtime
echo -e "${Cyan}Building mobile runtime ${White}"
$ROLLUP -c ./mobile/runtime/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling mobile runtime ${White}"
    exit 1
fi
echo -e "${Green}Built mobile runtime ${White}\n"

########## final mobile bundle
echo -e "${Cyan}Bundling wm-mobileloader${White}"
$UGLIFYJS ./dist/tmp/wm-core.umd.js \
    ./dist/tmp/wm-transpiler.umd.js \
    ./dist/tmp/http-service.umd.js \
    ./dist/tmp/oAuth.umd.js \
    ./dist/tmp/wm-security.umd.js \
    ./dist/tmp/wm-components.build-task.umd.js \
    ./dist/tmp/wm-components.umd.js \
    ./dist/tmp/mobile/wm-core.umd.js \
    ./dist/tmp/mobile/wm-components.build-task.umd.js \
    ./dist/tmp/mobile/wm-components.umd.js \
    ./dist/tmp/wm-variables.umd.js \
    ./dist/tmp/mobile/wm-variables.umd.js \
    ./dist/tmp/mobile/wm-runtime.umd.js \
    ./dist/tmp/wm-runtime.umd.js -o \
    ./dist/bundles/wmmobile/scripts/wm-mobileloader.min.js -b
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling wm-mobileloader${White}\n"
    exit 1
fi
echo -e "${Green}Bundled wm-mobileloader${White}\n"

echo -e "${Cyan}Cleanup tmp directory ${White}\n"
$RIMRAF ./dist/tmp

echo -e "${Cyan}Cleanup out-tsc directory ${White}\n"
$RIMRAF ./dist/out-tsc

end=`date +%s`

runtime=$((end-start))

echo -e "${Purple}Execution time: ${runtime}sec${White}"
