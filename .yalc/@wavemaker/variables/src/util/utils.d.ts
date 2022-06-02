export declare const DataType: {
    INTEGER: string;
    BIG_INTEGER: string;
    SHORT: string;
    FLOAT: string;
    BIG_DECIMAL: string;
    DOUBLE: string;
    LONG: string;
    BYTE: string;
    STRING: string;
    CHARACTER: string;
    TEXT: string;
    DATE: string;
    TIME: string;
    TIMESTAMP: string;
    DATETIME: string;
    LOCALDATETIME: string;
    BOOLEAN: string;
    LIST: string;
    CLOB: string;
    BLOB: string;
};
export declare const DEFAULT_FORMATS: {
    DATE: string;
    TIME: string;
    TIMESTAMP: string;
    DATETIME: string;
    LOCALDATETIME: string;
    DATETIME_ORACLE: string;
    DATE_TIME: string;
};
export declare const noop: (...args: any) => void;
export declare const isValidWebURL: (url: string) => boolean;
export declare const isPageable: (obj: any) => boolean;
export declare class IDGenerator {
    private generator;
    constructor(key: string);
    nextUid(): string;
}
export declare const hasCordova: () => boolean;
export declare const removeExtraSlashes: (url: any) => any;
export declare const isDefined: (v: any) => boolean;
export declare const isObject: (v: any) => boolean;
export declare const isNumberType: (type: any) => boolean;
export declare const extractType: (typeRef: string) => string;
export declare const isDateTimeType: (type: string) => any;
export declare const getValidJSON: (content: any) => any;
export declare const xmlToJson: (xmlString: string) => any;
export declare const replace: (template: any, map: any, parseError?: boolean) => any;
/**
 * prepare a blob object based on the content and content type provided
 * if content is blob itself, simply returns it back
 * @param val
 * @param valContentType
 * @returns {*}
 */
export declare const getBlob: (val: any, valContentType?: any) => any;
/**
 * Returns a deep cloned replica of the passed object/array
 * @param object object/array to clone
 * @returns a clone of the passed object
 */
export declare const getClonedObject: (object: any) => any;
/**
 * this method checks if a given string starts with the given string
 */
export declare const stringStartsWith: (str: string, startsWith: string, ignoreCase?: boolean) => boolean;
export declare function triggerFn(fn: any, ...argmnts: any): any;
export declare const findValueOf: (obj: any, key: any, create?: any) => any;
