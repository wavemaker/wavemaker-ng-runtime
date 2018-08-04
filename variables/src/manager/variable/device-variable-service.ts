import { $invokeWatchers } from '@wm/core';

import { initiateCallback } from '../../util/variable/variables.utils';
import { IDeviceVariableOperation } from './device-variable-operation';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';

export class DeviceVariableService {

    name: string;

    protected operations: IDeviceVariableOperation[];

    invoke(variable: any, options: any) {
        const operation = this.operations.find(o => {
            return o.name === variable.operation;
        });
        if (operation == null) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null);
            return Promise.reject('Could not find operation');
        } else if (CONSTANTS.hasCordova) {
            const dataBindings = new Map<string, any>();
            if (variable.dataBinding !== undefined) {
                Object.entries(variable).forEach(o => {
                    dataBindings.set(o[0], o[1]);
                });
                Object.entries(variable.dataBinding).forEach(o => {
                    dataBindings.set(o[0], o[1]);
                });
            }
            return operation.invoke(variable, options, dataBindings)
                .then(function (data) {
                    variable.dataSet = data;
                    $invokeWatchers(true);
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, data);
                }, function (reason) {
                    variable.dataSet = {};
                    $invokeWatchers(true);
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null);
                });
        } else {
            return Promise.resolve()
                .then(() => {
                    initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, operation.model);
                    return operation.model;
                });
        }
    }
}
