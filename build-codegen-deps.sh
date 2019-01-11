#!/usr/bin/env bash

#copy datatable to libraries
mkdir -p ./libraries/datatable/
cp ./projects/components/src/widgets/common/table/datatable.js ./libraries/datatable/

./node_modules/.bin/rollup -c ./rollup.build-task.js

tar -cf dist/codegen/app-skeleton.tar \
    ./libraries \
    ./src \
    angular.json \
    package.json  \
    package-lock.json \
    tsconfig.json \
    tsconfig.web-app.json

tar -cf dist/codegen/node_modules.tar ./node_modules/
