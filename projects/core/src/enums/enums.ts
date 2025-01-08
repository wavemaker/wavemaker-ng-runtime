export enum FormWidgetType {
    AUTOCOMPLETE = 'autocomplete',
    CHECKBOX = 'checkbox',
    CHECKBOXSET = 'checkboxset',
    CHIPS = 'chips',
    COLORPICKER = 'colorpicker',
    CURRENCY = 'currency',
    DATE = 'date',
    DATETIME = 'datetime',
    NUMBER = 'number',
    PASSWORD = 'password',
    RADIOSET = 'radioset',
    RATING = 'rating',
    RICHTEXT = 'richtext',
    SELECT = 'select',
    TOGGLE = 'toggle',
    SLIDER = 'slider',
    SWITCH = 'switch',
    TEXT = 'text',
    TEXTAREA = 'textarea',
    TIME = 'time',
    TIMESTAMP = 'timestamp',
    TYPEAHEAD = 'typeahead',
    UPLOAD = 'upload'
}

export enum DataType {
    INTEGER = 'integer',
    BIG_INTEGER = 'big_integer',
    SHORT = 'short',
    FLOAT = 'float',
    BIG_DECIMAL = 'big_decimal',
    DOUBLE = 'double',
    LONG = 'long',
    BYTE = 'byte',
    STRING = 'string',
    CHARACTER = 'character',
    TEXT = 'text',
    DATE = 'date',
    TIME = 'time',
    TIMESTAMP = 'timestamp',
    DATETIME = 'datetime',
    LOCALDATETIME = 'localdatetime',
    BOOLEAN = 'boolean',
    LIST = 'list',
    CLOB = 'clob',
    BLOB = 'blob'
}

export enum MatchMode {
    BETWEEN = 'between',
    GREATER = 'greaterthanequal',
    LESSER = 'lessthanequal',
    NULL = 'null',
    EMPTY = 'empty',
    NULLOREMPTY = 'nullorempty',
    EQUALS = 'exact'
}

export enum DEFAULT_FORMATS {
    DATE = 'yyyy-MM-dd',
    TIME = 'HH:mm:ss',
    TIMESTAMP = 'timestamp',
    DATETIME = 'yyyy-MM-ddTHH:mm:ss',
    LOCALDATETIME = 'yyyy-MM-ddTHH:mm:ss',
    DATETIME_ORACLE = 'yyyy-MM-dd HH:mm:ss',
    DATE_TIME = 'yyyy-MM-dd HH:mm:ss'
}
