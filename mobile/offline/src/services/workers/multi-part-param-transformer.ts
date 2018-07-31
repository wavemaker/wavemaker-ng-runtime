import { DeviceFileService } from '@wm/mobile/core';

import { Change, Worker } from '../change-log.service';
import { LocalDBManagementService } from '../local-db-management.service';

declare const _;

export class MultiPartParamTransformer implements Worker {

    constructor(private deviceFileService: DeviceFileService,
                private localDBManagementService: LocalDBManagementService) {

    }

    public postCallSuccess(change: Change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    // clean up files
                    _.forEach(change.params.data, v => {
                        if (_.isObject(v) && v.wmLocalPath) {
                            this.deviceFileService.removeFile(v.wmLocalPath);
                        }
                    });
                    break;
            }
        }
    }

    public transformParamsFromMap(change: Change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then( store => {
                            // construct Form data
                            return store.deserialize(change.params.data).then(function (formData) {
                                change.params.data = formData;
                            });
                        });
            }
        }
    }

    public transformParamsToMap(change: Change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then( store => {
                            return store.serialize(change.params.data).then(function (map) {
                                change.params.data = map;
                                /**
                                 * As save method called with FormData object, empty row is inserted.
                                 * Since FormData is converted to map, update the record details now.
                                 */
                                store.save(_.mapValues(map, function (v) {
                                    return (_.isObject(v) && v.wmLocalPath) || v;
                                }));
                                return map;
                            });
                        });
            }
        }
    }
}