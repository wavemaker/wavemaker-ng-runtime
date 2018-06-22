import { DataSource, findValueOf, AppDefaults, isPageable } from '@wm/core';

import { convertDataToObject } from '../../../../utils/form-utils';
import { IDataProvider, IDataProviderConfig } from './data-provider';

declare const _;

export class RemoteDataProvider implements IDataProvider {
    public filter(config: IDataProviderConfig): Promise<any> {
        return config.datasource.execute(
            DataSource.Operation.SEARCH_RECORDS,
            {
                searchKeys: _.split(config.searchKey, ','), // todo: check for default value
                searchValue: config.query,
                orderBy: config.orderby ? _.replace(config.orderby, /:/g, ' ') : '',
                pagesize: config.limit || config.pagesize,
                page: config.page
            }
        ).then(response => this.onFilterSuccess(config, response), () => this.onFilterFailure());
    }


    // Check if the page retrieved currently is the last page. If last page, don't send any more request
    protected isLast(page: number, dataSize: number, maxResults: number, currentResults?: number): boolean {
        // if last page info is not returned by backend and current results is less than max results, this is the last page
        if (dataSize === AppDefaults.INT_MAX_VALUE) {
            return currentResults !== 0 && currentResults < maxResults;
        }
        const pageCount = ((dataSize > maxResults) ? (Math.ceil(dataSize / maxResults)) : (dataSize < 0 ? 0 : 1));
        return page === pageCount;
    }

    // this function transform the response data in case it is not an array
    // todo: variable should be of type DataSource
    protected getTransformedData(variable: any, data: any): any {
        const operationResult = variable.operation + 'Result'; // when output is only string it is available as oprationNameResult
        const tempResponse = data[operationResult];

        // in case data received is value as string then add that string value to object and convert object into array
        if (tempResponse) {
            const tempObj = {};
            _.set(tempObj, operationResult, tempResponse);
            data = [tempObj]; // convert data into an array having tempObj
        } else {
            // Todo [bandhavya] check if required.
            // in case data received is already an object then convert it into an array
            data = convertDataToObject(data);
        }

        return data;
    }

    protected onFilterFailure() {
        return [];
    }

    /**
     * this function processes the response depending on pageOptions, isPageable and prepares the formattedDataset.
     */
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
            const pageOptions = response.pagingOptions;

            if (config.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
                page = pageOptions.number + 1;
                _isLastPage = this.isLast(page, pageOptions.totalElements, pageOptions.size, pageOptions.numberOfElements);
                isPaginatedData = true;

                /*TODO: [bandhavya] This workaround is because backend is not giving the last page in distinct api. Remove after issue is fixed in backend*/
                if (page > 1 && !_isLastPage && pageOptions.totalElements === AppDefaults.INT_MAX_VALUE) {
                    _isLastPage = true;
                    resolve({
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
                const index = dataExpression.lastIndexOf($I);
                const restExpr = dataExpression.substr(index + 5);

                if (_.isArray(data)) {
                    formattedData = data.map(datum => findValueOf(datum, restExpr));
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
