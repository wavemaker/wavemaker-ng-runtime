import { SQLiteObject } from '@ionic-native/sqlite';

import { LocalDBStore } from './local-db-store';

export class DBInfo {
    public schema = {
        name: '',
        isInternal: false,
        entities: new Map<string, EntityInfo>()
    };
    public stores = new Map<string, LocalDBStore>();
    public queries = new Map<string, NamedQueryInfo>();
    public sqliteObject: SQLiteObject;
}

export class EntityInfo {
    public columns = new Array<ColumnInfo>();
    public pullConfig: PullConfig;
    public pushConfig: PushConfig;

    constructor(public name: string, public entityName?: string) {
        this.entityName = this.entityName || this.name;
    }
}

export class ColumnInfo {
    public generatorType: string;
    public sqlType: string;
    public primaryKey = false;
    public defaultValue: any;
    public foreignRelations?: ForeignRelationInfo[];

    constructor(public name: string, public fieldName?: string) {
        this.fieldName = this.fieldName || this.name;
    }
}

export class ForeignRelationInfo {
    public sourceFieldName: string;
    public targetEntity: string;
    public targetTable: string;
    public targetColumn: string;
    public targetFieldName: string;
    public targetPath: string;
    public dataMapper: Array<ColumnInfo>;
}

export class NamedQueryInfo {
    public params: NamedQueryParamInfo[];
    public response = {
        properties: []
    };
    constructor(public name: string, public query: string) {

    }
}

export class NamedQueryParamInfo {
    constructor(public name: string, public type?: string, public variableType?: string) {

    }
}

export class PullConfig {
    public size: number;
    public query: string;
    public orderBy: string;
    public maxNoOfRecords: number;
    public defaultType: string;
    public pullType: PullType;
    public filter: OfflineDataFilter[];
}

export enum PullType {
    LIVE = 'LIVE',
    BUNDLED = 'BUNDLED',
    APP_START = 'APP_START'
}

export class OfflineDataFilter {
    public attributeName: string;
    public attributeValue: any;
    public attributeType: string;
    public filterCondition: string;
}

export class PushConfig {
    public insertEnabled = false;
    public updateEnabled = false;
    public deleteEnabled = false;
    public readEnabled = true;
}