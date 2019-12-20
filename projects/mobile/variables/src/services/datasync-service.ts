import { Observer } from 'rxjs/Observer';

import { App, noop, toPromise } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { FileSelectorService, ProcessApi, ProcessManagementService } from '@wm/mobile/components/basic';
import { Change, ChangeLogService, LocalDBManagementService, LocalDBDataPullService, PushInfo, PullInfo } from '@wm/mobile/offline';
import { DeviceVariableService, IDeviceVariableOperation, initiateCallback, VARIABLE_CONSTANTS } from '@wm/variables';
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
                fileSelectorService: FileSelectorService,
                localDBManagementService: LocalDBManagementService,
                localDBDataPullService: LocalDBDataPullService,
                processManagementService: ProcessManagementService,
                securityService: SecurityService,
                networkService: NetworkService) {
        super();
        this.operations.push(new ExportDBOperation(localDBManagementService));
        this.operations.push(new GetOfflineChangesOperation(changeLogService));
        this.operations.push(new ImportDBOperation(fileSelectorService, localDBManagementService));
        this.operations.push(new LastPullInfoOperation(localDBDataPullService));
        this.operations.push(new LastPushInfoOperation(changeLogService));
        this.operations.push(new PullOperation(app, processManagementService, networkService, securityService, localDBDataPullService));
        this.operations.push(new PushOperation(app, changeLogService, processManagementService, networkService, securityService));
    }
}

class ExportDBOperation implements IDeviceVariableOperation {
    public readonly name = 'exportDB';
    public readonly model = {path: ''};
    public readonly properties = [
        {target: 'spinnerContext', hide: false},
        {target: 'spinnerMessage', hide: false}
    ];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(private localDBManagementService: LocalDBManagementService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        if (window['SQLitePlugin']) {
            return this.localDBManagementService.exportDB();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}


class GetOfflineChangesOperation implements IDeviceVariableOperation {
    private static DATA_CHANGE_TEMPLATE = {
        service: 'DatabaseService',
        operation: 'operation',
        params: {
            data: {},
            dataModelName: 'dataModelName',
            entityName: 'entityName'
        },
        hasError: 0,
        errorMessage: ''
    };
    private static CHANGE_LOG_SET = {
        total: 0,
        database: {
            create: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE],
            update: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE],
            delete: [GetOfflineChangesOperation.DATA_CHANGE_TEMPLATE]
        },
        uploads: [{
            service: 'OfflineFileUploadService',
            operation: 'uploadToServer',
            params: {
                file: 'localFilePath',
                serverUrl: 'serverUrl',
                ftOptions: {}
            },
            hasError: 0,
            errorMessage: ''
        }]
    };
    public readonly name = 'getOfflineChanges';
    public readonly model = {
        total: 0,
        pendingToSync: GetOfflineChangesOperation.CHANGE_LOG_SET,
        failedToSync: GetOfflineChangesOperation.CHANGE_LOG_SET
    };
    public readonly properties = [
        {target: 'startUpdate', type: 'boolean', value: true, hide: true},
        {target: 'autoUpdate', type: 'boolean', value: true, hide: true}
    ];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(private changeLogService: ChangeLogService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        if (window['SQLitePlugin']) {
            return getOfflineChanges(this.changeLogService);
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}

class LastPullInfoOperation implements IDeviceVariableOperation {
    public readonly name = 'lastPullInfo';
    public readonly model = {
        databases : [{
            name : 'datbaseName',
            entities: [{
                entityName: 'entityName',
                pulledRecordCount: 0
            }],
            pulledRecordCount: 0
        }],
        totalPulledRecordCount: 0,
        startTime: new Date().toJSON(),
        endTime: new Date().toJSON()
    };
    public readonly properties = [
        {target: 'startUpdate', type: 'boolean', value: true, hide: true},
        {target: 'spinnerContext', hide: false},
        {target: 'spinnerMessage', hide: false}
    ];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(private localDBDataPullService: LocalDBDataPullService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        if (window['SQLitePlugin']) {
            return this.localDBDataPullService.getLastPullInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}

class LastPushInfoOperation implements IDeviceVariableOperation {
    public readonly name = 'lastPushInfo';
    public readonly model = {
        successfulTaskCount: 0,
        failedTaskCount: 0,
        completedTaskCount: 0,
        totalTaskCount: 0,
        startTime: new Date().toJSON(),
        endTime: new Date().toJSON()
    };
    public readonly properties = [
        {target: 'startUpdate', type: 'boolean', value: true, hide: true},
        {target: 'spinnerContext', hide: false},
        {target: 'spinnerMessage', hide: false}
    ];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(private changeLogService: ChangeLogService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        if (window['SQLitePlugin']) {
            return this.changeLogService.getLastPushInfo();
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}

class ImportDBOperation implements IDeviceVariableOperation {
    public readonly name = 'importDB';
    public readonly model = {};
    public readonly properties = [
        {target: 'spinnerContext', hide: false},
        {target: 'spinnerMessage', hide: false}
    ];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(
        private fileSelectorService: FileSelectorService,
        private localDBManagementService: LocalDBManagementService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        if (window['SQLitePlugin']) {
            return this.fileSelectorService.selectFiles(false,  'zip')
                .then(files => {
                if (files && files.length) {
                    return this.localDBManagementService.importDB(files[0].path, true);
                }
            });
        }
        return Promise.reject(OFFLINE_PLUGIN_NOT_FOUND);
    }
}

class PullOperation implements IDeviceVariableOperation {
    public readonly name = 'pull';
    public readonly model = {
        totalTaskCount: 0,
        completedTaskCount: 0,
        inProgress: false
    };
    public readonly properties = [
        {target: 'clearData', type: 'boolean', widgettype: 'boolean-inputfirst', value: true, group: 'properties', subGroup: 'behavior'},
        {target: 'startUpdate', type: 'boolean', hide: false},
        {target: 'onBefore', hide: false},
        {target: 'onProgress', hide: false},
        {target: 'showProgress', hide: false}
    ];
    public readonly requiredCordovaPlugins = REQUIRED_PLUGINS;

    constructor(
        private app: App,
        private processManagementService: ProcessManagementService,
        private networkService: NetworkService,
        private securityService: SecurityService,
        private localDBDataPullService: LocalDBDataPullService) {
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        let progressInstance;
        return canExecute(variable, this.networkService, this.securityService)
            .then(() => {
                if (variable.showProgress) {
                    return this.processManagementService.createInstance(this.app.appLocale.LABEL_DATA_PULL_PROGRESS, 0, 0);
                }
                return null;
            }).then((instance: ProcessApi) => {
                const progressObserver: Observer<PullInfo> = {
                    next: (pullInfo: PullInfo) => {
                        // variable.dataSet = progress; Todo: progress
                        initiateCallback('onProgress', variable, pullInfo);
                        if (progressInstance) {
                            progressInstance.set('max', pullInfo.totalRecordsToPull);
                            progressInstance.set('value', pullInfo.totalPulledRecordCount);
                        }
                    }, error: noop, complete: noop};

                const clearData = variable.clearData === 'true' || variable.clearData === true,
                    pullPromise = this.localDBDataPullService.pullAllDbData(clearData, progressObserver);
                if (instance) {
                    progressInstance = instance;
                    progressInstance.set('stopButtonLabel', this.app.appLocale.LABEL_DATA_PULL_PROGRESS_STOP_BTN);
                    progressInstance.set('onStop', () => {
                        this.localDBDataPullService.cancel(pullPromise);
                    });
                }
            return pullPromise;
        }).catch(pullInfo => pullInfo)
            .then(pullInfo => {
                if (progressInstance) {
                    progressInstance.destroy();
                }
                return pullInfo;
            });
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
                    return Promise.reject(_.clone(this.model));
                }
            }).then(() => {
                if (variable.showProgress) {
                    return this.processManagementService.createInstance(this.app.appLocale.LABEL_DATA_PUSH_PROGRESS, 0, 0);
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
                if (progressInstance) {
                    progressInstance.destroy();
                }
                if (pushInfo && pushInfo.totalTaskCount !== undefined) {
                    pushInfo = addOldPropertiesForPushData(pushInfo);
                    if (pushInfo.failedTaskCount !== 0) {
                        return Promise.reject(pushInfo);
                    }
                    return pushInfo;
                }
                return Promise.reject(pushInfo);
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
    return toPromise(initiateCallback(VARIABLE_CONSTANTS.EVENT.BEFORE, variable, null))
        .then(proceed => {
            if (proceed === false) {
                return Promise.reject(ON_BEFORE_BLOCKED);
            }
            // If user is authenticated and online, then start the data pull process.
            return securityService.onUserLogin();
        });
};

const generateChangeSet = (changes: Change[]) => {
    const createChanges =  _.filter(changes, c => {
        return c.service === 'DatabaseService' &&
            (c.operation === 'insertTableData'
                || c.operation === 'insertMultiPartTableData');
    }), updateChanges =  _.filter(changes, c => {
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
