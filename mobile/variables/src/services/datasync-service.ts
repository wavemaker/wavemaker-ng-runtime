import { Observer } from 'rxjs/index';

import { App, noop } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { ProcessApi, ProcessManagementService } from '@wm/mobile/components';
import { Change, ChangeLogService, PushInfo } from '@wm/mobile/offline';
import { DeviceVariableService, IDeviceVariableOperation, initiateCallback } from '@wm/variables';
import { SecurityService } from '@wm/security';

declare const _;

const APP_IS_OFFLINE = 'App is offline.';
const OFFLINE_PLUGIN_NOT_FOUND = 'Offline DB Plugin is required, but missing.';
const ON_BEFORE_BLOCKED = 'onBefore callback returned false.';
const REQUIRED_PLUGINS = ['OFFLINE_DB', 'NETWORK'];

export class DatasyncService extends DeviceVariableService {
    public readonly name = 'datasync';
    public readonly operations: IDeviceVariableOperation[] = [];

    constructor(app: App,
                changeLogService: ChangeLogService,
                processManagementService: ProcessManagementService,
                securityService: SecurityService,
                networkService: NetworkService) {
        super();
        this.operations.push(new PullOperation(networkService, securityService));
        this.operations.push(new PushOperation(app, changeLogService, processManagementService, networkService, securityService));
    }
}

class PullOperation implements IDeviceVariableOperation {
    public readonly name = 'pull';
    public readonly model = {};
    public readonly properties = [];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(
        private networkService: NetworkService,
        private securityService: SecurityService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return Promise.reject('TO DO');
    }
}

class PushOperation implements IDeviceVariableOperation {
    public readonly name = 'push';
    public readonly model = {
        successfulTaskCount: 0,
        failedTaskCount: 0,
        completedTaskCount: 0,
        totalTaskCount: 0,
        inProgress: false
    };
    public readonly properties = [
        {target: 'onBefore', hide: false},
        {target: 'onProgress', hide: false},
        {target: 'showProgress', 'hide': false, 'value': true}
    ];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(private app: App,
                private changeLogService: ChangeLogService,
                private processManagementService: ProcessManagementService,
                private networkService: NetworkService,
                private securityService: SecurityService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        let progressInstance;
        if (this.changeLogService.isFlushInProgress()) {
            return Promise.resolve();
        }
        return canExecute(variable, this.networkService, this.securityService)
            .then(() => getOfflineChanges(this.changeLogService))
            .then(changes => {
                if (changes.pendingToSync.total <= 0) {
                    return Promise.reject('No Changes to flush');
                }
            }).then(() => {
                if (variable.showProgress) {
                    return this.processManagementService.createInstance(this.app.appLocale.LABEL_DATA_PUSH_PROGRESS);
                }
                return null;
            }).then((instance: ProcessApi) => {
                const progressObserver: Observer<PushInfo> = {
                    next: (pushInfo: PushInfo) => {
                        pushInfo = addOldPropertiesForPushData(pushInfo);
                        initiateCallback('onProgress', variable, pushInfo);
                        if (progressInstance) {
                            progressInstance.set('max', pushInfo.totalTaskCount);
                            progressInstance.set('value', pushInfo.completedTaskCount);
                        }
                    }, error: noop, complete: noop};
                const pushPromise = this.changeLogService.flush(progressObserver);
                if (instance) {
                    progressInstance = instance;
                    progressInstance.set('stopButtonLabel', this.app.appLocale.LABEL_DATA_PUSH_PROGRESS_STOP_BTN);
                    progressInstance.set('onStop', () => this.changeLogService.stop());
                }
                return pushPromise;
            })
            .catch(pushInfo => pushInfo)
            .then(pushInfo => {
                pushInfo = addOldPropertiesForPushData(pushInfo);
                if (progressInstance) {
                    progressInstance.destroy();
                }
                if (pushInfo.failedTaskCount !== 0) {
                    return Promise.reject(pushInfo);
                }
                return pushInfo;
            });
    }
}

/**
 * This function adds the old properties to the push dataSet to support old projects.
 * @param data
 * @returns {*}
 */
const addOldPropertiesForPushData = data => {
    const result = _.clone(data);
    result.success = data.successfulTaskCount;
    result.error = data.failedTaskCount;
    result.completed = data.completedTaskCount;
    result.total = data.totalTaskCount;
    return result;
};

const canExecute = (variable: any, networkService: NetworkService, securityService: SecurityService) => {
    if (!window['SQLitePlugin']) {
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
    if (!networkService.isConnected()) {
        return Promise.reject(APP_IS_OFFLINE);
    }
    return initiateCallback('onBefore', variable, null)
        .then(proceed => {
            if (proceed === false) {
                return Promise.reject(ON_BEFORE_BLOCKED);
            }
            // If user is authenticated and online, then start the data pull process.
            // TODO:  return securityService.onUserLogin();
        });
};

const generateChangeSet = (changes: Change[]) => {
    const createChanges =  _.filter(changes, function (c) {
        return c.service === 'DatabaseService' &&
            (c.operation === 'insertTableData'
                || c.operation === 'insertMultiPartTableData');
    }), updateChanges =  _.filter(changes, function (c) {
        return c.service === 'DatabaseService' &&
            (c.operation === 'updateTableData'
                || c.operation === 'updateMultiPartTableData');
    });
    return {
        total: changes ? changes.length : 0,
        database: {
            create: createChanges,
            update: updateChanges,
            delete: _.filter(changes, {service: 'DatabaseService', operation: 'deleteTableData'})
        },
        uploads: _.filter(changes, {service: 'OfflineFileUploadService', operation: 'uploadToServer'})
    };
};

const getOfflineChanges = (changeLogService: ChangeLogService) => {
    return changeLogService.getChanges().then(changes => {
        return {
            'total' : changes ? changes.length : 0,
            'pendingToSync' : generateChangeSet(_.filter(changes, {'hasError' : 0})),
            'failedToSync' : generateChangeSet(_.filter(changes, {'hasError' : 1}))
        };
    });
};