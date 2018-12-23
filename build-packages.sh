#!/usr/bin/env bash

ng build core
ng build transpiler
ng build swipey
ng build http-service
ng build oAuth
ng build security
ng build variables
ng build components

ng build mobile-core
ng build mobile-offline
ng build mobile-variables
ng build mobile-components

./node_modules/.bin/ng-packagr -p projects/components/ng-package-buildtask.json -c ./projects/components/tsconfig.lib.json

./node_modules/.bin/ng-packagr -p projects/mobile/components/ng-package-buildtask.json -c ./projects/mobile/components/tsconfig.lib.json

./node_modules/.bin/rollup -c ./rollup.build-task.js
