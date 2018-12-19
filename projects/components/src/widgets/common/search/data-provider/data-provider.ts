import { DataSource } from '@wm/core';

import { LocalDataProvider } from './local-data-provider';
import { RemoteDataProvider } from './remote-data-provider';

declare const _;

export interface IDataProviderConfig {
    dataoptions?: any;
    viewParent?: any;
    dataset: any;
    datafield: string;
    binddataset?: string;
    datasource?: any;
    hasData: boolean;
    query: Array<string> | string;
    searchKey?: string;
    casesensitive?: boolean;
    isformfield?: boolean;
    orderby?: string;
    limit?: number;
    pagesize?: number;
    page: number;
    noMoredata?: boolean;
    onBeforeservicecall?: Function;
}

export interface IDataProvider {
    hasMoreData?: boolean;
    isLastPage?: boolean;
    hasNoMoreData?: boolean;
    isPaginatedData?: boolean;
    page?: number;
    updateDataset?: boolean;

    filter(config: IDataProviderConfig): Promise<any>;
}

export class DataProvider implements IDataProvider {

    public hasMoreData: boolean;
    public isLastPage: boolean;
    public page: number;
    public isPaginatedData: boolean;
    public updateDataset: boolean;

    static remoteDataProvider = new RemoteDataProvider();
    static localDataProvider = new LocalDataProvider();

    public filter(config: IDataProviderConfig): Promise<any> {

        let promise: Promise<any>;

        /**
         * Make call to remoteDataProvider when searchkey is available and data is not from local / model variable.
         * Otherwise use localDataProvider
         * If datasource is a serviceVariable with no input params, then perform local search.
         * when there is no dataset on the datasource when first time make a remote call to set the dataset for service variable.
         */
        const hasNoVariableDataset = config.datasource && config.datasource.execute(DataSource.Operation.IS_UPDATE_REQUIRED, config.hasData);
        if (config.dataoptions || ((config.datasource && config.datasource.execute(DataSource.Operation.IS_API_AWARE))
            && config.searchKey
            && hasNoVariableDataset)) {
            promise = DataProvider.remoteDataProvider.filter(config);
        } else {
            promise = DataProvider.localDataProvider.filter(config);
        }

        return promise.then(response => {
            this.updateDataset = config.datasource && !config.datasource.execute(DataSource.Operation.SUPPORTS_CRUD) && hasNoVariableDataset;
            this.hasMoreData = response.hasMoreData;
            this.isLastPage = response.isLastPage;
            this.page = response.page;
            this.isPaginatedData = response.isPaginatedData;

            return response;
        });
    }
}