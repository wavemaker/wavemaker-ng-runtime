import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';

import {encodeUrl, getEvaluatedExprValue, isImageFile, isValidWebURL, stringStartsWith, FormWidgetType, $parseExpr} from '@wm/core';
import { DialogRef, WidgetRef } from '../widgets/framework/types';

declare const _;

const DATASET_WIDGETS = new Set([FormWidgetType.SELECT, FormWidgetType.CHECKBOXSET, FormWidgetType.RADIOSET,
    FormWidgetType.SWITCH, FormWidgetType.AUTOCOMPLETE, FormWidgetType.CHIPS, FormWidgetType.TYPEAHEAD, FormWidgetType.RATING]);
/**
 * Returns the parsed, updated bound expression
 * if the expression is $[data[$i][firstName]] + '--' + $[lastName] + '--' + $['@ID@']
 * returns __1.firstName + '--' + lastName + '--' + __1['@ID@']
 */
const getUpdatedExpr = (expr: string) => {
    let updated = '', ch, next, i, j, matchCh, matchCount, isQuotedStr, subStr, isQuotedStrEvaluated;

    expr = expr.replace(/\$\[data\[\$i\]/g, '$[__1');

    for (i = 0; i < expr.length; i++) {
        ch = expr[i];
        next = expr[i + 1];

        /**
         * if the expression starts with $[, check the next(ch) character,
         *    if ch is a quote(', ") change the expr to __[
         *    if ch is a whiteSpace, remove it
         *    else remove $[
         */
        if (ch === '$' && next === '[') {
            matchCount = 1;
            subStr = '';
            isQuotedStrEvaluated = false;
            isQuotedStr = false;

            for (j = i + 2; j < expr.length; j++) {

                matchCh = expr[j];

                if (matchCh === ' ') {
                    continue;
                }

                if (!isQuotedStrEvaluated) {
                    isQuotedStr = expr[j] === '"' || expr[j] === '\'';
                    isQuotedStrEvaluated = true;
                }

                if (matchCh === '[') {
                    matchCount++;
                } else if (matchCh === ']') {
                    matchCount--;
                }

                if (!matchCount) {
                    subStr = expr.substring(i + 2, j);
                    if (isQuotedStr) {
                        updated += '__1[' + subStr + ']';
                    } else {
                        updated += subStr;
                    }

                    break;
                }
            }
            i = j;
        } else {
            updated += ch;
        }
    }

    return updated;
};

/**
 * Returns the value for the provided key in the object
 */
export const getObjValueByKey = (obj: any, strKey: string) => {
    /* check for the key-string */
    if (strKey) {
        let val;
        /* convert indexes to properties, so as to work for even 'key1[0].child1'*/
        strKey.replace(/\[(\w+)\]/g, '.$1').split('.').forEach(function (key) {
            // If obj is null, then assign val to null.
            val = (val && val[key]) || (_.isNull(obj) ? obj : obj[key]);
        });
        return val;
    }
    return obj;
};

/**
 * returns the display field data for any dataset widgets
 * Based on the bind display expression or display expression or display name,
 * data is extracted and formatted from the passed option object
 * If there is field is specified, field value is obtained from the dataObj.
 * If expression is given, evaluates the expression value.
 * else check for bindExpression, extract the value from the dataObj
 */
export const getEvaluatedData = (dataObj: any, options: any) => {
    let expressionValue;
    const field = options.field,
        expr = options.expression,
        bindExpr = options.bindExpression;

    // if key is bound expression
    if (bindExpr) {
        // remove 'bind:' prefix from the boundExpressionName
        expressionValue = bindExpr.replace('bind:', '');
        // parse the expressionValue for replacing all the expressions with values in the object
        expressionValue = getUpdatedExpr(expressionValue);
    } else {
        expressionValue = field ? field : expr;
    }

    return $parseExpr(expressionValue)(dataObj, {__1: dataObj});
};

export const isActiveNavItem = (link, routeName) => {
    if (!link || !routeName) {
        return false;
    }
    const routeRegex = new RegExp('^(#\/|#)' + routeName + '$');
    link = link.indexOf('?') === -1 ? link : link.substring(0, link.indexOf('?'));
    return routeRegex.test(link);
};


/**
 * Returns the orderBy Expression based on the 'sort 'option in pageable object
 * returned by backend
 * @param pageableObj
 * @returns {string}
 */
export const getOrderByExpr = pageableObj => {
    pageableObj = pageableObj || [];
    const expressions       = [],
        KEY_VAL_SEPARATOR = ' ',
        FIELD_SEPARATOR   = ',';
    _.forEach(pageableObj, function (obj) {
        expressions.push(obj.property + KEY_VAL_SEPARATOR + obj.direction.toLowerCase());
    });

    return _.join(expressions, FIELD_SEPARATOR);
};

export const isDataSetWidget = widget => {
    return DATASET_WIDGETS.has(widget);
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

/*This method returns the url to the backgroundImage*/
export const getBackGroundImageUrl = (urlString) => {
    if (urlString === '' || urlString === 'none') {
        return urlString;
    }
    return 'url(' + getImageUrl(urlString) + ')';
};

export const provideAs = (reference: any, key: any, multi?: boolean) => {
    return  {
        provide: key,
        useExisting: forwardRef(() => reference),
        multi: multi
    };
};

export const provideAsNgValueAccessor = (reference: any) => {
    return provideAs(reference, NG_VALUE_ACCESSOR, true);
};

export const provideAsWidgetRef = (reference: any) => {
    return provideAs(reference, WidgetRef);
};

export const provideAsDialogRef = (reference: any) => {
    return provideAs(reference, DialogRef);
};

export const NAVIGATION_TYPE = {
    ADVANCED: 'Advanced',
    BASIC: 'Basic',
    CLASSIC: 'Classic',
    INLINE: 'Inline',
    NONE: 'None',
    ONDEMAND: 'On-Demand',
    PAGER: 'Pager',
    SCROLL: 'Scroll'
};


export const getWatchIdentifier = (...args) => args.join('_');

const matchModeTypesMap = {
    'integer'    : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'big_integer': ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'short'      : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'float'      : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'big_decimal': ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'double'     : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'long'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'byte'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'string'     : ['anywhere', 'start', 'end', 'exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    'character'  : ['exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    'text'       : ['anywhere', 'start', 'end', 'exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    'date'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'time'       : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'timestamp'  : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'datetime'   : ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    'boolean'    : ['exact', 'null', 'isnotnull'],
    'clob'       : [],
    'blob'       : []
};

export const getMatchModeTypesMap = () => {
    return matchModeTypesMap;
};

const matchModeMsgs = {
    'start': 'Starts with',
    'end': 'Ends with',
    'anywhere': 'Contains',
    'exact': 'Is equal to',
    'notequals': 'Is not equal to',
    'lessthan': 'Less than',
    'lessthanequal': 'Less than or equals to',
    'greaterthan': 'Greater than',
    'greaterthanequal': 'Greater than or equals to',
    'null': 'Is null',
    'isnotnull': 'Is not null',
    'empty': 'Is empty',
    'isnotempty': 'Is not empty',
    'nullorempty': 'Is null or empty'
};

export const getMatchModeMsgs = () => {
    return matchModeMsgs;
};