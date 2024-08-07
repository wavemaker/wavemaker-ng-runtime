import { Injectable } from '@angular/core';
import {assign} from "lodash-es";

@Injectable({providedIn: 'root'})
export class FieldTypeService {
    constructor() {
        assign(this, {
            INTEGER : 'integer',
            BIG_INTEGER : 'big_integer',
            SHORT : 'short',
            FLOAT : 'float',
            BIG_DECIMAL : 'big_decimal',
            DOUBLE : 'double',
            LONG : 'long',
            BYTE : 'byte',
            STRING : 'string',
            CHARACTER : 'character',
            TEXT : 'text',
            DATE : 'date',
            TIME : 'time',
            TIMESTAMP : 'timestamp',
            DATETIME : 'datetime',
            BOOLEAN: 'boolean',
            LIST : 'list',
            CLOB : 'clob',
            BLOB : 'blob'
        });
    }
}
