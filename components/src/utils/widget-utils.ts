import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { forwardRef } from '@angular/core';

import { encodeUrl, isValidWebURL, stringStartsWith, FormWidgetType, $parseExpr, getClonedObject, prettifyLabel, initCaps, deHyphenate } from '@wm/core';
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
        strKey.replace(/\[(\w+)\]/g, '.$1').split('.').forEach(key => {
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
export const getEvaluatedData = (dataObj: any, options: any, context?: any) => {
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
        expressionValue = expr ? expr : field;
    }

    return $parseExpr(expressionValue)(context, Object.assign({}, dataObj, {__1: dataObj}));
};

export const isActiveNavItem = (link, routeName) => {
    if (!link || !routeName) {
        return false;
    }
    routeName = routeName.indexOf('?') === -1 ? routeName : routeName.substring(0, routeName.indexOf('?'));
    link = link.indexOf('?') === -1 ? link : link.substring(0, link.indexOf('?'));
    const routeRegex = new RegExp('^(#\/|#)' + routeName + '$');
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
    _.forEach(pageableObj, obj => {
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
    if (!urlString) {
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

const typesMap = {
    number: ['number', 'integer', 'big_integer', 'short', 'float', 'big_decimal', 'double', 'long', 'byte'],
    string: ['string', 'text'],
    character: ['character'],
    date: ['date', 'time',  'timestamp', 'datetime']
};
const modes = {
    number: ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    string: ['anywhereignorecase', 'anywhere', 'startignorecase', 'start', 'endignorecase', 'end', 'exactignorecase', 'exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    character: ['exactignorecase', 'exact', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    date: ['exact', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'notequals', 'isnotnull']
};
const matchModeTypesMap = {
    boolean: ['exact', 'null', 'isnotnull'],
    clob: [],
    blob: []
};
export const getMatchModeTypesMap = (multiMode?) => {
    if (multiMode) {
        modes.number.push('in', 'between');
        modes.date.push('between');
        modes.string.push('in');
        modes.character.push('in');
    }

    _.forEach(typesMap, (types, primType) => {
        _.forEach(types, type => {
            matchModeTypesMap[type] = modes[primType];
        });
    });
    // this is used in filter criteria when the user types the column name manually and where we dont know the type of the column
    matchModeTypesMap['default'] = _.union(modes['number'], modes['string'], modes['character'], modes['date'], modes['date']);
    return matchModeTypesMap;
};

export const getMatchModeMsgs = (appLocale) => {
    return {
        start            : appLocale.LABEL_STARTS_WITH,
        startignorecase  : appLocale.LABEL_STARTS_WITH_IGNORECASE,
        end              : appLocale.LABEL_ENDS_WITH,
        endignorecase    : appLocale.LABEL_ENDS_WITH_IGNORECASE,
        anywhere         : appLocale.LABEL_CONTAINS,
        anywhereignorecase: appLocale.LABEL_CONTAINS_IGNORECASE,
        exact            : appLocale.LABEL_IS_EQUAL_TO,
        exactignorecase  : appLocale.LABEL_IS_EQUAL_TO_IGNORECASE,
        notequals        : appLocale.LABEL_IS_NOT_EQUAL_TO,
        lessthan         : appLocale.LABEL_LESS_THAN,
        lessthanequal    : appLocale.LABEL_LESS_THAN_OR_EQUALS_TO,
        greaterthan      : appLocale.LABEL_GREATER_THAN,
        greaterthanequal : appLocale.LABEL_GREATER_THAN_OR_EQUALS_TO,
        null             : appLocale.LABEL_IS_NULL,
        isnotnull        : appLocale.LABEL_IS_NOT_NULL,
        empty            : appLocale.LABEL_IS_EMPTY,
        isnotempty       : appLocale.LABEL_IS_NOT_EMPTY,
        nullorempty      : appLocale.LABEL_IS_NULL_OR_EMPTY,
        in               : appLocale.LABEL_IN,
        between          : appLocale.LABEL_BETWEEN
    };
};

// Returns array of classes that are evaluated true for given object or array
const getClassesArray = classVal => {
    let classes = [];

    if (_.isArray(classVal)) {
        classVal.forEach(v => {
            classes = classes.concat(getClassesArray(v));
        });
        return classes;
    }
    if (_.isObject(classVal)) {
        _.forEach(classVal, (val, key) => {
            if (val) {
                classes = classes.concat(key.split(' '));
            }
        });
        return classes;
    }
};

export const getConditionalClasses = (nv, ov?) => {
    let toAdd;
    let toRemove;
    if (_.isObject(nv)) {
        toAdd = _.isArray(nv) ? nv : getClassesArray(nv || []);
        toRemove = ov ? (_.isArray(ov) ? ov : getClassesArray(ov)) : [];
    } else {
        toAdd = nv ? [nv] : [];
        toRemove = ov ? [ov] : [];
    }
    return {toAdd, toRemove};
};

/*helper function for prepareFieldDefs*/
const pushFieldDef = (dataObject, columnDefObj, namePrefix, options) => {
    /*loop over the fields in the dataObject to process them*/
    let modifiedTitle,
        relatedTable,
        relatedField,
        relatedInfo,
        fieldName,
        isRelated;
    if (!options) {
        options = {};
    }
    _.forEach(dataObject, (value, title) => {
        if (_.includes(title, '.')) {
            relatedInfo  = _.split(title, '.');
            relatedTable = relatedInfo[0];
            relatedField = relatedInfo[1];
            isRelated    = true;
        }
        if (options.noModifyTitle) {
            modifiedTitle = title;
        } else {
            if (_.isString(title)) {
                modifiedTitle = prettifyLabel(title);
                modifiedTitle = deHyphenate(modifiedTitle);
                modifiedTitle = namePrefix ? initCaps(namePrefix) + ' ' + modifiedTitle : modifiedTitle;
            } else {
                modifiedTitle = title;
            }
        }
        title = namePrefix ? namePrefix + '.' + title : title;
        if (isRelated) {
            // For related columns, shorten the title to last two words
            fieldName = _.split(modifiedTitle, ' ');
            fieldName = fieldName.length > 1 ? fieldName[fieldName.length - 2] + ' ' + fieldName[fieldName.length - 1] : fieldName[0];
        } else {
            fieldName = modifiedTitle;
        }
        const defObj = options.setBindingField ? {'displayName': fieldName, 'field': title, 'relatedTable': relatedTable, 'relatedField': relatedField || modifiedTitle}
        : {'displayName': fieldName, 'relatedTable': relatedTable, 'relatedField': relatedField || modifiedTitle};
        /*if field is a leaf node, push it in the columnDefs*/
        if (!_.isObject(value) || (_.isArray(value) && !value[0])) {
            /*if the column counter has reached upperBound return*/
            if (options.upperBound && options.columnCount === options.upperBound) {
                return;
            }
            columnDefObj.terminals.push(defObj);
            /*increment the column counter*/
            options.columnCount += 1;
        } else {
            /*else field is an object, process it recursively*/
            /* if parent node to be included, include it */
            if (options.columnCount !== options.upperBound) {
                columnDefObj.objects.push(defObj);
            }

            /* if field is an array node, process its first child */
            if (_.isArray(value) && value[0]) {
                pushFieldDef(value[0], columnDefObj, title + '[0]', options);
            } else {
                pushFieldDef(value, columnDefObj, title, options);
            }
        }
    });
};

const getMetaDataFromData = (data) => {
    let dataObject;
    if (_.isArray(data)) {
        if (_.isObject(data[0])) {
            dataObject = getClonedObject(data[0]);
            /*Loop over the object to find out any null values. If any null values are present in the first row, check and assign the values from other row.
             * As column generation is dependent on data, for related fields if first row value is null, columns are not generated.
             * To prevent this, check the data in other rows and generate the columns. New keys from others rows are also added*/
            _.forEach(data, (row, index) => {
                if ((index + 1) >= 10) { // Limit the data search to first 10 records
                    return false;
                }
                _.assignWith(dataObject, row, (objValue, srcValue) => {
                    return (objValue === null || objValue === undefined) ? srcValue : objValue;
                });
            });
        } else {
            dataObject = data[0];
        }
    } else {
        dataObject = data;
    }
    return dataObject;
};

export const prepareFieldDefs = (data, options?) => {
    let dataObject;
    const columnDef = {
            'objects' : [],
            'terminals' : []
        };
    /*if no data provided, initialize default column definitions*/
    if (!data) {
        data = [];
    }
    if (!options) {
        options = {};
    }
    options.setBindingField = true;
    options.columnCount = 0;
    dataObject = getMetaDataFromData(data);
    /*first of the many data objects from grid data*/
    pushFieldDef(dataObject, columnDef, '', options);
    if (!options || (options && !options.filter)) {
        return columnDef.terminals;
    }
    switch (options.filter) {
        case 'all':
            return columnDef;
        case 'objects':
            return columnDef.objects;
        case 'terminals':
            return columnDef.terminals;
    }
    return columnDef;
};