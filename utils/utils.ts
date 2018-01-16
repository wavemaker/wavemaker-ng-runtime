import * as moment from 'moment';
import {
    includes as _includes,
    startsWith as _startsWith,
    attempt as _attempt,
    isError as _isError,
    get as  _get,
    isFunction as _isFunction,
    cloneDeep as _cloneDeep,
    intersection as _intersection,
    isArray as _isArray
} from 'lodash';

const REGEX = {
    SNAKE_CASE: /[A-Z]/g,
    ANDROID: /Android/i,
    IPHONE: /iPhone/i,
    IPOD: /iPod/i,
    IPAD: /iPad/i,
    ANDROID_TABLET: /android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i,
    MOBILE: /Mobile/i,
    WINDOWS: /Windows Phone/i,
    SUPPORTED_IMAGE_FORMAT: /\.(bmp|gif|jpe|jpg|jpeg|tif|tiff|pbm|png|ico)$/i,
    SUPPORTED_FILE_FORMAT: /\.(txt|js|css|html|script|properties|json|java|xml|smd|xmi|sql|log|wsdl|vm|ftl|jrxml|yml|yaml|md|less|jsp)$/i,
    SUPPORTED_AUDIO_FORMAT: /\.(mp3|ogg|webm|wma|3gp|wav|m4a)$/i,
    SUPPORTED_VIDEO_FORMAT: /\.(mp4|ogg|webm|wmv|mpeg|mpg|avi)$/i,
    PAGE_RESOURCE_PATH: /^\/pages\/.*\.(js|css|html|json)$/,
    MIN_PAGE_RESOURCE_PATH: /.*(page.min.html)$/,
    VALID_EMAIL: /^[a-zA-Z][\w.+]+@[a-zA-Z_]+?\.[a-zA-Z.]{1,4}[a-zA-Z]$/,
    VALID_WEB_URL: /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9=:?\/\.\-]+(\.[a-zA-Z]{2,5}[\.]{0,1})?/,  // ref : http://stackoverflow.com/questions/4314741/url-regex-validation
    VALID_WEBSOCKET_URL: /^(ws[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9=:?\/\.\-]+(\.[a-zA-Z]{2,5}[\.]{0,1})?/,  // ref : http://stackoverflow.com/questions/4314741/url-regex-validation
    REPLACE_PATTERN: /\$\{([^\}]+)\}/g,
    ZIP_FILE: /\.zip$/i,
    EXE_FILE: /\.exe$/i,
    NO_QUOTES_ALLOWED: /^[^'|"]*$/,
    NO_DOUBLE_QUOTES_ALLOWED: /^[^"]*$/,
    VALID_HTML: /<[a-z][\s\S]*>/i,
    VALID_PASSWORD: /^[0-9a-zA-Z-_.@&*!#$%]+$/,
    SPECIAL_CHARACTERS: /[^A-Z0-9a-z_]+/i,
    APP_SERVER_URL_FORMAT: /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9\.\-]+([:]?[0-9]{2,5}|\.[a-zA-Z]{2,5}[\.]{0,1})\/+[^?#&=]+$/,
    JSON_DATE_FORMAT: /\d{4}-[0-1]\d-[0-3]\d(T[0-2]\d:[0-5]\d:[0-5]\d.\d{1,3}Z$)?/
};

const NUMBER_TYPES = ['int', 'integer', 'float', 'double', 'long', 'short', 'byte', 'big_integer', 'big_decimal'];

export const enum EVENT_LIFE {ONCE, WINDOW}

export const isDefined = v => 'undefined' !== typeof v;

export const isObject = v => null !== v && 'object' === typeof v;

export const debounce = (fn: Function, wait: number = 50) => {
    let timeout;
    return (...args) => {
        window['__zone_symbol__clearTimeout'](timeout);
        timeout = window['__zone_symbol__setTimeout'](() => fn(...args), wait);
    };
};

export function* idMaker(token) {
    let id = 1;
    while (1) {
        yield `${token}${id++}`;
    }
}


/**
 * this method encodes the url and returns the encoded string
 */
export const encodeUrl = (url: string): string => {
    const index = url.indexOf('?');
    if (index > -1) {
        // encode the relative path
        url = encodeURI(url.substring(0, index)) + url.substring(index);
        // encode url params, not encoded through encodeURI
        url = encodeUrlParams(url);
    } else {
        url = encodeURI(url);
    }

    return url;
};

/**
 * this method encodes the url params and is private to the class only
 */
export const encodeUrlParams = (url: string): string => {
    let queryParams, encodedParams = '', queryParamsString, index;
    index = url.indexOf('?');
    if (index > -1) {
        index += 1;
        queryParamsString = url.substring(index);
        // Encoding the query params if exist
        if (queryParamsString) {
            queryParams = queryParamsString.split('&');
            queryParams.forEach(function (param) {
                let decodedParamValue;
                const i = _includes(param, '=') ? param.indexOf('=') : (param && param.length),
                    paramName = param.substr(0, i),
                    paramValue = param.substr(i + 1);

                // add the = for param name only when the param value exists in the given param or empty value is assigned
                if (paramValue || _includes(param, '=')) {
                    try {
                        decodedParamValue = decodeURIComponent(paramValue);
                    } catch (e) {
                        decodedParamValue = paramValue;
                    }
                    encodedParams += paramName + '=' + encodeURIComponent(decodedParamValue) + '&';
                } else {
                    encodedParams += paramName + '&';
                }
            });
            encodedParams = encodedParams.slice(0, -1);
            url = url.replace(queryParamsString, encodedParams);
        }
    }
    return url;
};

/**
 * this method checks if a insecure content request is being made
 */
export const isInsecureContentRequest = (url: string): boolean => {

    const parser: HTMLAnchorElement = document.createElement('a');
    parser.href = url;

    // for relative urls IE returns the protocol as empty string
    if (parser.protocol === '') {
        return false;
    }

    if (stringStartsWith(location.href, 'https://')) {
        return parser.protocol !== 'https:' && parser.protocol !== 'wss:';
    }

    return false;
};

/**
 * this method checks if a given string starts with the given string
 */
export const stringStartsWith = (str: string, startsWith: string, ignoreCase?): boolean => {
    return _startsWith(str, startsWith);
};

export const getEvaluatedExprValue = (object, expression) => {
    let val;
    /**
     * Evaluate the expression with the scope and object.
     * $eval is used, as expression can be in format of field1 + ' ' + field2
     * $eval can fail, if expression is not in correct format, so attempt the eval function
     */
    val = _attempt(function () {

        const argsExpr = Object.keys(object).map((fieldName) => {
            return `var ${fieldName} = data['${fieldName}'];`;
        }).join(' ');
        const f = new Function('data', `${argsExpr} return  ${expression}`);
        return f(object);
    });
    /**
     * $eval fails if field expression has spaces. Ex: 'field name' or 'field@name'
     * As a fallback, get value directly from object or scope
     */
    if (_isError(val)) {
        val = _get(object, expression);
    }
    return val;
};

/* functions for resource Tab*/
export const isImageFile = (fileName) => {
    return (REGEX.SUPPORTED_IMAGE_FORMAT).test(fileName);
};

export const isValidWebURL = (url: string): boolean => {
    return (REGEX.VALID_WEB_URL).test(url);
};

/*This function returns the url to the image after checking the validity of url*/
export const getImageUrl = (urlString, shouldEncode?, defaultUrl?) => {
    /*In studio mode before setting picturesource, check if the studioController is loaded and new picturesource is in 'styles/images/' path or not.
     * When page is refreshed, loader.gif will be loaded first and it will be in 'style/images/'.
     * Prepend 'services/projects/' + $rootScope.project.id + '/web/resources/images/imagelists/'  if the image url is just image name in the project root,
     * and if the url pointing to resources/images/ then 'services/projects/' + $rootScope.project.id + '/web/'*/
    if (isValidWebURL(urlString)) {
        return urlString;
    }

    // If no value is provided for picturesource assign pictureplaceholder or default-image
    if ((!isImageFile(urlString)) || !urlString) {
        urlString = defaultUrl || 'resources/images/imagelists/default-image.png';
    }

    urlString = shouldEncode ? encodeUrl(urlString) : urlString;

    // if the resource to be loaded is inside a prefab
    if (stringStartsWith(urlString, 'services/prefabs')) {
        return urlString;
    }

    return urlString;
};

/*This function returns the url to the resource after checking the validity of url*/
export const getResourceURL = (urlString) => {
    if (isValidWebURL(urlString)) {
        /*TODO: Use DomSanitizer*/
        // return sanitizer.bypassSecurityTrustResourceUrl(urlString);
    }
    return urlString;
};

/*This method returns the url to the backgroundImage*/
export const getBackGroundImageUrl = (urlString) => {
    if (urlString === '' || urlString === 'none') {
        return urlString;
    }
    return 'url(' + getImageUrl(urlString) + ')';
};

/*function to check if fn is a function and then execute*/
export function triggerFn(fn, ...argmnts) {
    /* Use of slice on arguments will make this function not optimizable
    * https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
    * */

    let start = 1;
    const len = arguments.length, args = new Array(len - start);
    for (start; start < len; start++) {
        args[start - 1] = arguments[start];
    }

    if (_isFunction(fn)) {
        return fn.apply(null, args);
    }
}

/**
 * This method is used to get the formatted date
 */
export const getFormattedDate = (dateObj, format: string): any => {
    if (!dateObj) {
        return;
    }
    if (format === 'timestamp') {
        return moment(dateObj).valueOf();
    }
    return moment(dateObj).format(format);
};

export const addEventListener = (_element: Element, excludeElement: Element, eventType, successCB, life: EVENT_LIFE) => {
    const element: Element = _element;
    const eventListener = (event) => {
        if (excludeElement && (excludeElement.contains(event.target) || excludeElement === event.target)) {
            return;
        }
        if (life === EVENT_LIFE.ONCE) {
            element.removeEventListener(eventType, eventListener);
        }
        successCB();
    };
    element.addEventListener(eventType, eventListener);
};

/**
 * Returns a deep cloned replica of the passed object/array
 * @param object object/array to clone
 * @returns a clone of the passed object
 */
export const getClonedObject = (object) => {
    return _cloneDeep(object);
};

/*Function to generate a random number*/
function random() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

/*Function to generate a guid based on random numbers.*/
export const generateGUId = () => {
    return random() + '-' + random() + '-' + random();
};

/**
 * Validate if given access role is in current loggedin user access roles
 */
export const validateAccessRoles = (roleExp) => {
    let roles;

    if (roleExp) {

        roles = roleExp && roleExp.split(',').map(Function.prototype.call, String.prototype.trim);

        return _intersection(roles, []).length;
    }

    return true;
};

export const getValidJSON = (content) => {
    if (!content) {
        return false;
    }
    try {
        const parsedIntValue = parseInt(content, 10);
        /*obtaining json from editor content string*/
        return isObject(content) || !isNaN(parsedIntValue) ? content : JSON.parse(content);
    } catch (e) {
        /*terminating execution if new variable object is not valid json.*/
        return false;
    }
};

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
export const findValueOf = (obj, key, create?) => {

    if (!obj || !key) {
        return;
    }

    if (!create) {
        return _get(obj, key);
    }

    const parts = key.split('.'),
        keys = [];

    let skipProcessing;

    parts.forEach((part) => {
        if (!parts.length) { // if the part of a key is not valid, skip the processing.
            skipProcessing = true;
            return false;
        }

        const subParts = part.match(/\w+/g);
        let subPart;

        while (subParts.length) {
            subPart = subParts.shift();
            keys.push({'key': subPart, 'value': subParts.length ? [] : {}}); // determine whether to create an array or an object
        }
    });

    if (skipProcessing) {
        return undefined;
    }

    keys.forEach((_key) => {
        let tempObj = obj[_key.key];
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

/*
* extracts and returns the last bit from full typeRef of a field
* e.g. returns 'String' for typeRef = 'java.lang.String'
* @params: {typeRef} type reference
*/
export const extractType = (typeRef: string): string => {
    let type;
    if (!typeRef) {
        return 'string';
    }
    type = typeRef && typeRef.substring(typeRef.lastIndexOf('.') + 1);
    type = type && type.toLowerCase();
    type = type === 'localdatetime' ? 'datetime' : type;
    return type;
};

/* returns true if the provided data type matches number type */
export const isNumberType = (type: any): boolean => {
    return (NUMBER_TYPES.indexOf(extractType(type).toLowerCase()) !== -1);
};

/* function to check if provided object is empty*/
export const isEmptyObject = (obj: any): boolean => {
    if (isObject(obj) && !_isArray(obj)) {
        return Object.keys(obj).length === 0;
    }
    return false;
};

