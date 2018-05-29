import { LocalDataProvider } from './local-data-provider';
import { RemoteDataProvider } from './remote-data-provider';

declare const _;

export interface IDataProviderConfig {
    dataset: any;
    datafield: any;
    binddataset?: string;
    datasource?: any;
    query: string;
    searchKey?: string;
    casesensitive?: boolean;
    orderby?: string;
    limit?: number;
    pagesize?: number;
    page: number;
    noMoredata?: boolean;
}

export interface IDataProvider {
    hasMoreData?: boolean;
    isLastPage?: boolean;
    hasNoMoreData?: boolean;
    isPaginatedData?: boolean;
    page?: number;

    filter(config: IDataProviderConfig): Promise<any>;
}

export class DataProvider implements IDataProvider {

    public hasMoreData: boolean;
    public isLastPage: boolean;
    public page: number;
    public isPaginatedData: boolean;
    public hasNoMoreData: boolean;

    static remoteDataProvider = new RemoteDataProvider();
    static localDataProvider = new LocalDataProvider();

    public filter(config: IDataProviderConfig): Promise<any> {

        let promise: Promise<any>;

        /**
         * Make call to remoteDataProvider when searchkey is available.
         * Otherwise use localDataProvider
         */
        if (config.searchKey) {
            promise = DataProvider.remoteDataProvider.filter(config);
        } else {
            promise = DataProvider.localDataProvider.filter(config);
        }

        return promise.then(response => {
            this.hasMoreData = response.hasMoreData;
            this.isLastPage = response.isLastPage;
            this.page = response.page;
            this.hasNoMoreData = response.isLastPage;
            this.isPaginatedData = response.isPaginatedData;

            return response;
        });
    }
}