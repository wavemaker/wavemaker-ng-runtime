var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// declare const X2JS: any;
// @ts-ignore
import X2JS from 'x2js';
import _ from 'lodash';
export var DataType = {
    INTEGER: 'integer',
    BIG_INTEGER: 'big_integer',
    SHORT: 'short',
    FLOAT: 'float',
    BIG_DECIMAL: 'big_decimal',
    DOUBLE: 'double',
    LONG: 'long',
    BYTE: 'byte',
    STRING: 'string',
    CHARACTER: 'character',
    TEXT: 'text',
    DATE: 'date',
    TIME: 'time',
    TIMESTAMP: 'timestamp',
    DATETIME: 'datetime',
    LOCALDATETIME: 'localdatetime',
    BOOLEAN: 'boolean',
    LIST: 'list',
    CLOB: 'clob',
    BLOB: 'blob'
};
export var DEFAULT_FORMATS = {
    DATE: "yyyy-MM-dd",
    TIME: "HH:mm:ss",
    TIMESTAMP: "timestamp",
    DATETIME: "yyyy-MM-ddTHH:mm:ss",
    LOCALDATETIME: "yyyy-MM-ddTHH:mm:ss",
    DATETIME_ORACLE: "yyyy-MM-dd HH:mm:ss",
    DATE_TIME: "yyyy-MM-dd HH:mm:ss"
};
var REGEX = {
    SNAKE_CASE: /[A-Z]/g,
    ANDROID: /Android/i,
    IPHONE: /iPhone/i,
    IPOD: /iPod/i,
    IPAD: /iPad/i,
    MAC: /Mac/i,
    ANDROID_TABLET: /android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i,
    MOBILE: /Mobile/i,
    WINDOWS: /Windows Phone/i,
    SUPPORTED_IMAGE_FORMAT: /\.(bmp|gif|jpe|jpg|jpeg|tif|tiff|pbm|png|ico)$/i,
    SUPPORTED_FILE_FORMAT: /\.(txt|js|css|html|script|properties|json|java|xml|smd|xmi|sql|log|wsdl|vm|ftl|jrxml|yml|yaml|md|less|jsp)$/i,
    SUPPORTED_AUDIO_FORMAT: /\.(mp3|ogg|webm|wma|3gp|wav|m4a)$/i,
    SUPPORTED_VIDEO_FORMAT: /\.(mp4|ogg|webm|wmv|mpeg|mpg|avi|mov)$/i,
    PAGE_RESOURCE_PATH: /^\/pages\/.*\.(js|css|html|json)$/,
    MIN_PAGE_RESOURCE_PATH: /.*(page.min.html)$/,
    VALID_EMAIL: /^[a-zA-Z][\w.+]+@[a-zA-Z_]+?\.[a-zA-Z.]{1,4}[a-zA-Z]$/,
    VALID_WEB_URL: /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9=:?\/\.\-]+(\.[a-zA-Z]{2,5}[\.]{0,1})?/,
    VALID_WEBSOCKET_URL: /^(ws[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9=:?\/\.\-]+(\.[a-zA-Z]{2,5}[\.]{0,1})?/,
    VALID_RELATIVE_URL: /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/,
    REPLACE_PATTERN: /\$\{([^\}]+)\}/g,
    ZIP_FILE: /\.zip$/i,
    EXE_FILE: /\.exe$/i,
    NO_QUOTES_ALLOWED: /^[^'|"]*$/,
    NO_DOUBLE_QUOTES_ALLOWED: /^[^"]*$/,
    VALID_HTML: /<[a-z][\s\S]*>/i,
    VALID_PASSWORD: /^[0-9a-zA-Z-_.@&*!#$%]+$/,
    SPECIAL_CHARACTERS: /[^A-Z0-9a-z_]+/i,
    APP_SERVER_URL_FORMAT: /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9\.\-]+([:]?[0-9]{2,5}|\.[a-zA-Z]{2,5}[\.]{0,1})\/+[^?#&=]+$/,
    JSON_DATE_FORMAT: /\d{4}-[0-1]\d-[0-3]\d(T[0-2]\d:[0-5]\d:[0-5]\d.\d{1,3}Z$)?/,
    DATA_URL: /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i
};
var NUMBER_TYPES = ['int', DataType.INTEGER, DataType.FLOAT, DataType.DOUBLE, DataType.LONG, DataType.SHORT, DataType.BYTE, DataType.BIG_INTEGER, DataType.BIG_DECIMAL];
export var noop = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
};
function idGenerator(token) {
    var id;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = 1;
                _a.label = 1;
            case 1:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, "" + token + id++];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
export var isValidWebURL = function (url) {
    return (REGEX.VALID_WEB_URL).test(url);
};
/*Function to check whether the specified object is a pageable object or not.*/
export var isPageable = function (obj) {
    var pageable = {
        'content': [],
        'first': true,
        'last': true,
        'number': 0,
        'numberOfElements': 10,
        'size': 20,
        'sort': null,
        'totalElements': 10,
        'totalPages': 1
    };
    // paginated object may or may not contain 'empty' property. In either case, Pageable should return as true.
    var paginatedObj = _.omit(obj, 'empty');
    return (_.isEqual(_.keys(pageable), _.keys(paginatedObj).sort()));
};
var IDGenerator = /** @class */ (function () {
    function IDGenerator(key) {
        this.generator = idGenerator(key);
    }
    IDGenerator.prototype.nextUid = function () {
        return this.generator.next().value;
    };
    return IDGenerator;
}());
export { IDGenerator };
// ToDo - variable seperation
export var hasCordova = function () {
    return !!window['cordova'];
};
export var removeExtraSlashes = function (url) {
    var base64regex = /^data:image\/([a-z]{2,});base64,/;
    if (_.isString(url)) {
        /*
        * support for mobile apps having local file path url starting with file:/// and
        * support for base64 format
        * */
        if (_.startsWith(url, 'file:///') || base64regex.test(url)) {
            return url;
        }
        return url.replace(new RegExp('([^:]\/)(\/)+', 'g'), '$1');
    }
};
export var isDefined = function (v) { return 'undefined' !== typeof v; };
export var isObject = function (v) { return null !== v && 'object' === typeof v; };
/* returns true if the provided data type matches number type */
export var isNumberType = function (type) {
    return (NUMBER_TYPES.indexOf(extractType(type).toLowerCase()) !== -1);
};
/*
* extracts and returns the last bit from full typeRef of a field
* e.g. returns 'String' for typeRef = 'java.lang.String'
* @params: {typeRef} type reference
*/
export var extractType = function (typeRef) {
    var type;
    if (!typeRef) {
        return DataType.STRING;
    }
    type = typeRef && typeRef.substring(typeRef.lastIndexOf('.') + 1);
    type = type && type.toLowerCase();
    type = type === DataType.LOCALDATETIME ? DataType.DATETIME : type;
    return type;
};
/*Function to check if date time type*/
export var isDateTimeType = function (type) {
    if (_.includes(type, '.')) {
        type = _.toLower(extractType(type));
    }
    return _.includes([DataType.DATE, DataType.TIME, DataType.TIMESTAMP, DataType.DATETIME, DataType.LOCALDATETIME], type);
};
export var getValidJSON = function (content) {
    if (!content) {
        return undefined;
    }
    try {
        var parsedIntValue = parseInt(content, 10);
        /*obtaining json from editor content string*/
        return isObject(content) || !isNaN(parsedIntValue) ? content : JSON.parse(content);
    }
    catch (e) {
        /*terminating execution if new variable object is not valid json.*/
        return undefined;
    }
};
export var xmlToJson = function (xmlString) {
    var x2jsObj = new X2JS({ 'emptyNodeForm': 'content', 'attributePrefix': '', 'enableToStringFunc': false });
    var json = x2jsObj.xml2js(xmlString);
    if (json) {
        json = _.get(json, Object.keys(json)[0]);
    }
    return json;
};
/*
 * Util method to replace patterns in string with object keys or array values
 * Examples:
 * Utils.replace('Hello, ${first} ${last} !', {first: 'wavemaker', last: 'ng'}) --> Hello, wavemaker ng
 * Utils.replace('Hello, ${0} ${1} !', ['wavemaker','ng']) --> Hello, wavemaker ng
 * Examples if parseError is true:
 * Utils.replace('Hello, {0} {1} !', ['wavemaker','ng']) --> Hello, wavemaker ng
 */
export var replace = function (template, map, parseError) {
    var regEx = REGEX.REPLACE_PATTERN;
    if (!template) {
        return;
    }
    if (parseError) {
        regEx = /\{([^\}]+)\}/g;
    }
    return template.replace(regEx, function (match, key) {
        return _.get(map, key);
    });
};
/**
 * prepare a blob object based on the content and content type provided
 * if content is blob itself, simply returns it back
 * @param val
 * @param valContentType
 * @returns {*}
 */
export var getBlob = function (val, valContentType) {
    if (val instanceof Blob) {
        return val;
    }
    var jsonVal = getValidJSON(val);
    if (jsonVal && jsonVal instanceof Object) {
        val = new Blob([JSON.stringify(jsonVal)], { type: valContentType || 'application/json' });
    }
    else {
        val = new Blob([val], { type: valContentType || 'text/plain' });
    }
    return val;
};
/**
 * Returns a deep cloned replica of the passed object/array
 * @param object object/array to clone
 * @returns a clone of the passed object
 */
export var getClonedObject = function (object) {
    return _.cloneDeep(object);
};
/**
 * this method checks if a given string starts with the given string
 */
export var stringStartsWith = function (str, startsWith, ignoreCase) {
    if (!str) {
        return false;
    }
    var regEx = new RegExp('^' + startsWith, ignoreCase ? 'i' : '');
    return regEx.test(str);
};
/*function to check if fn is a function and then execute*/
export function triggerFn(fn) {
    /* Use of slice on arguments will make this function not optimizable
    * https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
    * */
    var argmnts = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        argmnts[_i - 1] = arguments[_i];
    }
    var start = 1;
    var len = arguments.length, args = new Array(len - start);
    for (start; start < len; start++) {
        args[start - 1] = arguments[start];
    }
    if (_.isFunction(fn)) {
        return fn.apply(null, args);
    }
}
/*
 * Util method to find the value of a key in the object
 * if key not found and create is true, an object is created against that node
 * Examples:
 * var a = {
 *  b: {
 *      c : {
 *          d: 'test'
 *      }
 *  }
 * }
 * Utils.findValue(a, 'b.c.d') --> 'test'
 * Utils.findValue(a, 'b.c') --> {d: 'test'}
 * Utils.findValue(a, 'e') --> undefined
 * Utils.findValue(a, 'e', true) --> {} and a will become:
 * {
 *   b: {
 *      c : {
 *          d: 'test'
 *      }
 *  },
 *  e: {
 *  }
 * }
 */
export var findValueOf = function (obj, key, create) {
    if (!obj || !key) {
        return;
    }
    if (!create) {
        return _.get(obj, key);
    }
    var parts = key.split('.'), keys = [];
    var skipProcessing;
    parts.forEach(function (part) {
        if (!parts.length) { // if the part of a key is not valid, skip the processing.
            skipProcessing = true;
            return false;
        }
        var subParts = part.match(/\w+/g);
        var subPart;
        while (subParts.length) {
            subPart = subParts.shift();
            keys.push({ 'key': subPart, 'value': subParts.length ? [] : {} }); // determine whether to create an array or an object
        }
    });
    if (skipProcessing) {
        return undefined;
    }
    keys.forEach(function (_key) {
        var tempObj = obj[_key.key];
        if (!isObject(tempObj)) {
            tempObj = getValidJSON(tempObj);
            if (!tempObj) {
                tempObj = _key.value;
            }
        }
        obj[_key.key] = tempObj;
        obj = tempObj;
    });
    return obj;
};
//# sourceMappingURL=utils.js.map