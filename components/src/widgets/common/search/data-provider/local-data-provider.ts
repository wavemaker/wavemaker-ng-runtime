import { IDataProvider, IDataProviderConfig } from './data-provider';

declare const _;

export class LocalDataProvider implements IDataProvider {
    // LocalData filtering is done based on the searchkey.
    public filter(config: IDataProviderConfig): Promise<any> {
        const entries = config.dataset;
        const casesensitive = config.casesensitive;
        let queryText = config.query,
        filteredData;

        return new Promise((resolve, reject) => {
            /**
             * If searchKey is defined, then check for match string against each item in the dataset with item's field name as the searchKey
             * return the filtered data containing the matching string.
             */
            if (config.searchKey) {
                const keys = _.split(config.searchKey, ',');

                filteredData = _.filter(config.dataset, (item: any) => {
                    return keys.some(key => {
                        let a = _.get(item, key),
                            b = queryText;
                        if (!casesensitive) {
                            a = _.toLower(_.toString(a));
                            b = _.toLower(_.toString(b));
                        }
                        return _.includes(a, b);
                    });
                });
            } else {
                // local search on data with array of objects.
                // Iterate over each item and return the filtered data containing the matching string.
                if (_.isArray(entries) && _.isObject(entries[0])) {
                    filteredData = _.filter(entries, entry => {
                        return (_.includes(_.toLower(_.values(entry).join(' ')), _.toLower(queryText)));
                    });
                } else {
                    filteredData = _.filter(entries, entry => {
                        if (!casesensitive) {
                            entry = _.toLower(entry);
                            queryText = _.toLower(queryText);
                        }
                        return _.includes(entry, queryText);
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