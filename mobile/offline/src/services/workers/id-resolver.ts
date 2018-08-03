import { Injectable } from '@angular/core';

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
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        this.exchangeIds(store, dataModelName, entityName, change.params.data);
                        if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                            const primaryKeyName = store.primaryKeyName;
                            this.transactionLocalId = change['localId'] || change.params.data[primaryKeyName];
                            change['dataLocalId'] = this.transactionLocalId;
                            delete change.params.data[primaryKeyName];
                        } else {
                            this.transactionLocalId = null;
                        }
                    });
                case 'updateTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        this.exchangeId(store, dataModelName, entityName, change.params);
                        this.exchangeIds(store, dataModelName, entityName, change.params.data);
                    });
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        this.exchangeIds(store, dataModelName, entityName, change.params.data);
                    });
            }
        }
    }
    // After every database insert, track the Id change.
    public postCallSuccess(change: Change, response: any) {
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                this.pushIdToStore(dataModelName, entityName, this.transactionLocalId, response[0][store.primaryKeyName]);
                store.delete(this.transactionLocalId);
                store.save(response[0]);
                this.transactionLocalId = null;
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
    private exchangeIds(store: LocalDBStore, dataModelName: string, entityName: string, data: any) {
        this.exchangeId(store, dataModelName, entityName, data);
        store.entitySchema.columns.forEach(col => {
            if (col.foreignRelaton) {
                if (data[col.foreignRelaton.sourceFieldName]) {// if object reference
                    this.exchangeIds(store, dataModelName, col.foreignRelaton.targetEntity, data[col.foreignRelaton.sourceFieldName]);
                } else if (data[col.fieldName]) {// if id value
                    this.exchangeId(store, dataModelName, col.foreignRelaton.targetEntity, data, col.fieldName);
                }
            }
        });
    }
}