#!/usr/bin/env bash

#ng build packages
ng build core
ng build transpiler
ng build swipey
ng build http-service
ng build oAuth
ng build security
ng build variables
ng build components
ng build runtime-base
ng build runtime-dynamic

ng build mobile-core
ng build mobile-offline
ng build mobile-variables
ng build mobile-components
ng build mobile-runtime
ng build mobile-placeholder


#components build task(mobile, web) -- start
./node_modules/.bin/ng-packagr -p projects/components/ng-package-buildtask.json -c ./projects/components/tsconfig.lib.json

./node_modules/.bin/ng-packagr -p projects/mobile/components/ng-package-buildtask.json -c ./projects/mobile/components/tsconfig.lib.json

./node_modules/.bin/rollup -c ./rollup.build-task.js
#components build task(mobile, web) -- end

#copy datatable -- start
mkdir -p ./libraries/datatable/
cp ./projects/components/src/widgets/common/table/datatable.js ./libraries/datatable/
#copy datatable -- end
