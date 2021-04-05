import { $parseEvent, getClonedObject, getFormattedDate, isDefined, isEqualWithFields } from '@wm/core';

import { getEvaluatedData, getObjValueByKey } from './widget-utils';

import { ALLFIELDS } from './data-utils';
import { ToDatePipe } from '../pipes/custom-pipes';

declare const _, $, moment;

const momentLocale = moment.localeData();
const momentCalendarOptions = getClonedObject(momentLocale._calendar);
const momentCalendarDayOptions = momentLocale._calendarDay || {
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        sameDay: '[Today]',
        sameElse: 'L'
    };
const GROUP_BY_OPTIONS = {
        ALPHABET: 'alphabet',
        WORD: 'word',
        OTHERS: 'Others'
    };
const TIME_ROLLUP_OPTIONS = {
        HOUR: 'hour',
        DAY: 'day',
        WEEK: 'week',
        MONTH: 'month',
        YEAR: 'year'
    };
const ROLLUP_PATTERNS = {
        DAY: 'yyyy-MM-dd',
        WEEK: 'w \'Week\',  yyyy',
        MONTH: 'MMM, yyyy',
        YEAR: 'YYYY',
        HOUR: 'hh:mm a'
    };

/**
 * function to get the ordered dataset based on the given orderby
 */
export const getOrderedDataset = (dataSet: any, orderBy: string, innerItem?) => {
    if (!orderBy) {
        return _.cloneDeep(dataSet);
    }

    // The order by only works when the dataset contains list of objects.
    const items = orderBy.split(','),
        fields = [],
        directions = [];
    items.forEach(obj => {
        const item = obj.split(':');
        fields.push(innerItem ? innerItem + '.' + item[0] : item[0]);
        directions.push(item[1]);
    });
    return _.orderBy(dataSet, fields, directions);
};

/**
 * Returns an array of object, each object contain the DataSetItem whose key, value, label are extracted from object keys.
 */
export const transformDataWithKeys = (dataSet: any) => {
    const data: DataSetItem[] = [];
    // if the dataset is instance of object (not an array) or the first item in the dataset array is an object,
    // then we extract the keys from the object and prepare the dataset items.
    if (_.isObject(dataSet[0]) || (_.isObject(dataSet) && !(dataSet instanceof Array))) {
        // getting keys of the object
        const objectKeys = Object.keys(dataSet[0] || dataSet);
        _.forEach(objectKeys, (objKey, index) => {
            data.push({
                key: objKey,
                label: objKey,
                value: objKey,
                index: index + 1
            });
        });
    }

    return data;
};

// Converts any type of data to array.
export const extractDataAsArray = data => {

    if (_.isUndefined(data) || _.isNull(data) || _.trim(data) === '') {
        return [];
    }

    if (_.isString(data)) {
        data = _.split(data, ',').map(str => str.trim());
    }

    if (!_.isArray(data)) {
        data = [data];
    }

    return data;
};

// This function return always an object containing dataset details.
export const convertDataToObject = dataResult => {
    if (_.isString(dataResult)) {
        dataResult = _.split(dataResult, ',').map(str => str.trim());
    }

    return dataResult;
};

// This function used to check the search type widget
const isSeachWidget = (widgetType) => {
    return widgetType === 'wm-search';
};

// This function is used to set the groupby field for search/autocomplete
const setGroupbyKey = (scope, option, dataSetItem, innerItem) => {
    if (scope && isSeachWidget(scope.widgetType)) {
        if (scope.groupby) {
            scope.groupedData.forEach((val, index) => {
                var element =  _.find(val.data, (test) =>  _.isEqual(test[innerItem], option));
                (dataSetItem as any).groupby = element ?  val.key : !(dataSetItem as any).groupby ? 'Others' : (dataSetItem as any).groupby;
            });
        } else {
            (dataSetItem as any).groupby =  '';
        }
    }
}

/**
 * The first step in datasetItems creation is data transformation:
 *
 * The dataset can contain one of the following formats and each of them to be converted to the given format;
 *
 * 1) The comma separated string..eg: A,B,C => [{ key: 'A', value: 'A'}, { key: 'B', value: 'B'}, { key: 'C', value: 'C'}]
 * 2) The array of values eg: [1,2,3] => [{ key: 1, value: 1}, { key: 2, value: 2}, { key: 3, value: 3}]
 * 3) an object eg: {name: 'A', age: 20} => [ {key: 'name', value: 'A'}, {key: 'age', value: 20}]
 * 4) an array of objects...eg: [ {name: 'A', age: 20}, {name: 'B', age: 20}] ==> returns [{key: _DATAFIELD_, value: _DISPLAYFIELD, label: _DISPLAYVALUE}]
 */
export const transformFormData = (context: any, dataSet: any, myDataField?: string, displayOptions?, startIndex?: number, scope?: any): Array<DataSetItem> => {
    const data = [];
    if (!dataSet) {
        return;
    }
    dataSet = convertDataToObject(dataSet);

    // startIndex is the index of the next new item.
    if (_.isUndefined(startIndex)) {
        startIndex = 1;
    }

    if (_.isString(dataSet)) {
        dataSet = dataSet.split(',').map(str => str.trim());
        dataSet.forEach((option, index) => {
            const dataSetItem = {key: option, value: option, label: (isDefined(option) && option !== null) ? option.toString() : '', index: startIndex + index};
            setGroupbyKey(scope, option, dataSetItem, 'value');
            data.push(dataSetItem);
        });
    } else if (_.isArray(dataSet) && !_.isObject(dataSet[0])) { // array of primitive values only
        dataSet.forEach((option, index) => {
            const dataSetItem = {key: option, value: option, label: (isDefined(option) && option !== null) ? option.toString() : '', index: startIndex + index};
            setGroupbyKey(scope, option, dataSetItem, 'value');
            data.push(dataSetItem);
        });
    } else if (!(dataSet instanceof Array) && _.isObject(dataSet)) {
        const i = 0;
        _.forEach(dataSet, (value, key) => {
            const dataSetItem = {key: _.trim(key), value: key, label: (isDefined(value) && value !== null) ? value.toString() : '', index: startIndex, dataObject: dataSet};
            setGroupbyKey(scope, value, dataSetItem, 'value');
            data.push();
        });
    } else {
        if (!myDataField) { // consider the datafield as 'ALLFIELDS' when datafield is not given.
            myDataField = ALLFIELDS;
        }
        // ordering the data based on groupby field
        if (scope && isSeachWidget(scope.widgetType)) {
            dataSet = _.orderBy(dataSet, (function(fieldDef) {
                var groupKey = _.get(fieldDef, scope && scope.groupby);
                if (groupKey) {
                    return _.toLower(groupKey);
                }
            }));
        }
        dataSet.forEach((option, index) => {
            const key = myDataField === ALLFIELDS ? startIndex + index : getObjValueByKey(option, myDataField);
            // Omit all the items whose datafield (key) is null or undefined.
            if (!_.isUndefined(key) && !_.isNull(key)) {
                const label = getEvaluatedData(option, {
                    field: displayOptions.displayField,
                    expression: displayOptions.displayExpr,
                    bindExpression: displayOptions.bindDisplayExpr
                }, context);
                const dataSetItem = {
                    key: key,
                    label: (isDefined(label) && label !== null) ? label.toString() : '',
                    value: myDataField === ALLFIELDS ? option : key,
                    dataObject: option, // represents the object when datafield is ALLFIELDS. This is used as innerItem while grouping the datasetItems.
                    index: startIndex + index
                };
                if (displayOptions.displayImgSrc || displayOptions.bindDisplayImgSrc) {
                    (dataSetItem as any).imgSrc = getEvaluatedData(option, {
                        expression: displayOptions.displayImgSrc,
                        bindExpression: displayOptions.bindDisplayImgSrc
                    }, context);
                }
                setGroupbyKey(scope, option, dataSetItem, 'dataObject');

                data.push(dataSetItem);
            }
        });
    }
    return data;
};

/**
 * Private method to get the unique objects by the data field
 */
export const getUniqObjsByDataField = (data: Array<DataSetItem>, dataField: string, displayField: string, allowEmptyFields?: boolean) => {
    let uniqData;
    const isAllFields = dataField === ALLFIELDS;

    uniqData = isAllFields ? _.uniqWith(data, _.isEqual) : _.uniqBy(data, 'key');

    if (!displayField || allowEmptyFields) {
        return uniqData;
    }

    // return objects having non empty datafield and display field values.
    return _.filter(uniqData, (obj) => {
        if (isAllFields) {
            return _.trim(obj.label);
        }
        return _.trim(obj.key) && _.trim(obj.label);
    });
};

/**
 * This function sets the selectedItem by comparing the field values, where fields are passed by "compareby" property.
 * works only for datafield with ALL_FIELDS
 * @param datasetItems list of dataset items.
 * @param compareWithDataObj represents the datavalue (object) whose properties are to be checked against each property of datasetItem.
 * @param compareByField specifies the property names on which datasetItem has to be compared against datavalue object.
 */
export const setItemByCompare = (datasetItems: Array<DataSetItem>, compareWithDataObj: Object, compareByField: string) => {
    // compare the fields based on fields given to compareby property.
    _.forEach(datasetItems, opt => {
        if (isEqualWithFields(opt.value, compareWithDataObj, compareByField)) {
            opt.selected = true;
            return false;
        }
    });
};

/**
 * This method returns sorted data based to groupkey.
 * Returns a array of objects, each object containing key which is groupKey and data is the sorted data which is sorted by groupby field in the data.
 *
 * @param groupedLiData, grouped data object with key as the groupKey and its value as the array of objects grouped under the groupKey.
 * @param groupBy, string groupby property
 * @returns {any[]}
 */
const getSortedGroupedData = (groupedLiData: Object, groupBy: string, orderby: string) => {
    const _groupedData = [];
    _.forEach(_.keys(groupedLiData), (groupkey, index) => {
        const liData = getOrderedDataset(groupedLiData[groupkey], orderby, 'dataObject');
        _groupedData.push({
            key: groupkey,
            data: _.sortBy(liData, data => {
                data._groupIndex = index + 1;
                return _.get(data, groupBy) || _.get(data.dataObject, groupBy);
            })
        });
    });
    return _groupedData;
};

/**
 * This method gets the groupedData using groupby property and match and returns the sorted array of objects.
 *
 * @param compRef represents the component's reference i.e. "this" value.
 * @param data represents the dataset i.e array of objects.
 * @param groupby, string groupby property
 * @param match, string match property
 * @param orderby, string orderby property
 * @param dateformat, string dateFormat property
 * @param innerItem, represents the innerItem on which groupby has to be applied. Incase of datasetItems, 'dataObject' contains the full object. Here innerItem is dataObject.
 * @returns {any[]} groupedData, array of objects, each object having key and data.
 */
export const groupData = (compRef: any, data: Array<Object | DataSetItem>, groupby: string, match: string, orderby: string, dateformat: string, datePipe: ToDatePipe, innerItem?: string, AppDefaults?: any) => {
    let groupedLiData = {};
    if (_.includes(groupby, '(')) {
        const groupDataByUserDefinedFn = $parseEvent(groupby);
        groupedLiData = _.groupBy(data, val => {
            return groupDataByUserDefinedFn(compRef.viewParent, {'row': val.dataObject || val});
        });
    } else {
        groupedLiData = getGroupedData(data, groupby, match, orderby, dateformat, datePipe, innerItem, AppDefaults);
    }

    return getSortedGroupedData(groupedLiData, groupby, orderby);
};

/**
 * This method prepares the grouped data.
 *
 * @param fieldDefs array of objects i.e. dataset
 * @param groupby string groupby
 * @param match string match
 * @param orderby string orderby
 * @param dateFormat string date format
 * @param innerItem, item to look for in the passed data
 */
const getGroupedData = (fieldDefs: Array<Object | DataSetItem>, groupby: string, match: string, orderby: string, dateFormat: string, datePipe: ToDatePipe, innerItem?: string, AppDefaults?: any) => {
    // For day, set the relevant moment calendar options
    if (match === TIME_ROLLUP_OPTIONS.DAY) {
        momentLocale._calendar = momentCalendarDayOptions;
    }

    // handling case-in-sensitive scenario
    // ordering the data based on groupby field. If there is innerItem then apply orderby using the innerItem's containing the groupby field.
    fieldDefs = _.orderBy(fieldDefs, fieldDef => {
        const groupKey = _.get(innerItem ? fieldDef[innerItem] : fieldDef, groupby);
        if (groupKey) {
            return _.toLower(groupKey);
        }
    });

    // extract the grouped data based on the field obtained from 'groupDataByField'.
    const groupedLiData = _.groupBy(fieldDefs, groupDataByField.bind(undefined, groupby, match, innerItem, dateFormat, datePipe, AppDefaults));

    momentLocale._calendar = momentCalendarOptions; // Reset to default moment calendar options

    return groupedLiData;
};

// Format the date with given date format
export const filterDate = (value: string | number, format: string, defaultFormat: string, datePipe: ToDatePipe) => {
    if (format === 'timestamp') { // For timestamp format, return the epoch value
        return value;
    }

    return getFormattedDate(datePipe, value, format || defaultFormat);
};


/**
 * This method returns the groupkey based on the rollup (match) passed
 *
 * @param concatStr, string containing groupby field value
 * @param rollUp string containing the match property.
 * @param dateformat string containing the date format to display the date.
 */
const getTimeRolledUpString = (concatStr: string, rollUp: string, dateformat: string, datePipe?: ToDatePipe, AppDefaults?: any) => {
    let groupByKey,
        strMoment  = moment(concatStr),
        dateFormat = dateformat;

    const currMoment = moment(),
        getSameElseFormat = function () { // Set the sameElse option of moment calendar to user defined pattern
            return '[' + filterDate(this.valueOf(), dateFormat, ROLLUP_PATTERNS.DAY, datePipe) + ']';
        };

    switch (rollUp) {
        case TIME_ROLLUP_OPTIONS.HOUR:
            dateFormat = dateFormat || AppDefaults.timeFormat;

            // If date is invalid, check if data is in form of hh:mm a
            if (!strMoment.isValid()) {
                strMoment = moment(new Date().toDateString() + ' ' + concatStr);

                if (strMoment.isValid()) {
                    // As only time is present, roll up at the hour level with given time format
                    momentLocale._calendar.sameDay = function () {
                        return '[' + filterDate(this.valueOf(), dateFormat, ROLLUP_PATTERNS.HOUR, datePipe) + ']';
                    };
                }
            }
            // round off to nearest last hour
            strMoment = strMoment.startOf('hour');
            momentLocale._calendar.sameElse = getSameElseFormat;
            groupByKey = strMoment.calendar(currMoment);
            break;
        case TIME_ROLLUP_OPTIONS.WEEK:
            groupByKey = filterDate(strMoment.valueOf(), dateFormat, ROLLUP_PATTERNS.WEEK, datePipe);
            break;
        case TIME_ROLLUP_OPTIONS.MONTH:
            groupByKey = filterDate(strMoment.valueOf(), dateFormat, ROLLUP_PATTERNS.MONTH, datePipe);
            break;
        case TIME_ROLLUP_OPTIONS.YEAR:
            groupByKey = strMoment.format(ROLLUP_PATTERNS.YEAR);
            break;
        case TIME_ROLLUP_OPTIONS.DAY:
            dateFormat = dateFormat || AppDefaults.dateFormat;
            strMoment = strMoment.startOf('day'); // round off to current day
            momentLocale._calendar.sameElse = getSameElseFormat;
            groupByKey = strMoment.calendar(currMoment);
            break;
    }
    // If invalid date is returned, Categorize it as Others.
    if (groupByKey === 'Invalid date') {
        return GROUP_BY_OPTIONS.OTHERS;
    }
    return groupByKey;
};


// groups the fields based on the groupby value.
const groupDataByField = (groupby: string, match: string, innerItem: string, dateFormat: string, datePipe: ToDatePipe, AppDefaults: any, liData: Object) => {
    // get the groupby field value from the liData or innerItem in the liData.
    let concatStr = _.get(innerItem ? liData[innerItem] : liData, groupby);

    // by default set the undefined groupKey as 'others'
    if (_.isUndefined(concatStr) || _.isNull(concatStr) || concatStr.toString().trim() === '') {
        return GROUP_BY_OPTIONS.OTHERS;
    }

    // if match prop is alphabetic ,get the starting alphabet of the word as key.
    if (match === GROUP_BY_OPTIONS.ALPHABET) {
        concatStr = concatStr.substr(0, 1);
    }

    // if match contains the time options then get the concatStr using 'getTimeRolledUpString'
    if (_.includes(_.values(TIME_ROLLUP_OPTIONS), match)) {
        concatStr = getTimeRolledUpString(concatStr, match, dateFormat, datePipe, AppDefaults);
    }

    return concatStr;
};

/**
 * This method toggles all the list items inside the each list group.
 * @param el, component reference on which groupby is applied.
 */
export const toggleAllHeaders = (el: any) => {
    const groups = $(el.nativeElement).find('.item-group');

    groups.find('.group-list-item').toggle();

    // toggle the collapse icon on list header.
    const groupIcons = groups.find('li.list-group-header .app-icon');

    if (groupIcons) {
        _.forEach(groupIcons, (icon) => {
            icon = $(icon);
            if (icon.hasClass('wi-chevron-down')) {
                icon.removeClass('wi-chevron-down').addClass('wi-chevron-up');
            } else {
                icon.removeClass('wi-chevron-up').addClass('wi-chevron-down');
            }
        });
    }
};

/**
 * On list header click, toggle the list items in this group.
 * and also toggle the header icon.
 * @param $event
 */
export const handleHeaderClick = ($event: Event) => {
    const selectedGroup   = $($event.target as any).closest('.item-group'),
        selectedAppIcon = selectedGroup.find('li.list-group-header .app-icon');

    if (selectedAppIcon.hasClass('wi-chevron-down')) {
        selectedAppIcon.removeClass('wi-chevron-down').addClass('wi-chevron-up');
    } else {
        selectedAppIcon.removeClass('wi-chevron-up').addClass('wi-chevron-down');
    }

    selectedGroup.find('.group-list-item').toggle();
};

/**
 * configures reordering the items.
 * @param $el element to be sortable
 * @param options object containing the sortable options.
 * @param startCb callback on drag start on the element.
 * @param updateCb callback triggerred when sorting is stopped and the DOM position has changed.
 * @param sortCb callback triggerred during the sorting of an element.
 */
export const configureDnD = ($el: any, options: object, startCb: Function, updateCb: Function, sortCb?: Function) => {
    const sortOptions = Object.assign({
        containment: $el,
        delay: 100,
        opacity: 0.8,
        helper: 'clone',
        zIndex: 1050,
        tolerance: 'pointer',
        start: startCb,
        update: updateCb,
        sort: sortCb
    }, options);

    $el.sortable(sortOptions);
};

// Todo: convert to Class
interface DataSetProps {
    datafield: string;
    displayfield?: string;
    displayexpression?: string;
    usekeys?: boolean;
    orderby?: string;
}

/**
 * key represents the datafield value
 * label represents display value or expression value
 * value displayValue for primitives and data object for allFields
 * dataObject represent the object from the dataset when datafield is ALLFIELDS. This is used as innerItem while grouping the datasetItems.
 * imgSrc picture source
 * selected represents boolean to notify selected item.
 */
export class DataSetItem {
    key: any;
    label: any;
    value: any;
    dataObject?: Object;
    index?: number;
    imgSrc?: string;
    selected?: boolean;
}
