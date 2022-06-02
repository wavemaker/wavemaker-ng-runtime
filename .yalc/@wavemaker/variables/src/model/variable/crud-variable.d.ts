import { IDataSource } from "../../types/types";
import { ApiAwareVariable } from './api-aware-variable';
export declare class CrudVariable extends ApiAwareVariable implements IDataSource {
    _progressObservable: any;
    _observable: any;
    pagination: any;
    list: any;
    create: any;
    update: any;
    delete: any;
    simulateFileDownload: any;
    serviceInfo: any;
    httpService: any;
    constructor(variable: any);
    execute(operation: any, options: any): any;
    hasPagination(): boolean;
    invoke(options?: any, success?: any, error?: any): Promise<unknown>;
    createRecord(options?: any, success?: any, error?: any): Promise<unknown>;
    listRecords(options?: any, success?: any, error?: any): Promise<unknown>;
    updateRecord(options?: any, success?: any, error?: any): Promise<unknown>;
    deleteRecord(options?: any, success?: any, error?: any): Promise<unknown>;
    download(options: any, success?: any, error?: any): any;
    setInput(key: any, val?: any, options?: any): any;
    searchRecords(options: any, success?: any, error?: any): Promise<unknown>;
    isUpdateRequired(hasData: any): boolean;
    cancel(options?: any): void;
    setPagination(data: any): void;
    init(): void;
}
