start=`date +%s`
rimraf=./node_modules/.bin/rimraf
rollup=./node_modules/.bin/rollup
uglifyjs=./node_modules/.bin/uglifyjs
ngc=./node_modules/.bin/ngc
tsc=./node_modules/.bin/tsc

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


echo -e "${Cyan}Cleanup dist directory\n"
$rimraf ./dist
mkdir dist

if [ "$?" != "0" ]
then
	echo -e "${Red}Error in cleaning dist directory\n"
	exit 1
fi

################################ ngc

echo -e "${Cyan}Compiling typescript files using ngc ${White}"
$ngc -p ./runtime/tsconfig.build.json
if [ "$?" != "0" ]
then
	echo -e "${Red}Error while ngc \n"
	exit 1
fi
echo -e "${Green}Done with ngc compilation\n"



################################ inline-templates

echo -e "${Cyan}Copy and inline html files ${White}"
node inline-templates.js
if [ "$?" != "0" ]
then
	echo -e "${Red}Error during inline templates\n"
	exit 1
fi
echo -e "${Green}Done with inline templates\n"

mkdir ./dist/bundles
mkdir ./dist/tmp


################################ Bundle libs

if [ "$1" != "-sl" ]
then
    echo -e "${Cyan}Building tslib ${White}"
    $rollup ./node_modules/tslib/tslib.es6.js --o ./dist/tmp/tslib.umd.js -f umd --name tslib --silent
    if [ "$?" != "0" ]
    then
    	echo -e "${Red}Error in bundling tslib files"
    	exit 1
    fi
    echo -e "${Green}Built tslib\n"

    echo -e "${Cyan}Building @angular/common/http ${White}"
    $rollup -c ./config/rollup.angular.common-http.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in building @angular/common/http"
        exit 1
    fi
    echo -e "${Green}Built common-http\n"

    echo -e "${Cyan}Building ngx-bootstrap ${White}"
    $tsc --outDir dist/tmp --target es5 ./node_modules/ngx-bootstrap/bundles/ngx-bootstrap.es2015.js --allowJs --skipLibCheck --module es2015
    $rollup -c ./config/rollup.ngx-bootstrap.config.js --silent
    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in building ngx-bootstrap"
        exit 1
    fi
    echo -e "${Green}Built ngx-bootstrap\n"

    echo -e "${Cyan}Bundling libs ${White}"
    $uglifyjs \
        ./dist/tmp/tslib.umd.js \
        ./node_modules/zone.js/dist/zone.js \
        ./node_modules/rxjs/bundles/Rx.js \
        ./node_modules/@angular/core/bundles/core.umd.js \
        ./node_modules/@angular/common/bundles/common.umd.js \
        ./node_modules/@angular/compiler/bundles/compiler.umd.js \
        ./node_modules/@angular/platform-browser/bundles/platform-browser.umd.js \
        ./node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js \
        ./dist/tmp/common-http.umd.js \
        ./node_modules/@angular/forms/bundles/forms.umd.js \
        ./node_modules/@angular/router/bundles/router.umd.js \
        ./dist/tmp/ngx-bootstrap.umd.js \
        ./node_modules/ngx-color-picker/bundles/ngx-color-picker.umd.js \
        ./node_modules/lodash/lodash.js \
        ./node_modules/moment/moment.js \
        ./node_modules/jquery/dist/jquery.min.js \
        ./node_modules/fullcalendar/dist/fullcalendar.min.js \
        ./node_modules/jquery-ui/ui/disable-selection.js \
        ./node_modules/jquery-ui/ui/version.js \
        ./node_modules/jquery-ui/ui/widget.js \
        ./node_modules/jquery-ui/ui/plugin.js \
        ./node_modules/jquery-ui/ui/widgets/mouse.js \
        ./node_modules/jquery-ui/ui/widgets/resizable.js \
        ./components/widgets/table/datatable.js \
        -o ./dist/bundles/wm-libs.min.js -b

    if [ "$?" != "0" ]
    then
        echo -e "${Red}Error in bundling libs\n"
        exit 1
    fi

    echo -e "${Green}Bundled libs\n"
fi


##################################### bundle wm-loader

########## utils
echo -e "${Cyan}Building utils ${White}"
$rollup -c ./utils/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building utils\n"
    exit 1
fi
echo -e "${Green}Built utils\n"

########## transpiler
echo -e "${Cyan}Building transpiler ${White}"
$rollup -c ./transpiler/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building transpiler\n"
    exit 1
fi
echo -e "${Green}Built transpiler\n"

########## components
echo -e "${Cyan}Building components build task ${White}"
$rollup -c ./components/rollup.wm-components.build.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building components build task \n"
    exit 1
fi
echo -e "${Green}Built components build task\n"

echo -e "${Cyan}Building components ${White}"
$rollup -c ./components/rollup.wm-components.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building components\n"
    exit 1
fi
echo -e "${Green}Built components\n"

########## http-service
echo -e "${Cyan}Building http-service ${White}"
$rollup -c ./http-service/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building http-service\n"
    exit 1
fi
echo -e "${Green}Built http-service\n"

########## variables
echo -e "${Cyan}Building Variables ${White}"
$rollup -c ./variables/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in building Variables\n"
    exit 1
fi
echo -e "${Green}Built Variables\n"

########## runtime
echo -e "${Cyan}Building runtime ${White}"
$rollup -c ./runtime/rollup.config.js --silent
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling runtime"
    exit 1
fi
echo -e "${Green}Built runtime\n"

########## final bundle
echo -e "${Cyan}Bundling wm-loader ${White}"
$uglifyjs ./dist/tmp/wm-utils.umd.js \
    ./dist/tmp/wm-transpiler.umd.js \
    ./dist/tmp/wm-components.build.umd.js \
    ./dist/tmp/wm-components.umd.js \
    ./dist/tmp/http-service.umd.js \
    ./dist/tmp/wm-variables.umd.js \
    ./dist/tmp/wm-runtime.umd.js -o \
    ./dist/bundles/wm-loader.min.js -b
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling wm-loader\n"
    exit 1
fi
echo -e "${Green}Bundled wm-loader\n"

echo -e "${Cyan}Cleanup tmp directory\n"
$rimraf ./dist/tmp

echo -e "${Cyan}Cleanup out-tsc directory\n"
$rimraf ./dist/out-tsc

end=`date +%s`
runtime=$((end-start))

echo -e "${Purple}Execution time: ${runtime}sec"