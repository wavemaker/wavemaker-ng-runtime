import { IDataProvider, IDataProviderConfig } from './data-provider';
import {
    endsWith,
    filter,
    get,
    includes,
    isArray,
    isEqual,
    isNumber,
    isObject,
    split,
    startsWith,
    toLower,
    toString,
    values
} from "lodash-es";

export class LocalDataProvider implements IDataProvider {
    private applyFilter(entry, queryText, filtername?) {
        entry = isNumber(entry) ? entry.toString() : entry;
        if (includes(filtername, 'start')) {
            return startsWith(entry, queryText);
        } else if (includes(filtername, 'end')) {
            return endsWith(entry, queryText);
        } else if (includes(filtername, 'exact')) {
            return isEqual(entry, queryText);
        }
        return includes(entry, queryText);
    }

    // LocalData filtering is done based on the searchkey.
    public filter(config: IDataProviderConfig): Promise<any> {
        const entries = config.dataset;
        let casesensitive = config.casesensitive;
        const matchMode = config.matchMode;
        // for supporting existing projects
        if (matchMode && !includes(matchMode, 'ignorecase')) {
            casesensitive = true;
        }
        let queryText = config.query,
        filteredData;

        return new Promise((resolve, reject) => {
            /**
             * If searchKey is defined, then check for match string against each item in the dataset with item's field name as the searchKey
             * return the filtered data containing the matching string.
             */
            if (config.searchKey) {
                const keys = split(config.searchKey, ',');

                filteredData = filter(config.dataset, (item: any) => {
                    return keys.some(key => {
                        let a = get(item, key),
                            b = queryText;
                        if (!casesensitive) {
                            a = toLower(toString(a));
                            b = toLower(toString(b));
                        }
                        return this.applyFilter(a, b, matchMode);
                    });
                });
            } else {
                // local search on data with array of objects.
                // Iterate over each item and return the filtered data containing the matching string.
                if (isArray(entries) && isObject(entries[0])) {
                    filteredData = filter(entries, entry => {
                        let a = values(entry).join(' ');
                        if (!casesensitive) {
                            a = toLower(a);
                            // @ts-ignore
                            queryText = toLower(queryText);
                        }
                        return this.applyFilter(a, queryText);
                    });
                } else {
                    filteredData = filter(entries, entry => {
                        if (!casesensitive) {
                            entry = toLower(entry);
                            // @ts-ignore
                            queryText = toLower(queryText);
                        }
                        return this.applyFilter(entry, queryText, matchMode);
                    });
                }
            }
            resolve({
                data: filteredData,
                hasMoreData: false,
                isLastPage: true
            });
        });
    }
}
