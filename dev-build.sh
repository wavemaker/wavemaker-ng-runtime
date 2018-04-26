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

echo -e "${Cyan}Cleanup tmp and out-tsc directories ${White}\n"
$RIMRAF ./dist/out-tsc ./dist/tmp

if [ "$?" != "0" ]
then
	echo -e "${Red}Error in cleaning dist directory ${White}\n"
	exit 1
fi

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

mkdir -p ./dist/bundles/wmapp/scripts
mkdir ./dist/tmp

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
    ./dist/tmp/wm-runtime.umd.js -o \
    ./dist/bundles/wmapp/scripts/wm-loader.min.js -b
if [ "$?" != "0" ]
then
    echo -e "${Red}Error in bundling wm-loader ${White}\n"
    exit 1
fi
echo -e "${Green}Bundled wm-loader ${White}\n"

##cp ./dist/tmp/wm-libs.min.js ./dist/bundles/wmapp/scripts/

echo -e "${Cyan}Cleanup tmp directory ${White}\n"
$RIMRAF ./dist/tmp

echo -e "${Cyan}Cleanup out-tsc directory ${White}\n"
$RIMRAF ./dist/out-tsc

end=`date +%s`

runtime=$((end-start))

echo -e "${Purple}Execution time: ${runtime}sec${White}\n"

cp ./dist/bundles/wmapp/scripts/* ../wavemaker-studio-editor/src/main/webapp/wmapp/scripts/
echo -e "${Green}Copied files to studio-editor ${White}\n"


