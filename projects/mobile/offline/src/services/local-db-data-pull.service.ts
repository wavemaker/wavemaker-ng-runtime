import { Injectable } from '@angular/core';

import { Observer } from 'rxjs/Observer';

import { $parseExpr, defer, getAbortableDefer, noop } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';

import { LiveVariableUtils, LVService } from '@wm/variables';

import { LocalDBManagementService } from './local-db-management.service';
import { PullInfo } from './change-log.service';
import { LocalKeyValueService } from './local-key-value.service';
import { DBInfo, EntityInfo, PullType } from '../models/config';

declare const _, moment;
const  LAST_PULL_INFO_KEY = 'localDBManager.lastPullInfo';

/**
 * a utility api to abort pull process.
 *
 * @type {{start, add, remove, abort}}
 */
const pullProcessManager = (() => {
    const promises = {};
    return {
        start: promise => {
            promise.$$pullProcessId = 'PULL_' + _.now();
        },
        add: (pullPromise: Promise<PullInfo>, promise: Promise<any>) => {
            const pullProcessId = (pullPromise as any).$$pullProcessId;
            if (!promises[pullProcessId]) {
                promises[pullProcessId] = [];
            }
            promises[pullProcessId].push(promise);
        },
        remove: (pullPromise: Promise<PullInfo>, promise: Promise<any>) => {
            const pullProcessId = (pullPromise as any).$$pullProcessId;
            _.remove(promises[pullProcessId], promise);
            if (_.isEmpty(promises[pullProcessId])) {
                delete promises[pullProcessId];
            }
        },
        abort: (pullPromise: Promise<PullInfo>) => {
            const pullProcessId = (pullPromise as any).$$pullProcessId;
            if (promises[pullProcessId]) {
                _.forEach(promises[pullProcessId], function (p) {
                    if (p && p.abort) {
                        p.abort();
                    }
                });
                delete promises[pullProcessId];
            }
            (pullPromise as any).$$isMarkedToAbort = true;
            return pullPromise.catch(function () {
                return 'cancelled';
            });
        }
    };
})();

/**
 * LocalDBDataPullService has API to pull data from remote Server to local Database.
 */
@Injectable({providedIn: 'root'})
export class LocalDBDataPullService {

    constructor(
        private localDBManagementService: LocalDBManagementService,
        private localKeyValueService: LocalKeyValueService,
        private networkService: NetworkService
    ) {
        // Listen for db creation. When db is created, then initialize last pull info.
        this.localDBManagementService.registerCallback({
            onDbCreate: (info) => {
                this.localKeyValueService.put(LAST_PULL_INFO_KEY, {
                    databases: [],
                    totalRecordsToPull: 0,
                    totalPulledRecordCount: 0,
                    startTime: new Date(0),
                    endTime: new Date(info.dbSeedCreatedOn)
                });
            }
        });
    }

    /**
     * If deltaFieldName is set,last pull time is greater than zero and query used in last pull is same as the
     * query for the current pull, then delta criteria is attached to the query.
     *
     * @param db
     * @param entityName
     * @param query
     * @returns {any}
     */
    private addDeltaCriteria(db: DBInfo, entityName: string, query: string): Promise<string> {
        const entitySchema = db.schema.entities[entityName],
            deltaFieldName = entitySchema.pullConfig.deltaFieldName,
            deltaField = _.find(entitySchema.columns, {'fieldName' : deltaFieldName}) || {};

        let isBundledEntity;

        if (!_.isEmpty(deltaFieldName)) {
            return this.localDBManagementService.isBundled(db.schema.name, entityName)
                .then(flag => isBundledEntity = flag)
                .then(() => this.getLastPullInfo())
                .then(lastPullInfo => {
                    let lastPullTime = (lastPullInfo && lastPullInfo.startTime && lastPullInfo.startTime.getTime());
                    const lastPullDBInfo = _.find(lastPullInfo && lastPullInfo.databases, {'name' : db.schema.name}),
                        lastPullEntityInfo = _.find(lastPullDBInfo && lastPullDBInfo.entities, {'entityName' : entityName}) || {};

                    if (!lastPullTime && isBundledEntity) {
                        // For bundled entity when there is no last pull, fetch records that got modified after db creation.
                        lastPullTime = (lastPullInfo && lastPullInfo.endTime && lastPullInfo.endTime.getTime());
                        lastPullEntityInfo.query = query;
                    }
                    if (lastPullEntityInfo.query === query && lastPullTime > 0) {
                        if (_.isEmpty(query)) {
                            query = '';
                        } else {
                            query += ' AND ';
                        }
                        if (deltaField.sqlType === 'datetime') {
                            query += deltaFieldName + ' > wm_dt(\'' + moment(lastPullTime).utc().format('YYYY-MM-DDTHH:mm:ss') + '\')';
                        } else {
                            query += deltaFieldName + ' > wm_ts(\'' + lastPullTime + '\')';
                        }
                    }
                    return query;
                }, () => Promise.resolve(query));
        }
        return Promise.resolve(query);
    }

    /**
     * copies the data from remote db to local db
     * @param {DBInfo} db
     * @param {string} entityName
     * @param {boolean} clearDataBeforePull
     * @param pullPromise
     * @param {Observer<any>} progressObserver
     * @returns {Promise<any>}
     */
    private copyDataFromRemoteDBToLocalDB(db: DBInfo, entityName: string, clearDataBeforePull: boolean, pullPromise: Promise<PullInfo>, progressObserver: Observer<any>) {
        const store = (db as any).stores[entityName],
            entitySchema = db.schema.entities[entityName],
            result = {
                entityName: entityName,
                totalRecordsToPull: 0,
                pulledRecordCount: 0
            };

        let inProgress = 0,
            pullComplete = false,
            filter;

        return new Promise((resolve, reject) => {
            this.prepareQuery(db, entityName)
                .then(query => {
                    (result as any).query = query;
                    return this.addDeltaCriteria(db, entityName, query);
                }).then(query => {
                    // Clear if clearDataBeforePull is true and delta query is not used
                    if (clearDataBeforePull && (result as any).query === query) {
                        return store.clear()
                            .then(() => {
                                return query;
                            });
                    }
                    return query;
                }).then(query => {
                    filter = _.isEmpty(query) ? '' : 'q=' + query;
                    return this.getTotalRecordsToPull(db, entitySchema, filter, pullPromise);
                }).then(maxNoOfRecords => {
                    const pageSize = entitySchema.pullConfig.size || 100,
                        maxNoOfPages = Math.ceil(maxNoOfRecords / pageSize);

                    result.totalRecordsToPull = maxNoOfRecords;

                    let sort = entitySchema.pullConfig.orderBy;
                    sort = (_.isEmpty(sort) ? '' : sort + ',') + store.primaryKeyName;

                    progressObserver.next(result);

                    const _progressObserver = { next: data => {
                            inProgress++;
                            data = _.slice(data, 0, result.totalRecordsToPull - result.pulledRecordCount);
                            store.saveAll(data).then(() => {
                                result.pulledRecordCount += data ? data.length : 0;
                                progressObserver.next(result);
                            }).catch(noop)
                                .then(() => {
                                    inProgress--;
                                    if (inProgress === 0 && pullComplete) {
                                        resolve(result);
                                    }
                                });
                        }, error: null, complete: null
                    };

                return this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, 1, pullPromise, undefined, _progressObserver);
                }).then(null, reject)
                    .catch(noop)
                    .then(() => {
                        pullComplete = true;
                        if (inProgress === 0) {
                            resolve(result);
                        }
                    });
            });
    }

    // If expression starts with 'bind:', then expression is evaluated and result is returned.
    private evalIfBind(expression: string) {
        if (_.startsWith(expression, 'bind:')) {
            expression = expression.replace(/\[\$\i\]/g, '[0]');
            return $parseExpr(expression.replace('bind:', ''))({});
        }
        return expression;
    }

    /**
     * Executes DatabaseService.countTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    private executeDatabaseCountQuery(params: Object): Promise<any> {
        return new Promise((resolve, reject) => {
            LVService.countTableDataWithQuery(params, null, null).subscribe(response => resolve(response.body), reject);
        });
    }

    /**
     * Executes DatabaseService.searchTableDataWithQuery as a promise API.
     * @param params
     * @returns Promise
     */
    private executeDatabaseSearchQuery(params: Object): Promise<any> {
        return new Promise((resolve, reject) => {
            return LVService.searchTableDataWithQuery(params, null, null).subscribe(response => resolve(response && response.body && response.body.content), reject);
        });
    }

    /**
     * Computes the maximum number of records to pull.
     *
     * @param db
     * @param entitySchema
     * @param filter
     * @param pullPromise
     * @returns {*}
     */
    private getTotalRecordsToPull(db: DBInfo, entitySchema: EntityInfo, filter: string, pullPromise: Promise<PullInfo>): Promise<number> {
        const params = {
            dataModelName: db.schema.name,
            entityName: entitySchema.entityName,
            data: filter
        };
        return this.retryIfNetworkFails(() => {
            return this.executeDatabaseCountQuery(params).then(function (response) {
                const totalRecordCount = response,
                    maxRecordsToPull = _.parseInt((entitySchema.pullConfig as any).maxNumberOfRecords);
                if (_.isNaN(maxRecordsToPull) || maxRecordsToPull <= 0 || totalRecordCount < maxRecordsToPull) {
                    return totalRecordCount;
                }
                return maxRecordsToPull;
            });
        }, pullPromise);
    }

    private prepareQuery(db: DBInfo, entityName: string): Promise<string> {
        let query;
        const entitySchema = db.schema.entities[entityName];

        return this.localDBManagementService.isBundled(db.schema.name, entityName)
            .then(isBundledEntity => {
                let hasNullAttributeValue = false;
                if (isBundledEntity || _.isEmpty(entitySchema.pullConfig.query)) {
                    query = _.cloneDeep(entitySchema.pullConfig.filter);
                    query = _.map(query, v => {
                        v.attributeValue = this.evalIfBind(v.attributeValue);
                        hasNullAttributeValue = hasNullAttributeValue || _.isNil(v.attributeValue);
                        return v;
                    });
                    if (hasNullAttributeValue) {
                        return Promise.reject('Null criteria values are present');
                    }
                    query = _.sortBy(query, 'attributeName');
                    query = LiveVariableUtils.getSearchQuery(query, ' AND ', true);
                } else {
                    query = this.evalIfBind(entitySchema.pullConfig.query);
                }
                if (_.isNil(query)) {
                    return Promise.resolve(null);
                }

                return Promise.resolve(encodeURIComponent(query));
        });
    }

    /**
     *
     * @param db
     * @param clearDataBeforePull
     * @param pullPromise
     * @param progressObserver
     * @returns {*}
     */
    private _pullDbData(db: DBInfo, clearDataBeforePull: boolean, pullPromise: Promise<PullInfo>, progressObserver: Observer<any>): Promise<any> {
        const datamodelName = db.schema.name,
            result = {
                name: db.schema.name,
                entities: [],
                totalRecordsToPull: 0,
                pulledRecordCount: 0,
                completedTaskCount: 0,
                totalTaskCount: 0
            };

        const storePromises = [];

        _.forEach(db.schema.entities, entity => {
            storePromises.push(this.localDBManagementService.getStore(datamodelName, entity.entityName));
        });

        return new Promise((resolve, reject) => {
            Promise.all(storePromises)
                .then((stores) => {
                    const entities = [];
                    stores.forEach(store => {
                        const pullConfig = store.entitySchema.pullConfig;
                        const pullType = pullConfig.pullType;
                        if (pullType === PullType.APP_START || (pullType === PullType.BUNDLED && (pullConfig as any).deltaFieldName)) {
                            entities.push(store.entitySchema);
                        }
                    });
                    const pullPromises = _.chain(entities)
                        .map(entity => {
                        const _progressObserver = {
                            next: info => {
                                const i = _.findIndex(result.entities, {'entityName': info.entityName});
                                if (i >= 0) {
                                    result.entities[i] = info;
                                } else {
                                    result.entities.push(info);
                                }
                                result.pulledRecordCount = _.reduce(result.entities, function (sum, entityPullInfo) {
                                    return sum + entityPullInfo.pulledRecordCount;
                                }, 0);
                                result.totalRecordsToPull = _.reduce(result.entities, function (sum, entityPullInfo) {
                                    return sum + entityPullInfo.totalRecordsToPull;
                                }, 0);
                                progressObserver.next(result);
                            }, error: null, complete: null
                        };
                        return this.copyDataFromRemoteDBToLocalDB(db, entity.entityName, clearDataBeforePull, pullPromise, _progressObserver)
                            .then(function (info) {
                                result.completedTaskCount++;
                                progressObserver.next(result);
                                return info;
                            }, null);
                    }).value();

                result.totalTaskCount = pullPromises.length;
                progressObserver.next(result);

                Promise.all(pullPromises).then(resolve, reject);
            });
        });
    }

    /**
     * Pulls data of the given entity from remote server.
     * @param db
     * @param entityName
     * @param sort
     * @param maxNoOfPages
     * @param pageSize
     * @param currentPage
     * @param filter
     * @param pullPromise
     * @param promise
     * @returns {*}
     */
    private _pullEntityData(db: DBInfo, entityName: string, filter: string, sort, maxNoOfPages: number, pageSize: number, currentPage: number, pullPromise: Promise<PullInfo>, deferred: any, progressObserver?: Observer<any>) {
        const dataModelName = db.schema.name;

        if (!deferred) {
            deferred = defer();
        }

        if (currentPage > maxNoOfPages) {
            return deferred.resolve();
        }
        const params = {
            dataModelName: dataModelName,
            entityName: entityName,
            page: currentPage,
            size: pageSize,
            data: filter,
            sort: sort,
            onlyOnline: true,
            skipLocalDB: true
        };
        this.retryIfNetworkFails(() => {
            return this.executeDatabaseSearchQuery(params);
        }, pullPromise).then(response => {
            progressObserver.next(response);
            this._pullEntityData(db, entityName, filter, sort, maxNoOfPages, pageSize, currentPage + 1, pullPromise, deferred, progressObserver);
        }, deferred.reject);

        return deferred.promise;
    }


    /**
     * If fn fails and network is not there
     * @param fn
     * @param pullPromise
     * @returns {*}
     */
    private retryIfNetworkFails(fn: Function, pullPromise: Promise<PullInfo>) {
        if ((pullPromise as any).$$isMarkedToAbort) {
            return Promise.reject('aborted');
        }
        const promise = this.networkService.retryIfNetworkFails(fn);
        pullProcessManager.add(pullPromise, promise);
        promise.catch(noop)
            .then(() => {
            pullProcessManager.remove(pullPromise, promise);
        });
        return promise;
    }

    /**
     * Tries to cancel the corresponding pull process that gave the given promise.
     * @param promise
     * @returns {any}
     */
    public cancel(promise: Promise<any>) {
        return pullProcessManager.abort(promise);
    }

    /**
     * fetches the database from the dbName.
     * @param dbName
     * @returns {Promise<any>}
     */
    public getDb(dbName: string) {
        return this.localDBManagementService.loadDatabases()
            .then(databases => {
                const db = _.find(databases, {'name' : dbName});
                return db || Promise.reject('Local database (' + dbName + ') not found');
            });
    }

    /**
     * @returns {any} that has total no of records fetched, start and end timestamps of last successful pull
     * of data from remote server.
     */
    public getLastPullInfo(): Promise<PullInfo> {
        return this.localKeyValueService.get(LAST_PULL_INFO_KEY).then(info => {
            if (_.isString(info.startTime)) {
                info.startTime = new Date(info.startTime);
            }
            if (_.isString(info.endTime)) {
                info.endTime = new Date(info.endTime);
            }
            return info;
        });
    }

    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) from server using the
     * configured rules in offline configuration.
     *
     * @param clearDataBeforePull boolean
     * @param {Observer<any>} progressObserver
     * @returns {any}
     */
    public pullAllDbData(clearDataBeforePull: boolean, progressObserver: Observer<any>): Promise<PullInfo> {
        const deferred = getAbortableDefer(),
            pullInfo = {
            completedTaskCount: 0,
            totalTaskCount: 0,
            inProgress: true,
            databases: [],
            totalRecordsToPull: 0,
            totalPulledRecordCount: 0,
            startTime: new Date(),
            endTime: new Date()
        };

        this.localDBManagementService.loadDatabases()
            .then(databases => {
                const dataPullPromises = _.chain(databases).filter(function (db) {
                    return !db.schema.isInternal;
                }).map(db => {
                    pullProcessManager.start(deferred.promise);

                    const _progressObserver: Observer<any> = {next: data => {
                                const i = _.findIndex(pullInfo.databases, {'name' : data.name});
                                if (i >= 0) {
                                    pullInfo.databases[i] = data;
                                } else {
                                    pullInfo.databases.push(data);
                                }
                                pullInfo.totalTaskCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                                    return sum + dbPullInfo.totalTaskCount;
                                }, 0);
                                pullInfo.completedTaskCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                                    return sum + dbPullInfo.completedTaskCount;
                                }, 0);
                                pullInfo.totalPulledRecordCount = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                                    return sum + dbPullInfo.pulledRecordCount;
                                }, 0);
                                pullInfo.totalRecordsToPull = _.reduce(pullInfo.databases, function (sum, dbPullInfo) {
                                    return sum + dbPullInfo.totalRecordsToPull;
                                }, 0);
                                progressObserver.next(pullInfo);
                            }, error: null, complete: null
                        };

                    return this._pullDbData(db, clearDataBeforePull, deferred.promise, _progressObserver);
                }).value();
                return Promise.all(dataPullPromises);
            }).then(() => {
                pullInfo.endTime = new Date();
                pullInfo.inProgress = false;
                this.localKeyValueService.put(LAST_PULL_INFO_KEY, pullInfo);
                deferred.resolve(pullInfo);
        }, deferred.reject);

        return deferred.promise;
    }

    /**
     * Clears (based on parameter) and pulls data ('BUNDLED' data based on parameter) of the given database from server using
     * the configured rules in offline configuration.
     *
     * @param {string} databaseName
     * @param {boolean} clearDataBeforePull
     * @param {Observer<any>} progressObserver
     * @returns {Promise}
     */
    public pullDbData(databaseName: string, clearDataBeforePull: boolean, progressObserver: Observer<any>): Promise<any> {
        const deferred = getAbortableDefer();

        this.getDb(databaseName).then(db => {
            return this._pullDbData(db, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);

        return deferred.promise;
    }

    /**
     * Clears (based on parameter) and pulls data of the given entity and database from
     * server using the configured rules in offline configuration.
     * @param databaseName, name of the database from which data has to be pulled.
     * @param entityName, name of the entity from which data has to be pulled
     * @param clearDataBeforePull, if set to true, then data of the entity will be deleted.
     * @param progressObserver, observer the progress values
     */
    public pullEntityData(databaseName: string, entityName: string, clearDataBeforePull: boolean, progressObserver: Observer<any>): Promise<any> {
        const deferred = getAbortableDefer();

        this.getDb(databaseName)
            .then((db) => {
                return this.copyDataFromRemoteDBToLocalDB(db, entityName, clearDataBeforePull, deferred.promise, progressObserver);
        }).then(deferred.resolve, deferred.reject);

        return deferred.promise;
    }
}
