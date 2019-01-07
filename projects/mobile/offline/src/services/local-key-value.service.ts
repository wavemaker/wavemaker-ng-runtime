import { Injectable } from '@angular/core';

import { LocalDBStore } from '../models/local-db-store';

@Injectable()
export class LocalKeyValueService {

    private store: LocalDBStore;

    /**
     * retrieves the value mapped to the key.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when value is retrieved from store.
     */
    public get(key: string): any {
        return this.fetchEntry(key)
            .then(result => {
                let value;
                if (result && result.length > 0) {
                    value = result[0].value;
                    if (value) {
                        value = JSON.parse(value);
                    }
                }
                return value;
            });
    }

    /**
     * Initializes the service with the given store.
     *
     * @param {object} storeToUse a store with id, key, value with fields.
     * @returns {object} a promise that is resolved when data is persisted.
     */
    public init(storeToUse: LocalDBStore) {
        this.store = storeToUse;
    }

    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @param {string} value value
     * @returns {object} a promise that is resolved when data is persisted.
     */
    public put(key, value) {
        if (value) {
            value = JSON.stringify(value);
        }
        return this.fetchEntry(key).then(result => {
            if (result && result.length > 0) {
                return this.store.save({
                    'id' : result[0].id,
                    'key' : key,
                    'value' : value
                });
            }
            return this.store.add({
                'key' : key,
                'value' : value
            });
        });
    }

    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when respective value is removed from store.
     */
    public remove(key) {
        return this.fetchEntry(key).then(result => {
            if (result && result.length > 0) {
                return this.store.delete(result[0].id);
            }
        });
    }

    private fetchEntry(key) {
        const filterCriteria = [{
            'attributeName' : 'key',
            'attributeValue' : key,
            'attributeType' : 'STRING',
            'filterCondition' : 'EQUALS'
        }];
        return this.store.filter(filterCriteria);
    }
}