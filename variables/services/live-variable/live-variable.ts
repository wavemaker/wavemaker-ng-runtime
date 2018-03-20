// import { ServiceVariable } from '@variables/services/service-variable/service-variable';
// import { StaticVariable } from '@variables/services/static-variable/static-variable';
import { StaticVariable } from './../static-variable/static-variable';
// import * as LVUtils from '@variables/services/live-variable/live-variable.utils';
import * as LVUtils from './live-variable.utils';

export class LiveVariable extends StaticVariable {

    name: string;
    dataSet: any;
    service: string;
    operation: string;
    maxResults: number;
    startUpdate: boolean;
    autoUpdate: boolean;
    inFlightBehavior: boolean;

    onBeforeUpdate: string;
    onResult: string;
    onError: string;
    onBeforeDatasetReady: string;
    onSuccess: string;

    constructor(variable: any) {
        super(variable);
        Object.assign(this, variable);
    }

    invoke(options, success, error) {
        LVUtils.listRecords(this, options, success, error);
    }

    listRecords(options, success, error) {
        LVUtils.listRecords(this, options, success, error);
    }

    updateRecord(options, success, error) {
        LVUtils.updateRecord(this, options, success, error);
    }

    insertRecord(options, success, error) {
        LVUtils.insertRecord(this, options, success, error);
    }

    deleteRecord(options, success, error) {
        LVUtils.deleteRecord(this, options, success, error);
    }

    setInput(key, val, options) {
        return LVUtils.setInput(this, key, val, options);
    }

    setFilter(key, val) {
        return LVUtils.setFilter(this, key, val);
    }

}
