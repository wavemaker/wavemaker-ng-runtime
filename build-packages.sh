#!/usr/bin/env bash

ng build core
ng build transpiler
ng build swipey
ng build http-service
ng build oAuth
ng build security
ng build variables
ng build components

./node_modules/.bin/ng-packagr -p projects/components/ng-package-buildtask.json -c ./projects/components/tsconfig.lib.json

./node_modules/.bin/rollup -c ./rollup.build-task.js
