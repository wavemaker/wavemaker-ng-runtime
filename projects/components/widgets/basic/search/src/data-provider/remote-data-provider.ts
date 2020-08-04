import { AppConstants, DataSource, findValueOf, getClonedObject } from '@wm/core';

import { convertDataToObject, interpolateBindExpressions } from '@wm/components/base';
import { IDataProvider, IDataProviderConfig } from './data-provider';

declare const _;

export class RemoteDataProvider implements IDataProvider {
    public filter(config: IDataProviderConfig): Promise<any> {
        return this.filterData(config).then(response => this.onFilterSuccess(config, response), () => this.onFilterFailure());
    }

    private filterData(config) {
        if (config.dataoptions) {
            const dataoptions = config.dataoptions;

            const requestParams = config.datasource.execute(DataSource.Operation.GET_REQUEST_PARAMS, config);

            // If options are specified, make specifics calls to fetch the results
            // Fetch the related field data
            if (dataoptions.relatedField) {
                return new Promise((resolve, reject) => {
                    interpolateBindExpressions(config.viewParent, dataoptions.filterExpr, (filterexpressions) => {
                        requestParams.filterExpr = dataoptions.filterExpr = filterexpressions;
                        dataoptions.filterExpr = filterexpressions;

                        config.datasource.execute(
                            DataSource.Operation.GET_RELATED_TABLE_DATA, _.assign({relatedField: dataoptions.relatedField}, requestParams)
                        ).then(resolve, reject);
                    });
                });
            }
            // Fetch the distinct data
            if (dataoptions.distinctField) {
                return config.datasource.execute(
                    DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
                    {
                        pagesize: config.limit || config.pagesize,
                        page: config.page,
                        fields: dataoptions.distinctField,
                        entityName: dataoptions.tableName,
                        filterFields: _.assign(dataoptions.filterFields, requestParams.filterFields),
                        filterExpr: getClonedObject(dataoptions.filterExpr || {})

                    }
                );
            }
        }

        // search records using the searchkey
        return config.datasource.execute(
            DataSource.Operation.SEARCH_RECORDS, config
        );
    }


    // Check if the page retrieved currently is the last page. If last page, don't send any more request
    protected isLast(page: number, dataSize: number, maxResults: number, currentResults?: number): boolean {
        // if last page info is not returned by backend and current results is less than max results, this is the last page
        if (dataSize === AppConstants.INT_MAX_VALUE) {
            return currentResults !== 0 && currentResults < maxResults;
        }
        const pageCount = ((dataSize > maxResults) ? (Math.ceil(dataSize / maxResults)) : (dataSize < 0 ? 0 : 1));
        return page === pageCount;
    }

    // this function transform the response data in case it is not an array
    protected getTransformedData(variable: any, data: any): any {
        const operationResult = variable.operation + 'Result'; // when output is only string it is available as oprationNameResult
        const tempResponse = data[operationResult];

        // in case data received is value as string then add that string value to object and convert object into array
        if (tempResponse) {
            const tempObj = {};
            _.set(tempObj, operationResult, tempResponse);
            data = [tempObj]; // convert data into an array having tempObj
        } else {
            // in case data received is already an object then convert it into an array
            data = [data];
        }

        return data;
    }

    protected onFilterFailure() {
        return [];
    }

    private isLastPageForDistinctApi(data, page, totalElements, _isLastPage) {
        return page > 1 && !_isLastPage && _.isEmpty(data) && totalElements === AppConstants.INT_MAX_VALUE;
    }


    // this function processes the response depending on pageOptions, isPageable and prepares the formattedDataset.
    protected onFilterSuccess(config: IDataProviderConfig, response): Promise<any> {
        let data: any = response.data;
        let formattedData: any;
        let _isLastPage: boolean;
        let page: number;
        let isPaginatedData: boolean;

        const expressionArray = _.split(config.binddataset, '.');
        const dataExpression = _.slice(expressionArray, _.indexOf(expressionArray, 'dataSet') + 1).join('.');
        const $I = '[$i]';

        return new Promise((resolve, reject) => {
            const pageOptions = response.pagination;

            if (config.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
                page = pageOptions.number + 1;
                _isLastPage = this.isLast(page, (config.limit > 0 && config.limit) || pageOptions.totalElements, pageOptions.size, pageOptions.numberOfElements);
                isPaginatedData = true;

                if (this.isLastPageForDistinctApi(data, page, pageOptions.totalElements, _isLastPage)) {
                    _isLastPage = true;
                    resolve({
                        data: [],
                        isLastPage: _isLastPage,
                        hasMoreData: page > 1,
                        isPaginatedData,
                        page
                    });
                    return;
                }
            }
            // if data expression exists, extract the data from the expression path
            if (dataExpression) {
                if (_.isArray(data)) {
                    const index = dataExpression.lastIndexOf($I);
                    if(index > -1){
                        const restExpr = dataExpression.substr(index + 5);
                        formattedData = data.map(datum => findValueOf(datum, restExpr));
                    }
                } else if (_.isObject(data)) {
                    formattedData = _.get(data, dataExpression);
                }
                data = formattedData || data;
            }
            if (!_.isArray(data)) {
                data = this.getTransformedData(config.datasource, data);
            }
            // in case of no data received, resolve the promise with empty array
            if (!data.length) {
                resolve({data: [], isLastPage: _isLastPage, hasMoreData: page > 1, isPaginatedData, page});
            } else {
                resolve({data: data, isLastPage: _isLastPage, hasMoreData: page > 1, isPaginatedData, page});
            }
        });
    }
}
