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

################################ ngc

echo -e "${Cyan}Compiling typescript files using ngc ${White}"
$NGC -p ./runtime/tsconfig.build.json
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


########## final mobile bundle
echo -e "${Cyan}Bundling wm-loader for wm-mobile ${White}"
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
echo -e "${Green}Bundled wm-mobileloader ${White}\n"

end=`date +%s`

runtime=$((end-start))

echo -e "${Purple}Execution time: ${runtime}sec${White}\n"

cp -r ./dist/bundles/* ../../wavemaker-studio-saas/wavemaker-saas-client/local/webapp/remote-studio/
cp -r ./dist/bundles/* ../../wavemaker-studio-saas/wavemaker-saas-client/local/webapp/static-files/
echo -e "${Green}Copied files to studio-saas ${White}\n"