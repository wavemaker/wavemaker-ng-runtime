start=`date +%s`

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
rimraf ./dist

echo -e "${Cyan}Compiling typescript files using ngc ${White}"
./node_modules/.bin/ngc -p ./runtime/tsconfig.build.json
echo -e "${Green}Done with ngc compilation\n"

mkdir ./dist/bundles
mkdir ./dist/tmp


if [ "$1" != "-sl" ]
then
    echo -e "${Cyan}Building tslib ${White}"
    rollup ./node_modules/tslib/tslib.es6.js --o ./dist/tmp/tslib.umd.js -f umd --name tslib --silent
    echo -e "${Green}Built tslib\n"

    echo -e "${Cyan}Building @angular/common/http ${White}"
    rollup -c ./config/rollup.angular.common-http.config.js --silent
    echo -e "${Green}Built common-http\n"

    echo -e "${Cyan}Bundling libs ${White}"
    uglifyjs \
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
        -o ./dist/bundles/wm-libs.min.js -b

    echo -e "${Green}Bundled libs\n"
fi
#./dist/tmp/common-http.umd.js \
#./node_modules/@angular/common/bundles/common-http.umd.js \

echo -e "${Cyan}Building utils ${White}"
rollup -c ./utils/rollup.config.js --silent
echo -e "${Green}Built utils\n"

echo -e "${Cyan}Building components ${White}"
rollup -c ./components/rollup.config.js --silent
echo -e "${Green}Built components\n"

echo -e "${Cyan}Building runtime ${White}"
rollup -c ./runtime/rollup.config.js --silent
echo -e "${Green}Built runtime\n"

echo -e "${Cyan}Bundling wm-loader ${White}"
uglifyjs ./dist/tmp/wm-utils.umd.js ./dist/tmp/wm-components.umd.js ./dist/tmp/wm-runtime.umd.js -o ./dist/bundles/wm-loader.min.js -b
echo -e "${Green}Bundled wm-loader\n"

echo -e "${Cyan}Cleanup tmp directory\n"
rimraf ./dist/tmp

echo -e "${Cyan}Cleanup out-tsc directory\n"
rimraf ./dist/out-tsc

end=`date +%s`
runtime=$((end-start))

echo -e "${Purple}Execution time: ${runtime}sec"