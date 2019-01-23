#!/usr/bin/env bash

BASEDIR=$(dirname "$0")

#copy datatable to libraries
mkdir -p ${BASEDIR}/libraries/datatable/
cp ${BASEDIR}/projects/components/src/widgets/common/table/datatable.js ${BASEDIR}/libraries/datatable/

${BASEDIR}/node_modules/.bin/rollup -c ${BASEDIR}/rollup.build-task.js

${BASEDIR}/node_modules/.bin/rimraf dist/runtime-cli

mkdir -p ${BASEDIR}/dist/runtime-cli

mkdir -p ${BASEDIR}/dist/runtime-cli/angular-app
mkdir -p ${BASEDIR}/dist/runtime-cli/dependencies

cp -r ${BASEDIR}/src ${BASEDIR}/dist/runtime-cli/angular-app
cp -r ${BASEDIR}/libraries/ ${BASEDIR}/dist/runtime-cli/angular-app
cp ${BASEDIR}/angular.json ${BASEDIR}/package.json ${BASEDIR}/package-lock.json ${BASEDIR}/tsconfig.json ${BASEDIR}/tsconfig.web-app.json ${BASEDIR}/dist/runtime-cli/angular-app

cp ${BASEDIR}/dist/transpilation/transpilation-web.cjs.js ${BASEDIR}/dist/transpilation/transpilation-mobile.cjs.js ${BASEDIR}/dist/runtime-cli/dependencies
