import { Injectable } from '@angular/core';

import { isDefined, noop } from '@wm/core';

import { Change, FlushContext, Worker } from './../change-log.service';
import { LocalDBManagementService } from './../local-db-management.service';
import { LocalDBStore } from './../../models/local-db-store';

const STORE_KEY  = 'idConflictResolution';

/**
 * In offline database, a insert could generate the Id of an entity. During flush, id of that entity might get changed.
 * Due to that, relationship inconsistency arises. To prevent that, wherever this entity is referred in the next flush
 * call, Id has to be replaced with that of new one.
 */
@Injectable()
export class IdResolver implements Worker {

    private idStore;
    private logger;
    private transactionLocalId;

    constructor(private localDBManagementService: LocalDBManagementService) {
        this.logger = window.console;
    }

    public preFlush(context: FlushContext) {
        this.idStore = context.get(STORE_KEY);
    }

    // Exchane Ids, Before any database operation.
    public preCall(change: Change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                    change.params.skipLocalDB = true ;
                    return this.localDBManagementService.getStore(dataModelName, entityName)
                        .then(store => {
                            const primaryKeyName = store.primaryKeyName;
                            if (primaryKeyName) {
                                this.transactionLocalId = change.params.data[primaryKeyName];
                                change['dataLocalId'] = this.transactionLocalId;
                            }
                            return this.exchangeIds(store, dataModelName, entityName, change.params.data)
                                .then(() => {
                                    if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                                        delete change.params.data[primaryKeyName];
                                    } else {
                                        const relationalPrimaryKeyValue = store.getValue(change.params.data, store.primaryKeyName);
                                        // for the data referring to the relational table based on primary key assign the primaryField values to the relationalPrimaryKeyValue
                                        if (isDefined(relationalPrimaryKeyValue)) {
                                            change.params.data[primaryKeyName] = relationalPrimaryKeyValue;
                                            if (this.transactionLocalId !== null) {
                                                this.pushIdToStore(dataModelName, entityName, this.transactionLocalId, relationalPrimaryKeyValue);
                                            }
                                        }
                                        this.transactionLocalId = null;
                                    }
                                });
                    });
                case 'updateTableData':
                case 'updateMultiPartTableData':
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        // on update call, passing id to exchangeId as change.params id(local value 10000000+) is not updated with the latest id from db
                        this.exchangeId(store, dataModelName, entityName, change.params, 'id');
                        if (change.params.data) {
                            return this.exchangeIds(store, dataModelName, entityName, change.params.data);
                        }
                    });
            }
        }
    }
    // After every database insert, track the Id change.
    public postCallSuccess(change: Change, response: any) {
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            const data = response[0].body;
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                this.pushIdToStore(dataModelName, entityName, this.transactionLocalId, data[store.primaryKeyName]);
                return store.delete(this.transactionLocalId).catch(noop).then(() => {
                    this.transactionLocalId = null;
                    return store.save(data);
                });
            });
        }
    }
    // store error entity id
    public postCallError(change: Change) {
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                change.params.data[store.primaryKeyName] = this.transactionLocalId;
            });
        }
    }

    private getEntityIdStore(dataModelName: string, entityName: string) {
        this.idStore[dataModelName] = this.idStore[dataModelName] || {};
        this.idStore[dataModelName][entityName] = this.idStore[dataModelName][entityName] || {};
        return this.idStore[dataModelName][entityName];
    }

    // if local id is different, then create a mapping for exchange.
    private pushIdToStore(dataModelName: string, entityName: string, transactionLocalId: any, remoteId: any) {
        if (transactionLocalId !== remoteId) {
            this.getEntityIdStore(dataModelName, entityName)[transactionLocalId] = remoteId;
            this.logger.debug('Conflict found for entity (%s) with local id (%i) and remote Id (%i)', entityName, transactionLocalId, remoteId);
        }
    }

    private logResolution(entityName: string, localId: any, remoteId: any) {
        this.logger.debug('Conflict resolved found for entity (%s) with local id (%i) and remote Id (%i)', entityName, localId, remoteId);
    }

    // Exchange primary key  of the given entity
    private exchangeId(store: LocalDBStore, dataModelName: string, entityName: string, data?: any, keyName?: string) {
        const primaryKeyName = keyName || store.primaryKeyName;
        const entityIdStore = this.getEntityIdStore(dataModelName, entityName);
        if (data && primaryKeyName) {
            const localId = data[primaryKeyName];
            let remoteId = localId;
            while (entityIdStore[remoteId]) {
                remoteId = entityIdStore[remoteId];
            }
            if (remoteId !== localId) {
                data[primaryKeyName] = remoteId;
                this.logResolution(entityName, localId, remoteId);
            }
        }
    }

    // Looks primary key changes in the given entity or in the relations
    private exchangeIds(store: LocalDBStore, dataModelName: string, entityName: string, data: any): Promise<any> {
        this.exchangeId(store, dataModelName, entityName, data);
        const exchangeIdPromises = [];
        store.entitySchema.columns.forEach(col => {
            if (col.foreignRelations) {
                col.foreignRelations.forEach( foreignRelation => {
                    if (data[col.fieldName]) {// if id value
                        this.exchangeId(store, dataModelName, foreignRelation.targetEntity, data, col.fieldName);
                    }
                    if (data[foreignRelation.sourceFieldName]) {// if object reference
                        exchangeIdPromises.push(this.localDBManagementService.getStore(dataModelName, foreignRelation.targetEntity)
                            .then(refStore => {
                                return this.exchangeIds(refStore, dataModelName, foreignRelation.targetEntity, data[foreignRelation.sourceFieldName]);
                            }));
                    }
                });
            }
        });
        return Promise.all(exchangeIdPromises);
    }
}
