import { IDataProvider, IDataProviderConfig } from './data-provider';

declare const _;

export class LocalDataProvider implements IDataProvider {
    private applyFilter(entry, queryText, filtername?) {
        entry = _.isNumber(entry) ? entry.toString() : entry;
        if (_.includes(filtername, 'start') ) {
            return _.startsWith(entry, queryText);
        } else if (_.includes(filtername, 'end')) {
            return _.endsWith(entry, queryText);
        } else if (_.includes(filtername, 'exact')) {
            return _.isEqual(entry, queryText);
        }
        return _.includes(entry, queryText);
    }

    // LocalData filtering is done based on the searchkey.
    public filter(config: IDataProviderConfig): Promise<any> {
        const entries = config.dataset;
        let casesensitive = config.casesensitive;
        const matchMode = config.matchMode;
        // for supporting existing projects
        if (matchMode && !_.includes(matchMode, 'ignorecase')) {
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
                const keys = _.split(config.searchKey, ',');

                filteredData = _.filter(config.dataset, (item: any) => {
                    return keys.some(key => {
                        let a = _.get(item, key),
                            b = queryText;
                        if (!casesensitive) {
                            a = _.toLower(_.toString(a));
                            b = _.toLower(_.toString(b));
                        }
                        return this.applyFilter(a, b, matchMode);
                    });
                });
            } else {
                // local search on data with array of objects.
                // Iterate over each item and return the filtered data containing the matching string.
                if (_.isArray(entries) && _.isObject(entries[0])) {
                    filteredData = _.filter(entries, entry => {
                        // WMS-22792: If the labelvalue is configured, search the query against the configured key value in entry.
                        // Else join all the entries and search the query existence.
                        let a = config.labelValue ? entry[config.labelValue] : _.values(entry).join(' ');
                        if (!casesensitive) {
                            a = _.toLower(a);
                            queryText = _.toLower(queryText);
                        }
                        return this.applyFilter(a, queryText, matchMode);
                    });
                } else {
                    filteredData = _.filter(entries, entry => {
                        if (!casesensitive) {
                            entry = _.toLower(entry);
                            queryText = _.toLower(queryText);
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
