import { IDataSource } from "../../types/types";
import { ApiAwareVariable } from './api-aware-variable';
import { HttpClientService } from "../../types/http-client.service";
export interface SVConfig {
    name: string;
    dataSet: any;
    isList: boolean;
    service: string;
    operation: string;
    operationId: string;
    dataBinding: any;
    serviceInfo?: any;
    httpClientService: HttpClientService;
}
export declare class ServiceVariable extends ApiAwareVariable implements IDataSource {
    _progressObservable: any;
    _observable: any;
    pagination: any;
    simulateFileDownload: any;
    serviceInfo: any;
    httpService: any;
    constructor(variable: SVConfig);
    execute(operation: any, options: any): any;
    hasPagination(): boolean;
    invoke(options?: any, success?: any, error?: any): Promise<unknown>;
    update(options: any, success?: any, error?: any): Promise<unknown>;
    download(options: any, success?: any, error?: any): any;
    setInput(key: any, val?: any, options?: any): any;
    searchRecords(options: any, success?: any, error?: any): Promise<unknown>;
    isUpdateRequired(hasData: any): boolean;
    setPagination(data: any): void;
    cancel(options?: any): void;
    init(): void;
}
