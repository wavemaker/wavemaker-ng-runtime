import { Change, FlushContext, Worker } from './../change-log.service';
import { LocalDBStore } from './../../models/local-db-store';
import { LocalDBManagementService } from './../local-db-management.service';

declare const _;

const STORE_KEY = 'errorBlockerStore';

export class ErrorBlocker implements Worker {

    private errorStore;

    constructor(private localDBManagementService: LocalDBManagementService) {
    }

    public preFlush(context: FlushContext) {
        this.errorStore = context.get(STORE_KEY);
    }

    // block all calls related to the error entities
    public preCall(change: Change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                case 'updateTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then( store => {
                        this.blockCall(store, change, dataModelName, entityName, change.params.data);
                    });
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then( store => {
                        this.blockCall(store, change, dataModelName, entityName, change.params);
                    });
            }
        }
    }

    // store error entity id
    public postCallSuccess(change: Change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then( store => {
                const id = change['dataLocalId'] || change.params.data[store.primaryKeyName];
                if (!(_.isUndefined(id) || _.isNull(id))) {
                    this.removeError(dataModelName, entityName, id);
                }
            });
        }
    }

    // store error entity id
    public postCallError(change: Change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then( store => {
                const id = change['dataLocalId'] || (change.params.data && change.params.data[store.primaryKeyName]) || change.params[store.primaryKeyName] || change.params.id;
                if (!(_.isUndefined(id) || _.isNull(id))) {
                    this.recordError(dataModelName, entityName, id);
                }
            });
        }
    }

    /**
     * If there is an earlier call of the object or its relations that got failed, then this call will be
     * marked for discard.
     *
     * @param store LocalDBStore
     * @param change change to block
     * @param dataModelName
     * @param entityName
     * @param data
     */
    private blockCall(store: LocalDBStore, change: Change, dataModelName: string, entityName: string, data: any) {
        if (change.hasError === 0) {
            this.checkForPreviousError(store, change, dataModelName, entityName, data);
            store.entitySchema.columns.forEach(col => {
                const foreignRelaton = col.foreignRelaton;
                if (foreignRelaton) {
                    if (data[foreignRelaton.sourceFieldName]) {
                        this.blockCall(store, change, dataModelName, foreignRelaton.targetEntity, data[foreignRelaton.sourceFieldName]);
                    } else if (data[col.fieldName]) {
                        this.checkForPreviousError(store, change, dataModelName, foreignRelaton.targetEntity, data, col.fieldName);
                    }
                }
            });
        }
    }

    // A helper function to check for earlier failures.
    private checkForPreviousError(store: LocalDBStore, change: Change, dataModelName: string, entityName: string, data: any, key?: any) {
        const primaryKey = key || store.primaryKeyName;
        if (this.hasError(dataModelName, entityName, data[primaryKey])) {
            change.hasError = 1;
            change.errorMessage = `Blocked call due to error in previous call of entity [ ${entityName} ] with id [ ${data[primaryKey]} ]`;
        }
    }

    private hasError(dataModelName: string, entityName: string, id: any) {
        if (this.errorStore[dataModelName]
            && this.errorStore[dataModelName][entityName]
            && this.errorStore[dataModelName][entityName][id]) {
            return true;
        }
        return false;
    }

    // Removes entity identifier from error list.
    private removeError(dataModelName: string, entityName: string, id: any) {
        if (this.errorStore[dataModelName]
            && this.errorStore[dataModelName][entityName]
            && this.errorStore[dataModelName][entityName][id]) {
            delete this.errorStore[dataModelName][entityName][id];
        }
    }

    // Save error entity identifier.
    private recordError(dataModelName: string, entityName: string, id: any) {
        this.errorStore[dataModelName] = this.errorStore[dataModelName] || {};
        this.errorStore[dataModelName][entityName] = this.errorStore[dataModelName][entityName] || {};
        this.errorStore[dataModelName][entityName][id] = true;
    }
}