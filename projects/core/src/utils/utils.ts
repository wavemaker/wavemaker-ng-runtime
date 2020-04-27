import { Subject } from 'rxjs';

import { getWmProjectProperties } from './wm-project-properties';

import { $watch, $appDigest } from './watcher';
import { DataType } from '../enums/enums';
import { DataSource } from '../types/types';
import { setAttr } from './dom';
import { $parseEvent } from './expression-parser';

declare const _, X2JS;
declare const moment;
declare const document;
declare const resolveLocalFileSystemURL;
declare const $;

const userAgent = window.navigator.userAgent;
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
    JSON_DATE_FORMAT: /\d{4}-[0-1]\d-[0-3]\d(T[0-2]\d:[0-5]\d:[0-5]\d.\d{1,3}Z$)?/
},
    compareBySeparator = ':';

const NUMBER_TYPES = ['int', DataType.INTEGER, DataType.FLOAT, DataType.DOUBLE, DataType.LONG, DataType.SHORT, DataType.BYTE, DataType.BIG_INTEGER, DataType.BIG_DECIMAL];
const now: Date = new Date();
const CURRENT_DATE = 'CURRENT_DATE';

export const enum EVENT_LIFE { ONCE, WINDOW }

export const isDefined = v => 'undefined' !== typeof v;

export const isObject = v => null !== v && 'object' === typeof v;

export const toBoolean = (val, identity?) => ((val && val !== 'false') ? true : (identity ? val === identity : false));

function isIE11() {
    return window.navigator.appVersion.indexOf('Trident/') > -1;
}

export const isIE = () => {
    return isIE11() || window.navigator.userAgent.indexOf('MSIE') > -1;
};


export const isAndroid = () => REGEX.ANDROID.test(userAgent);

export const isAndroidTablet = () => REGEX.ANDROID_TABLET.test(userAgent);

export const isIphone = () => REGEX.IPHONE.test(userAgent);
export const isIpod = () => REGEX.IPOD.test(userAgent);
export const isIpad = () => REGEX.IPAD.test(userAgent);
export const isIos = () => isIphone() || isIpod() || isIpad();

export const isMobile = () => isAndroid() || isIos() || isAndroidTablet() || $('#wm-mobile-display:visible').length > 0;

export const isMobileApp = () => getWmProjectProperties().platformType === 'MOBILE' && getWmProjectProperties().type === 'APPLICATION';

export const getAndroidVersion = () => {
    const match = (window.navigator.userAgent.toLowerCase()).match(/android\s([0-9\.]*)/);
    return match ? match[1] : '';
};

export const isKitkatDevice = () => isAndroid() && parseInt(getAndroidVersion(), 10) === 4;

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
                const i = _.includes(param, '=') ? param.indexOf('=') : (param && param.length),
                    paramName = param.substr(0, i),
                    paramValue = param.substr(i + 1);

                // add the = for param name only when the param value exists in the given param or empty value is assigned
                if (paramValue || _.includes(param, '=')) {
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

/* capitalize the first-letter of the string passed */
export const initCaps = name => {
    if (!name) {
        return '';
    }
    return name.charAt(0).toUpperCase() + name.substring(1);
};

/* convert camelCase string to a space separated string */
export const spaceSeparate = name => {
    if (name === name.toUpperCase()) {
        return name;
    }
    return name.replace(REGEX.SNAKE_CASE, function (letter, pos) {
        return (pos ? ' ' : '') + letter;
    });
};

/*Replace the character at a particular index*/
export const replaceAt = (string, index, character) => string.substr(0, index) + character + string.substr(index + character.length);

/*Replace '.' with space and capitalize the next letter*/
export const periodSeparate = name => {
    let dotIndex;
    dotIndex = name.indexOf('.');
    if (dotIndex !== -1) {
        name = replaceAt(name, dotIndex + 1, name.charAt(dotIndex + 1).toUpperCase());
        name = replaceAt(name, dotIndex, ' ');
    }
    return name;
};

export const prettifyLabel = label => {
    label = _.camelCase(label);
    /*capitalize the initial Letter*/
    label = initCaps(label);
    /*Convert camel case words to separated words*/
    label = spaceSeparate(label);
    /*Replace '.' with space and capitalize the next letter*/
    label = periodSeparate(label);
    return label;
};

export const deHyphenate = (name) => {
    return name.split('-').join(' ');
};

/*Accepts an array or a string separated with symbol and returns prettified result*/
export const prettifyLabels = (names, separator = ',') => {
    let modifiedNames, namesArray = [];

    if (!_.isArray(names)) {
        namesArray = _.split(names, separator);
    }

    modifiedNames = _.map(namesArray, prettifyLabel);
    if (_.isArray(names)) {
        return modifiedNames;
    }
    return modifiedNames.join(separator);
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
    if (!str) {
        return false;
    }

    const regEx = new RegExp('^' + startsWith, ignoreCase ? 'i' : '');

    return regEx.test(str);
};

export const getEvaluatedExprValue = (object, expression) => {
    let val;
    /**
     * Evaluate the expression with the scope and object.
     * $eval is used, as expression can be in format of field1 + ' ' + field2
     * $eval can fail, if expression is not in correct format, so attempt the eval function
     */
    val = _.attempt(function () {

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
    if (_.isError(val)) {
        val = _.get(object, expression);
    }
    return val;
};

/* functions for resource Tab*/
export const isImageFile = (fileName) => {
    return (REGEX.SUPPORTED_IMAGE_FORMAT).test(fileName);
};

export const isAudioFile = (fileName) => {
    return (REGEX.SUPPORTED_AUDIO_FORMAT).test(fileName);
};

export const isVideoFile = (fileName) => {
    return (REGEX.SUPPORTED_VIDEO_FORMAT).test(fileName);
};

export const isValidWebURL = (url: string): boolean => {
    return (REGEX.VALID_WEB_URL).test(url);
};

/*This function returns the url to the resource after checking the validity of url*/
export const getResourceURL = (urlString) => {
    if (isValidWebURL(urlString)) {
        /*TODO: Use DomSanitizer*/
        // return sanitizer.bypassSecurityTrustResourceUrl(urlString);
    }
    return urlString;
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

    if (_.isFunction(fn)) {
        return fn.apply(null, args);
    }
}

/**
 * This method is used to get the formatted date
 */
export const getFormattedDate = (datePipe, dateObj, format: string): any => {
    if (!dateObj) {
        return undefined;
    }
    if (format === 'timestamp') {
        return moment(dateObj).valueOf();
    }
    return datePipe.transform(dateObj, format);
};

/**
 * method to get the date object from the input received
 */
export const getDateObj = (value, options?): Date => {
    // Handling localization
    if (options && options.pattern && options.pattern !== 'timestamp') {
        const pattern = momentPattern(options.pattern);
        value = moment(value, pattern).toDate();
    }

    /*if the value is a date object, no need to covert it*/
    if (_.isDate(value)) {
        return value;
    }

    /*if the value is a timestamp string, convert it to a number*/
    if (!isNaN(value)) {
        value = parseInt(value, 10);
    }

    if (!moment(value).isValid() || value === '' || value === null || value === undefined) {
        return undefined;
    }
    let dateObj = new Date(value);
    /**
     * if date value is string "20-05-2019" then new Date(value) return 20May2019 with current time in India,
     * whereas this will return 19May2019 with time lagging for few hours.
     * This is because it returns UTC time i.e. Coordinated Universal Time (UTC).
     * To create date in local time use moment
     */
    if (_.isString(value)) {
        dateObj = new Date(moment(value).format());
    }

    if (value === CURRENT_DATE || isNaN(dateObj.getDay())) {
        return now;
    }
    return dateObj;
};

export const addEventListenerOnElement = (_element: Element, excludeElement: Element, nativeElement: Element, eventType, isDropDownDisplayEnabledOnInput, successCB, life: EVENT_LIFE, isCapture = false) => {
    const element: Element = _element;
    const eventListener = (event) => {
        if (excludeElement && (excludeElement.contains(event.target) || excludeElement === event.target)) {
            return;
        }
        if (nativeElement.contains(event.target)) {
            if ($(event.target).is('input') && !isDropDownDisplayEnabledOnInput) {
                return;
            }
            element.removeEventListener(eventType, eventListener, isCapture);
            return;
        }
        if (life === EVENT_LIFE.ONCE) {
            element.removeEventListener(eventType, eventListener, isCapture);
        }
        successCB();
    };
    element.addEventListener(eventType, eventListener, isCapture);
    const removeEventListener = () => {
        element.removeEventListener(eventType, eventListener, isCapture);
    };
    return removeEventListener;
};

/**
 * Returns a deep cloned replica of the passed object/array
 * @param object object/array to clone
 * @returns a clone of the passed object
 */
export const getClonedObject = (object) => {
    return _.cloneDeep(object);
};

export const getFiles = (formName, fieldName, isList) => {
    const files = _.get(document.forms, [formName, fieldName, 'files']);
    return isList ? _.map(files, _.identity) : files && files[0];
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
export const validateAccessRoles = (roleExp, loggedInUser) => {
    let roles;

    if (roleExp && loggedInUser) {

        roles = roleExp && roleExp.split(',').map(Function.prototype.call, String.prototype.trim);

        return _.intersection(roles, loggedInUser.userRoles).length;
    }

    return true;
};

export const getValidJSON = (content) => {
    if (!content) {
        return undefined;
    }
    try {
        const parsedIntValue = parseInt(content, 10);
        /*obtaining json from editor content string*/
        return isObject(content) || !isNaN(parsedIntValue) ? content : JSON.parse(content);
    } catch (e) {
        /*terminating execution if new variable object is not valid json.*/
        return undefined;
    }
};

export const xmlToJson = (xmlString) => {
    const x2jsObj = new X2JS({ 'emptyNodeForm': 'content', 'attributePrefix': '', 'enableToStringFunc': false });
    let json = x2jsObj.xml2js(xmlString);
    if (json) {
        json = _.get(json, Object.keys(json)[0]);
    }
    return json;
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
        return _.get(obj, key);
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
            keys.push({ 'key': subPart, 'value': subParts.length ? [] : {} }); // determine whether to create an array or an object
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
        return DataType.STRING;
    }
    type = typeRef && typeRef.substring(typeRef.lastIndexOf('.') + 1);
    type = type && type.toLowerCase();
    type = type === DataType.LOCALDATETIME ? DataType.DATETIME : type;
    return type;
};

/* returns true if the provided data type matches number type */
export const isNumberType = (type: any): boolean => {
    return (NUMBER_TYPES.indexOf(extractType(type).toLowerCase()) !== -1);
};

/* function to check if provided object is empty*/
export const isEmptyObject = (obj: any): boolean => {
    if (isObject(obj) && !_.isArray(obj)) {
        return Object.keys(obj).length === 0;
    }
    return false;
};

/*Function to check whether the specified object is a pageable object or not.*/
export const isPageable = (obj: any): boolean => {
    const pageable = {
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
    return (_.isEqual(_.keys(pageable), _.keys(obj).sort()));
};

/*
 * Util method to replace patterns in string with object keys or array values
 * Examples:
 * Utils.replace('Hello, ${first} ${last} !', {first: 'wavemaker', last: 'ng'}) --> Hello, wavemaker ng
 * Utils.replace('Hello, ${0} ${1} !', ['wavemaker','ng']) --> Hello, wavemaker ng
 * Examples if parseError is true:
 * Utils.replace('Hello, {0} {1} !', ['wavemaker','ng']) --> Hello, wavemaker ng
 */
export const replace = (template, map, parseError?: boolean) => {
    let regEx = REGEX.REPLACE_PATTERN;
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

/*Function to check if date time type*/
export const isDateTimeType = type => {
    if (_.includes(type, '.')) {
        type = _.toLower(extractType(type));
    }
    return _.includes([DataType.DATE, DataType.TIME, DataType.TIMESTAMP, DataType.DATETIME, DataType.LOCALDATETIME], type);
};

const momentPattern = (pattern) => {
    if (_.includes(pattern, 'E')) {
       pattern =  _.replace(pattern, /E[,]?/g, '');
    }
    return _.replace(pattern, /y*d*/g, (val) => val.toUpperCase());
};

/*  This function returns date object. If val is undefined it returns invalid date */
export const getValidDateObject = (val, options?) => {
   const defaultMeridian = ['AM', 'PM'];
   const momentMeridian = moment()._locale.meridiem();
    // Updating localized meridians with default meridians when moment meridian is not defined
    if (options && options.meridians && _.includes(defaultMeridian, momentMeridian)) {
        _.forEach(options.meridians, (meridian, index) => {
            if (_.includes(val, meridian)) {
                val = val.replace(meridian, defaultMeridian[index]);
            }
        });
    }
    // Handling localization
    if (options && options.pattern && options.pattern !== 'timestamp') {
        const pattern = momentPattern(options.pattern);
        val = moment(val, pattern).toDate();
    }

    if (moment(val).isValid()) {
        // date with +5 hours is returned in safari browser which is not a valid date.
        // Hence converting the date to the supported format "YYYY/MM/DD HH:mm:ss" in IOS
        if (isIos()) {
            val = moment(moment(val).valueOf()).format('YYYY/MM/DD HH:mm:ss');
        }
        return val;
    }
    /*if the value is a timestamp string, convert it to a number*/
    if (!isNaN(val)) {
        val = parseInt(val, 10);
    } else {
        /*if the value is in HH:mm:ss format, it returns a wrong date. So append the date to the given value to get date*/
        if (!(new Date(val).getTime())) {
            val = moment((moment().format('YYYY-MM-DD') + ' ' + val), 'YYYY-MM-DD HH:mm:ss A');

        }
    }
    return new Date(moment(val).valueOf());
};

/*  This function returns javascript date object*/
export const getNativeDateObject = (val, options?) => {
    val = getValidDateObject(val, options);
    return new Date(val);
};


/**
 * prepare a blob object based on the content and content type provided
 * if content is blob itself, simply returns it back
 * @param val
 * @param valContentType
 * @returns {*}
 */
export const getBlob = (val, valContentType?) => {
    if (val instanceof Blob) {
        return val;
    }
    const jsonVal = getValidJSON(val);
    if (jsonVal && jsonVal instanceof Object) {
        val = new Blob([JSON.stringify(jsonVal)], { type: valContentType || 'application/json' });
    } else {
        val = new Blob([val], { type: valContentType || 'text/plain' });
    }
    return val;
};

/**
 * This function returns true by comparing two objects based on the fields
 * @param obj1 object
 * @param obj2 object
 * @param compareBy string field values to compare
 * @returns {boolean} true if object equality returns true based on fields
 */
export const isEqualWithFields = (obj1, obj2, compareBy) => {
    // compareBy can be 'id' or 'id1, id2' or 'id1, id2:id3'
    // Split the compareby comma separated values
    let _compareBy = _.isArray(compareBy) ? compareBy : _.split(compareBy, ',');

    _compareBy = _.map(_compareBy, _.trim);

    return _.isEqualWith(obj1, obj2, function (o1, o2) {
        return _.every(_compareBy, function (cb) {
            let cb1, cb2, _cb;

            // If compareby contains : , compare the values by the keys on either side of :
            if (_.indexOf(cb, compareBySeparator) === -1) {
                cb1 = cb2 = _.trim(cb);
            } else {
                _cb = _.split(cb, compareBySeparator);
                cb1 = _.trim(_cb[0]);
                cb2 = _.trim(_cb[1]);
            }

            return _.get(o1, cb1) === _.get(o2, cb2);
        });
    });
};

const getNode = selector => document.querySelector(selector);

// function to check if the stylesheet is already loaded
const isStyleSheetLoaded = href => !!getNode(`link[href="${href}"]`);

// function to remove stylesheet if the stylesheet is already loaded
const removeStyleSheet = href => {
    const node = getNode(`link[href="${href}"]`);
    if (node) {
        node.remove();
    }
};

// function to load a stylesheet
export const loadStyleSheet = (url, attr) => {
    if (isStyleSheetLoaded(url)) {
        return;
    }
    const link = document.createElement('link');
    link.href = url;
    // To add attributes to link tag
    if (attr && attr.name) {
        link.setAttribute(attr.name, attr.value);
    }
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    document.head.appendChild(link);
    return link;
};

// function to load stylesheets
export const loadStyleSheets = (urls = []) => {
    // if the first argument is not an array, convert it to an array
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    urls.forEach(loadStyleSheet);
};

// function to check if the script is already loaded
const isScriptLoaded = src => !!getNode(`script[src="${src}"], script[data-src="${src}"]`);

export const loadScript = async url => {
    const _url = url.trim();
    if (!_url.length || isScriptLoaded(_url)) {
        return Promise.resolve();
    }

    return fetchContent('text', _url, false, text => {
        const script = document.createElement('script');
        script.textContent = text;
        document.head.appendChild(script);
    });

    // return fetch(_url)
    //     .then(response => response.text())
    //     .then(text => {
    //         const script = document.createElement('script');
    //         script.textContent = text;
    //         document.head.appendChild(script);
    //     });
};

export const loadScripts = async (urls = []) => {
    for (const url of urls) {
        await loadScript(url);
    }
    return Promise.resolve();
};

export let _WM_APP_PROJECT: any = {};

/**
 * This function sets session storage item based on the project ID
 * @param key string
 * @param value string
 */
export const setSessionStorageItem = (key, value) => {
    let item: any = window.sessionStorage.getItem(_WM_APP_PROJECT.id);

    if (item) {
        item = JSON.parse(item);
    } else {
        item = {};
    }
    item[key] = value;

    window.sessionStorage.setItem(_WM_APP_PROJECT.id, JSON.stringify(item));
};

/**
 * This function gets session storage item based on the project ID
 * @param key string
 */
export const getSessionStorageItem = key => {
    let item = window.sessionStorage.getItem(_WM_APP_PROJECT.id);

    if (item) {
        item = JSON.parse(item);
        return item[key];
    }
};

export const noop = (...args) => { };

export const isArray = v => _.isArray(v);

export const isString = v => typeof v === 'string';

export const isNumber = v => typeof v === 'number';

/**
 * This function returns a blob object from the given file path
 * @param filepath
 * @returns promise having blob object
 */
export const convertToBlob = (filepath): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        // Read the file entry from the file URL
        resolveLocalFileSystemURL(filepath, function (fileEntry) {
            fileEntry.file(function (file) {
                // file has the cordova file structure. To submit to the backend, convert this file to javascript file
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imgBlob = new Blob([reader.result], {
                        'type': file.type
                    });
                    resolve({ 'blob': imgBlob, 'filepath': filepath });
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        }, reject);
    });
};

export const hasCordova = () => {
    return !!window['cordova'];
};

export const isSpotcues = /Spotcues/i.test(window['navigator'].userAgent);

export const AppConstants = {
    INT_MAX_VALUE: 2147483647
};

export const openLink = (link: string, target: string = '_self') => {
    if (hasCordova() && _.startsWith(link, '#')) {
        location.hash = link;
    } else {
        window.open(link, target);
    }
};


/* util function to load the content from a url */
export const fetchContent = (dataType, url: string, inSync: boolean = false, success?, error?): Promise<any> => {
    return $.ajax({ type: 'get', dataType: dataType, url: url, async: !inSync })
        .done(response => success && success(response))
        .fail(reason => error && error(reason));
};

/**
 * If the given object is a promise, then object is returned. Otherwise, a promise is resolved with the given object.
 * @param {Promise<T> | T} a
 * @returns {Promise<T>}
 */
export const toPromise = <T>(a: T | Promise<T>): Promise<T> => {
    if (a instanceof Promise) {
        return a;
    } else {
        return Promise.resolve(a as T);
    }
};

/**
 * This function invokes the given the function (fn) until the function successfully executes or the maximum number
 * of retries is reached or onBeforeRetry returns false.
 *
 * @param fn - a function that is needs to be invoked. The function can also return a promise as well.
 * @param interval - minimum time gap between successive retries. This argument should be greater or equal to 0.
 * @param maxRetries - maximum number of retries. This argument should be greater than 0. For all other values,
 * maxRetries is infinity.
 * @param onBeforeRetry - a callback function that will be invoked before re-invoking again. This function can
 * return false or a promise that is resolved to false to stop further retry attempts.
 * @returns {*} a promise that is resolved when fn is success (or) maximum retry attempts reached
 * (or) onBeforeRetry returned false.
 */
export const retryIfFails = (fn: () => any, interval: number, maxRetries: number, onBeforeRetry = () => Promise.resolve(false)) => {
    let retryCount = 0;
    const tryFn = () => {
        retryCount++;
        if (_.isFunction(fn)) {
            return fn();
        }
    };
    maxRetries = (_.isNumber(maxRetries) && maxRetries > 0 ? maxRetries : 0);
    interval = (_.isNumber(interval) && interval > 0 ? interval : 0);
    return new Promise((resolve, reject) => {
        const errorFn = function () {
            const errArgs = arguments;
            setTimeout(() => {
                toPromise<boolean>(onBeforeRetry()).then(function (retry) {
                    if (retry !== false && (!maxRetries || retryCount <= maxRetries)) {
                        toPromise(tryFn()).then(resolve, errorFn);
                    } else {
                        reject(errArgs);
                    }
                }, () => reject(errArgs));
            }, interval);
        };
        toPromise(tryFn()).then(resolve, errorFn);
    });
};

/**
 * Promise of a defer created using this function, has abort function that will reject the defer when called.
 * @returns {*} angular defer object
 */
export const getAbortableDefer = () => {
    const _defer: any = {
        promise: null,
        reject: null,
        resolve: null,
        onAbort: () => { },
        isAborted: false
    };
    _defer.promise = new Promise((resolve, reject) => {
        _defer.resolve = resolve;
        _defer.reject = reject;
    });
    _defer.promise.abort = () => {
        triggerFn(_defer.onAbort);
        _defer.reject('aborted');
        _defer.isAborted = true;
    };
    return _defer;
};

export const createCSSRule = (ruleSelector: string, rules: string) => {
    const stylesheet = document.styleSheets[0];
    stylesheet.insertRule(`${ruleSelector} { ${rules} }`);
};

export const getUrlParams = (link) => {
    const params = {};
    // If url params are present, construct params object and pass it to search
    const index = link.indexOf('?');
    if (index !== -1) {
        const queryParams = _.split(link.substring(index + 1, link.length), '&');
        queryParams.forEach((param) => {
            param = _.split(param, '=');
            params[param[0]] = param[1];
        });
    }
    return params;
};

export const getRouteNameFromLink = (link) => {
    link = link.replace('#/', '/');
    const index = link.indexOf('?');
    if (index !== -1) {
        link = link.substring(0, index);
    }
    return link;
};

export const isAppleProduct = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

export const defer = () => {
    const d = {
        promise: null,
        resolve: noop,
        reject: noop
    };
    d.promise = new Promise((resolve, reject) => {
        d.resolve = resolve;
        d.reject = reject;
    });
    return d;
};

/*
 * Invokes the given list of functions sequentially with the given arguments. If a function returns a promise,
 * then next function will be invoked only if the promise is resolved.
 */
export const executePromiseChain = (fns, args, d?, i?) => {
    d = d || defer();
    i = i || 0;
    if (i === 0) {
        fns = _.filter(fns, function (fn) {
            return !(_.isUndefined(fn) || _.isNull(fn));
        });
    }
    if (fns && i < fns.length) {
        try {
            toPromise(fns[i].apply(undefined, args))
                .then(() => executePromiseChain(fns, args, d, i + 1), d.reject);
        } catch (e) {
            d.reject(e);
        }
    } else {
        d.resolve();
    }
    return d.promise;
};

/**
 * This function accepts two data sources and will check if both are same by comparing the unique id and
 * context in which datasources are present
 * @returns {*} boolean true/ false
 */
export const isDataSourceEqual = (d1, d2) => {
    return d1.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) === d2.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) &&
        _.isEqual(d1.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER), d2.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER));
};

/**
 * checks if the passed datasource context matches with passed context
 * @param ds, datasource having a context
 * @param ctx, context to compare with
 * @returns {boolean}
 */
export const validateDataSourceCtx = (ds, ctx) => {
    return ds.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER) === ctx;
};

/**
 * This traverses the filterexpressions object recursively and process the bind string if any in the object
 * @param variable variable object
 * @param name name of the variable
 * @param context scope of the variable
 */
export const processFilterExpBindNode = (context, filterExpressions) => {
    const destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
    const filter$ = new Subject();

    const bindFilExpObj = (obj, targetNodeKey) => {
        if (stringStartsWith(obj[targetNodeKey], 'bind:')) {
            destroyFn(
                $watch(obj[targetNodeKey].replace('bind:', ''), context, {}, (newVal, oldVal) => {
                    if ((newVal === oldVal && _.isUndefined(newVal)) || (_.isUndefined(newVal) && !_.isUndefined(oldVal))) {
                        return;
                    }
                    // Skip cloning for blob column
                    if (!_.includes(['blob', 'file'], obj.type)) {
                        newVal = getClonedObject(newVal);
                    }
                    // backward compatibility: where we are allowing the user to bind complete object
                    if (obj.target === 'dataBinding') {
                        // remove the existing databinding element
                        filterExpressions.rules = [];
                        // now add all the returned values
                        _.forEach(newVal, function (value, target) {
                            filterExpressions.rules.push({
                                'target': target,
                                'value': value,
                                'matchMode': obj.matchMode || 'startignorecase',
                                'required': false,
                                'type': ''
                            });
                        });
                    } else {
                        // setting value to the root node
                        obj[targetNodeKey] = newVal;
                    }
                    filter$.next({ filterExpressions, newVal });
                }, undefined, false, { arrayType: _.includes(['in', 'notin'], obj.matchMode) })
            );
        }
    };

    const traverseFilterExpressions = expressions => {
        if (expressions.rules) {
            _.forEach(expressions.rules, (filExpObj, i) => {
                if (filExpObj.rules) {
                    traverseFilterExpressions(filExpObj);
                } else {
                    if (filExpObj.matchMode === 'between') {
                        bindFilExpObj(filExpObj, 'secondvalue');
                    }
                    bindFilExpObj(filExpObj, 'value');
                }
            });
        }
    };
    traverseFilterExpressions(filterExpressions);

    return filter$;
};

// This method will set the given proto on the target
export const extendProto = (target, proto) => {
    let _proto = Object.getPrototypeOf(target);
    while (Object.getPrototypeOf(_proto).constructor !== Object) {
        _proto = Object.getPrototypeOf(_proto);
        // return if the prototype of created component and prototype of context are same
        if (proto === _proto) {
            return;
        }
    }
    Object.setPrototypeOf(_proto, proto);
};

export const removeExtraSlashes = function (url) {
    const base64regex = /^data:image\/([a-z]{2,});base64,/;
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

$.cachedScript = (() => {
    const inProgress = new Map();
    const resolved = new Set();

    const isInProgress = url => inProgress.has(url);
    const isResolved = url => resolved.has(url);
    const onLoad = url => {
        resolved.add(url);
        inProgress.get(url).resolve();
        inProgress.delete(url);
    };

    const setInProgress = url => {
        let resFn;
        let rejFn;
        const promise: any = new Promise((res, rej) => {
            resFn = res;
            rejFn = rej;
        });

        promise.resolve = resFn;
        promise.reject = rejFn;

        inProgress.set(url, promise);
    };

    return function (url) {
        if (isResolved(url)) {
            return Promise.resolve();
        }

        if (isInProgress(url)) {
            return inProgress.get(url);
        }

        setInProgress(url);

        const options = {
            dataType: 'script',
            cache: true,
            url
        };

        $.ajax(options).done(() => onLoad(url));

        return inProgress.get(url);
    };
})();

const DEFAULT_DISPLAY_FORMATS = {
    DATE: 'yyyy-MM-dd',
    TIME: 'hh:mm a',
    TIMESTAMP: 'yyyy-MM-dd hh:mm:ss a',
    DATETIME: 'yyyy-MM-dd hh:mm:ss a',
};
// This method returns the display date format for given type
export const getDisplayDateTimeFormat = type => {
    return DEFAULT_DISPLAY_FORMATS[_.toUpper(type)];
};

// Generate for attribute on label and ID on input element, so that label elements are associated to form controls
export const addForIdAttributes = (element: HTMLElement) => {
    const labelEl = element.querySelectorAll('label.control-label');
    let inputEl = element.querySelectorAll('[focus-target]');
    if (!inputEl.length) {
        inputEl = element.querySelectorAll('input, select, textarea');
    }
    /*if there are only one input el and label El add id and for attribute*/
    if (labelEl.length && inputEl.length) {
        const widgetId = $(inputEl[0] as HTMLElement).closest('[widget-id]').attr('widget-id');
        if (widgetId) {
            setAttr(inputEl[0] as HTMLElement, 'id', widgetId);
            setAttr(labelEl[0] as HTMLElement, 'for', widgetId);
        }
    }
};

/**
 * This method is used to adjust the container position
 * For example: 1. When datepicker control placed closed to the screen left edges, it is going to negative values which is  cutting the container.
 * To Fix the container overlapping issue changing the contrainer left translation to 0
 * @param containerElem - picker/dropdown container element(jquery)
 * @param parentElem - widget native element
 * @param ref - scope of particular library directive
 * @param ele - Child element(jquery). For some of the widgets(time, search) containerElem doesn't have height. The inner element(dropdown-menu) has height so passing it as optional.
 */
export const adjustContainerPosition = (containerElem, parentElem, ref, ele?) => {
    const zoneRef = ref._ngZone || ref.ngZone;
    zoneRef.onStable.subscribe(() => {
        const containerEleTransformations = getWebkitTraslationMatrix(containerElem);
        if (containerEleTransformations.m41 < 0) {
             containerEleTransformations.m41 = 0;
         }else{
             return;
         }
         setTranslation3dPosition(containerElem, containerEleTransformations);
     });
   };


/**
 * This method is used to adjust the container position
 * For example: 1. When datepicker control placed closed to the screen right edges, it is going to out of the viewport values which is  cutting the container.
 * @param containerElem  picker/dropdown container element(jquery)
 * @param parentElem widget native element
 * @param ref  scope of particular library directive
 * @param ele Child element(jquery). For some of the widgets(time, search) containerElem doesn't have height. The inner element(dropdown-menu) has height so passing it as optional.
 */
   export const adjustContainerRightEdges = (containerElem, parentElem, ref, ele?) => {
        const containerWidth = ele ? _.parseInt(ele.css('width')) : _.parseInt(containerElem.css('width'));
        const viewPortWidth = $(window).width() + window.scrollX;
        const parentDimesion = parentElem.getBoundingClientRect();
        const parentRight = parentDimesion.right + window.scrollX;
        let newLeft;
        const zoneRef = ref._ngZone || ref.ngZone;
        zoneRef.onStable.subscribe(() => {
            const containerEleTransformations = getWebkitTraslationMatrix(containerElem);

            if (viewPortWidth - (parentRight + parentDimesion.width) < containerWidth) {
                newLeft = parentRight - containerWidth;
                if(newLeft <0){
                    newLeft = 0;
                }
                containerEleTransformations.m41 = newLeft;
            }else{
                return;
            }
            setTranslation3dPosition(containerElem, containerEleTransformations);
        });
   }

  /**
   * For given element set the traslation
   * @param containerElem tanslated element
   *
   * @param containerEleTransformations translate matrix positions
   */
   export const setTranslation3dPosition = (containerElem, containerEleTransformations) => {
        const translatePosition = "translate3d(" + containerEleTransformations.m41 + "px, " + containerEleTransformations.m42 + "px, 0px)";
        containerElem[0].style.webkitTransform = translatePosition;
        containerElem[0].style.MozTransform = translatePosition;
        containerElem[0].style.msTransform = translatePosition;
        containerElem[0].style.OTransform = translatePosition;
        containerElem[0].style.transform = translatePosition;
   }

   /**
    *
    * @param containerElem elemet for the WebKitCSSMatrix
    */
   export const getWebkitTraslationMatrix = (containerElem) => {
     return  new WebKitCSSMatrix(window.getComputedStyle(containerElem[0]).webkitTransform)
   }

// close all the popovers.
export const closePopover = (element) => {
    if (!element.closest('.app-popover').length) {
        const popoverElements = document.querySelectorAll('.app-popover-wrapper');
        _.forEach(popoverElements, (ele) => {
            if (ele.widget.isOpen) {
                ele.widget.isOpen = false;
            }
        });
    }
};

/**
 * This method is to trigger change detection in the app
 * This is exposed for the end user developer of WM app
 * This is the alternative for $rs.$safeApply() in AngularJS
 * See $appDigest in utils for more info
 */
export const detectChanges = $appDigest;

/**
 * This method is to trigger the action/link of menu/nav item
 * @param scope - scope of the widget
 * @param item - item object
 */
export const triggerItemAction = (scope, item) => {
    let itemLink = item.link;
    const itemAction = item.action;
    const linkTarget = item.target;
    if (itemAction) {
        if (!scope.itemActionFn) {
            scope.itemActionFn = $parseEvent(itemAction);
        }

        scope.itemActionFn(scope.userDefinedExecutionContext, Object.create(item));
    }
    if (itemLink) {
        if (itemLink.startsWith('#/') && (!linkTarget || linkTarget === '_self')) {
            const queryParams = getUrlParams(itemLink);
            itemLink = getRouteNameFromLink(itemLink);
            const router = _.get(scope, 'route') || _.get(scope, 'menuRef.route');
            router.navigate([itemLink], { queryParams });
        } else {
            openLink(itemLink, linkTarget);
        }
    }
};

/**
 * This method is to get datsource from the expression
 * @param expr - expression of the dataset
 * @param scope - scope of the widget
 * Example1: expr - "Variables.staticVar1.dataSet.details[$i].addresses" then the method will return datasource as Variables.staticVar1
 * Example2: expr - "Widgets.list1.currentItem.addresses" and list1 is bound to "Variables.staticVar1.dataSet.details" then the method will return datasource as Variables.staticVar1
 */
export const getDatasourceFromExpr = (expr, scope) => {
    const isBoundToVariable = _.startsWith(expr, 'Variables.');
    const isBoundToWidget = _.startsWith(expr, 'Widgets.');
    const parts = expr.split('.');
    if (isBoundToVariable) {
        return _.get(scope.viewParent.Variables, parts[1]);
    }
    if (isBoundToWidget) {
        const widgetScope = _.get(scope.viewParent.Widgets, parts[1]);
        const widgetDatasetBoundExpr = widgetScope.$attrs.get('datasetboundexpr');
        let widgetBoundExpression;
        widgetBoundExpression = (!widgetScope.datasource && widgetDatasetBoundExpr) ? widgetDatasetBoundExpr : widgetScope.binddataset;
        return getDatasourceFromExpr(widgetBoundExpression, widgetScope);
    }
};

/**
 * This method is to get dataset bound expression from list currentitem expression
 * @param expr - bound dataset expression
 * @param scope - scope of the widget
 * Example1: expr - "Widgets.list1.currentItem.details" and list1 is bound to "Variables.staticVar1.dataSet" then it returns expression as "Variables.staticVar1.dataSet[$i].details"
 */
export const extractCurrentItemExpr = (expr, scope) => {
    const currentItemRegEx = /^Widgets\..*\.currentItem/g;
    if (currentItemRegEx.test(expr)) {
        const parts = expr.split('.');
        const widgetScope = _.get(scope.viewParent.Widgets, parts[1]);
        const widgetDatasetBoundExpr = widgetScope.$attrs.get('datasetboundexpr');
        if (!widgetScope.datasource && widgetDatasetBoundExpr) {
            expr = expr.replace(/^Widgets\..*\.currentItem/g, `${widgetDatasetBoundExpr}[$i]`);
            return extractCurrentItemExpr(expr, scope);
        } else {
            expr = expr.replace(/^Widgets\..*\.currentItem/g, `${widgetScope.binddataset}[$i]`);
        }
    }
    return expr;
};

// this will add the html tag to the widget to scope the css to the page.
export const findRootContainer = ($el) => {
    let root = $el.closest('.app-prefab');
    if (!root.length) {
        root = $el.closest('.app-partial');
    }
    if (!root.length) {
        root = $el.closest('.app-page');
    }
    return root.length && root.parent()[0].tagName;
};

export const VALIDATOR = {
    REQUIRED: 'required',
    MAXCHARS: 'maxchars',
    MINVALUE: 'minvalue',
    MAXVALUE: 'maxvalue',
    REGEXP: 'regexp',
    MINDATE: 'mindate',
    MAXDATE: 'maxdate',
    MINTIME: 'mintime',
    MAXTIME: 'maxtime',
    EXCLUDEDATES: 'excludedates',
    EXCLUDEDAYS: 'excludedays'
};

export const transformFileURI = (url) => {
    if(url && hasCordova() && isIos() && url.startsWith('file://')) {
        return url.replace('file://', 'http://' + location.host + '/local-filesystem');
    }
    return url;
};
