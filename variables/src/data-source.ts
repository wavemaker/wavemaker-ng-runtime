export class IDataSource {
    execute: (operation: DataSource.OPERATION, options: any) => Promise<any>;
}


export namespace DataSource {
    export enum OPERATION {
        LIST_RECORD = 'listRecord',
        UPDATE_RECORD = 'updateRecord',
        INSERT_RECORD = 'insertRecord',
        DELETE_RECORD = 'deleteRecord',
        INVOKE = 'invoke',
        UPDATE = 'update',
        NOTIFY = 'notify'
    }
}