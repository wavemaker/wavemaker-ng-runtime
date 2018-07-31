import { Injectable } from '@angular/core';

import { Observer } from 'rxjs/index';

import { executePromiseChain, getAbortableDefer, isString, noop } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';

import { LocalDBManagementService } from './local-db-management.service';
import { LocalKeyValueService } from './local-key-value.service';
import { LocalDBStore } from '../models/local-db-store';

declare const _;

export interface Change {
    id?: number;
    errorMessage?: string;
    hasError: number;
    operation: string;
    params: any;
    service: string;
}

export interface FlushContext {
    clear: () => Promise<any>;
    get: (key: string) => any;
    set: (key: string, value: any) => Promise<any>;
    save: () => Promise<any>;
}

export interface Worker {
    onAddCall?: (change: Change) => (Promise<any> | void);
    preFlush?: (context: FlushContext) => (Promise<any> | void);
    postFlush?: (pushInfo: PushInfo, context: FlushContext) => (Promise<any> | void);
    preCall?: (change: Change) => (Promise<any> | void);
    postCallError?: (change: Change, error: any) => (Promise<any> | void);
    postCallSuccess?: (change: Change, response: any) => (Promise<any> | void);
    transformParamsToMap?: (change: Change) => (Promise<any> | void);
    transformParamsFromMap?: (change: Change) => (Promise<any> | void);
}

export interface PushInfo {
    completedTaskCount: number;
    endTime: Date;
    failedTaskCount: number;
    inProgress: boolean;
    startTime: Date;
    successfulTaskCount: number;
    totalTaskCount: number;
}

export abstract class PushService {
    public abstract push(change: Change): Promise<any>;
}

export const CONTEXT_KEY = 'changeLogService.flushContext';
export const LAST_PUSH_INFO_KEY = 'changeLogService.lastPushInfo';

@Injectable()
export class ChangeLogService {

    private workers: Worker[] = [];

    private flushContext: FlushContext;

    private currentPushInfo: PushInfo;

    private deferredFlush;

    constructor(private localDBManagementService: LocalDBManagementService,
                private localKeyValueService: LocalKeyValueService,
                private pushService: PushService,
                private networkService: NetworkService) {
        this.currentPushInfo = {} as PushInfo;
        this.addWorker(new FlushTracker(this,  this.localKeyValueService, this.currentPushInfo));
    }


    /**
     * adds a service call to the log. Call will be invoked in next flush.
     *
     * @Param {string} name of service (This should be available through $injector)
     * @Param {string} name of method to invoke.
     * @Param {object} params
     */
    public add(service: string, operation: string, params: any): Promise<void> {
        const change: Change = {
            service: service,
            operation: operation,
            params: params,
            hasError: 0
        };
        return executePromiseChain(_.map(this.workers, 'transformParamsToMap'), [change])
            .then(() => executePromiseChain(_.map(this.workers, 'onAddCall'), [change]))
            .then(() => {
                change.params = JSON.stringify(change.params);
                return this.getStore().then(store => store.add(change)).then(noop);
            });
    }

    public addWorker(worker: Worker) {
        this.workers.push(worker);
    }

    /**
     * Clears the current log.
     */
    public clearLog() {
        return this.getStore().then( s => s.clear());
    }

    /**
     * Flush the current log. If a flush is already running, then the promise of that flush is returned back.
     */
    public flush(progressObserver: Observer<PushInfo>) {
        let flushPromise;
        if (!this.deferredFlush) {
            this.deferredFlush = getAbortableDefer();
            this.createContext().then(context => {
                this.flushContext = context;
                return executePromiseChain(_.map(this.workers, 'preFlush'), [this.flushContext]);
            })
                .then(() => {
                    flushPromise = this._flush(progressObserver);
                    this.deferredFlush.onAbort = () => flushPromise.abort();
                    return flushPromise;
                })
                .catch(noop)
                .then(() => {
                    Promise.resolve().then(() => {
                        if (this.currentPushInfo.totalTaskCount === this.currentPushInfo.completedTaskCount) {
                            return this.flushContext.clear().then(() => this.flushContext = null);
                        }
                    }).then(() => {
                        progressObserver.complete();
                        if (this.currentPushInfo.failedTaskCount > 0) {
                            this.deferredFlush.reject(this.currentPushInfo);
                        } else {
                            this.deferredFlush.resolve(this.currentPushInfo);
                        }
                        this.deferredFlush = null;
                    }).then(() => {
                        return executePromiseChain(_.map(this.workers, 'postFlush'), [this.currentPushInfo, this.flushContext]);
                    });
                });
        }
        return this.deferredFlush.promise;
    }

    /**
     * Returns the complete change list
     */
    public getChanges() {
        return this.getStore().then( s => s.filter(undefined, 'id', {
            offset: 0,
            limit: 500
        })).then(changes => {
            changes.forEach(change => {
                change.params = JSON.parse(change.params);
            });
            return changes;
        });
    }


    /**
     * @returns {array} an array of changes that failed with error.
     */
    public getErrors(): Promise<Change[]> {
        return this.getStore().then( s => s.filter([{
            attributeName: 'hasError',
            attributeValue: 1,
            attributeType: 'NUMBER',
            filterCondition: 'EQUALS'
        }]));
    }


    public getLastPushInfo(): Promise<PushInfo> {
        return this.localKeyValueService.get(LAST_PUSH_INFO_KEY)
            .then(info => {
                if (isString(info.startTime)) {
                    info.startTime = new Date(info.startTime);
                }
                if (isString(info.endTime)) {
                    info.endTime = new Date(info.endTime);
                }
                return info;
            });
    }
    /**
     * @returns {number} number of changes that are pending to push.
     */
    public getLogLength(): Promise<number> {
        return this.getStore().then( s => s.count([{
            attributeName: 'hasError',
            attributeValue: 0,
            attributeType: 'NUMBER',
            filterCondition: 'EQUALS'
        }]));
    }

    /*
    * Retrieves the entity store to use by ChangeLogService.
    */
    public getStore(): Promise<LocalDBStore> {
        return this.localDBManagementService.getStore('wavemaker', 'offlineChangeLog');
    }

    private createContext() {
        return this.localKeyValueService.get(CONTEXT_KEY)
            .then(context => {
                context = context || {};
                return {
                    'clear' : () => {
                        context = {};
                        return this.localKeyValueService.remove(CONTEXT_KEY);
                    },
                    'get' : key => {
                        let value = context[key];
                        if (!value) {
                            value = {};
                            context[key] = value;
                        }
                        return value;
                    },
                    'save' : () => this.localKeyValueService.put(CONTEXT_KEY, context)
                };
            });
    }

    // Flushes the complete log one after another.
    private _flush(progressObserver: Observer<PushInfo>, defer?: any) {
        defer = defer || getAbortableDefer();
        if (defer.isAborted) {
            return Promise.resolve();
        }
        this.getNextChange()
            .then(change => {
                if (change) {
                    change.params = JSON.parse(change.params);
                    return this.flushChange(change);
                }
            })
            .then(change => {
                progressObserver.next(this.currentPushInfo);
                if (change) {
                    this.getStore().then(s => s.delete(change.id));
                    this._flush(progressObserver, defer);
                } else {
                    defer.resolve();
                }
            }, change => {
                if (this.networkService.isConnected()) {
                    change.hasError = 1;
                    change.params = JSON.stringify(change.params);
                    this.getStore()
                        .then(s => s.save(change))
                        .then(() => this._flush(progressObserver, defer));
                } else {
                    let connectPromise = this.networkService.onConnect();
                    defer.promise.catch(function () {
                        if (connectPromise) {
                            connectPromise.abort();
                        }
                    });
                    connectPromise.then(() => {
                        this._flush(progressObserver, defer);
                        connectPromise = null;
                    });
                }
            });
        return defer.promise;
    }

    private flushChange(change: Change): Promise<Change> {
        const self = this;
        return executePromiseChain(_.map(this.workers, 'preCall'), [change])
            .then(() => this.pushService.push(change))
            .then(function() {
                return executePromiseChain(_.map(_.reverse(self.workers), 'postCallSuccess'), [change, arguments])
                    .then(() => change);
            }).catch(function() {
                if (self.networkService.isConnected()) {
                    return executePromiseChain(_.map(_.reverse(self.workers), 'postCallError'), [change, arguments])
                        .then(() => change);
                }
                return Promise.reject(change);
            });
    }



    // Flushes the first registered change.
    private getNextChange(): Promise<Change> {
        const filterCriteria = [{
            attributeName: 'hasError',
            attributeValue: 0,
            attributeType: 'NUMBER',
            filterCondition: 'EQUALS'
        }];
        return this.getStore().then(s => s.filter(filterCriteria, 'id', {
            offset: 0,
            limit: 1
        })).then(function (changes) {
            return changes && changes[0];
        });
    }
}

class FlushTracker {

    private flushContext: FlushContext;
    private logger: any;

    constructor(private changeLogService: ChangeLogService,
                private localKeyValueService: LocalKeyValueService,
                private pushInfo: PushInfo) {
        this.logger = console;
    }

    public onAddCall(change: Change) {
        this.logger.debug('Added the following call %o to log.', change);
    }

    public preFlush(flushContext: FlushContext) {
        this.pushInfo.totalTaskCount = 0;
        this.pushInfo.successfulTaskCount = 0;
        this.pushInfo.failedTaskCount = 0;
        this.pushInfo.completedTaskCount = 0;
        this.pushInfo.inProgress = true;
        this.pushInfo.startTime = new Date();
        this.flushContext = flushContext;
        this.logger.debug('Starting flush');
        return this.changeLogService.getStore().then(store => {
            return store.count([{
                attributeName: 'hasError',
                attributeValue: 0,
                attributeType: 'NUMBER',
                filterCondition: 'EQUALS'
            }]);
        }).then(count => this.pushInfo.totalTaskCount = count);
    }

    public postFlush(stats: PushInfo , flushContext: FlushContext) {
        this.logger.debug('flush completed. {Success : %i , Error : %i , completed : %i, total : %i }.',
            this.pushInfo.successfulTaskCount, this.pushInfo.failedTaskCount, this.pushInfo.completedTaskCount, this.pushInfo.totalTaskCount);
        this.pushInfo.inProgress = false;
        this.pushInfo.endTime = new Date();
        this.localKeyValueService.put(LAST_PUSH_INFO_KEY, this.pushInfo);
        this.flushContext = null;
    }

    public preCall(change: Change) {
        this.logger.debug('%i. Invoking call %o', (1 + this.pushInfo.completedTaskCount), change);
    }

    public postCallError(change: Change, response: any) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.failedTaskCount++;
        this.logger.error('call failed with the response %o.', response);
        return this.flushContext.save();
    }

    public postCallSuccess(change: Change, response: any) {
        this.pushInfo.completedTaskCount++;
        this.pushInfo.successfulTaskCount++;
        this.logger.debug('call returned the following response %o.', response);
        return this.flushContext.save();
    }
}