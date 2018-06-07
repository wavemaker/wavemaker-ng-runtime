import { Directive, Inject, Self } from '@angular/core';
import { DataType, FormWidgetType, getClonedObject, isDefined } from '@wm/core';
import { DataSource } from '@wm/core';

import { FormComponent } from './form.component';
import { registerLiveFilterProps } from './form.props';
import { applyFilterOnField, getDistinctValuesForField, getEmptyMatchMode, getEnableEmptyFilter, getRangeFieldValue, getRangeMatchMode } from '../../../utils/data-utils';
import { isDataSetWidget } from '../../../utils/widget-utils';

declare const _;

registerLiveFilterProps();

const FILTER_CONSTANTS = {
    'EMPTY_KEY'   : 'EMPTY_NULL_FILTER',
    'EMPTY_VALUE' : 'No Value',
    'NULLEMPTY'   : ['null', 'empty'],
    'NULL'        : 'null',
    'EMPTY'       : 'empty'
};
const noop = () => {};

@Directive({
    selector: '[wmLiveFilter]'
})
export class LiveFilterDirective {

    orderBy;
    // debounce the filter function. If multiple filter calls are made at same time, calls will be delayed and last call is fired
    _filter = _.debounce(options => {
        this.filter(options);
    }, 200);

    constructor(@Self() @Inject(FormComponent) private form) {
        form.clearFilter = this.clearFilter.bind(this);
        form.applyFilter = this.applyFilter.bind(this);
        form.filter = this.filter.bind(this);
        form.filterOnDefault = this.filterOnDefault.bind(this);
        form.execute = this.execute.bind(this);
        form.onFieldDefaultValueChange = this.onFieldDefaultValueChange.bind(this);
        form.onMaxDefaultValueChange = this.onMaxDefaultValueChange.bind(this);
        form.onDataSourceChange = this.onDataSourceChange.bind(this);
        form.onFieldValueChange = this.onFieldValueChange.bind(this);
        form.submitForm = this.submitForm.bind(this);
        form.registerFormWidget = this.registerFormWidget.bind(this);

        this.form.result = {
            data: [],
            options: {
                page: 1
            }
        };
    }

    execute(operation, options) {
        if (operation === DataSource.Operation.LIST_RECORDS || operation === DataSource.Operation.DOWNLOAD) {
            return this.applyFilter(options);
        }
        if (operation === DataSource.Operation.GET_OPTIONS) {
            return this.form.result ? this.form.result.options : {};
        }
        return this.form.datasource.execute(operation, options);
    }

    onFieldDefaultValueChange(field, nv) {
        field.minValue = nv;
        field.value = nv;
        this.filterOnDefault();
    }

    onFieldValueChange(field, nv) {
        if (isDataSetWidget(field.widgettype)) {
            applyFilterOnField(this.form.datasource, field.widget, this.form.formFields, nv);
        }
        if (this.form.autoupdate) {
            this.filter();
        }
    }

    onMaxDefaultValueChange() {
        setTimeout(() => {
            this.filterOnDefault();
        });
    }

    onDataSourceChange() {
        const dataSource = this.form.datasource;

        if (!dataSource) {
            return;
        }

        this.form.formFields.forEach(field => {
            if (isDataSetWidget(field.widgettype)) {
                getDistinctValuesForField(dataSource, field.widget, {
                    widget: 'widgettype',
                    enableemptyfilter: this.form.enableemptyfilter
                });
                applyFilterOnField(dataSource, field.widget, this.form.formFields, field.value, {isFirst: true});
            }
        });

        this.form.result.variableName = dataSource.execute(DataSource.Operation.GET_NAME);
        this.form.result.propertiesMap = dataSource.execute(DataSource.Operation.GET_PROPERTIES_MAP);

        // On load check if default value exists and apply filter, Call the filter with the result options
        this._filter(this.form.result.options);
    }

    clearFilter() {
        this.form.formFields.forEach(filterField => {
            // Added check for range field
            if (!filterField.readonly && filterField.show) {
                if (filterField.widgettype === FormWidgetType.AUTOCOMPLETE || filterField.widgettype === FormWidgetType.TYPEAHEAD) {
                    this.form.$element.find('div[name=' + filterField.name + '] input').val('');
                }
                if (filterField['is-range']) {
                    filterField.minValue = '';
                    filterField.maxValue = '';
                } else {
                    filterField.value = '';
                }
            }
        });
        // If variable has any bindings, wait for the bindings to be updated
        setTimeout(() => {
            // Setting result to the default data
            this.filter();
        });
    }

    submitForm() {
        this.filter();
    }

    applyFilter(options) {
        options = options || {};
        options.page = options.page || 1;
        options.orderBy = isDefined(options.orderBy) ?  options.orderBy : this.orderBy;
        return this.filter(options);
    }

    filter(options?) {
        if (!this.form.datasource) {
            return;
        }
        const formFields = {};
        const dataModel = {};
        let page = 1,
            orderBy,
            isValid;
        options = options || {};
        page = options.page || page;
        orderBy = isDefined(options.orderBy) ? options.orderBy : (this.orderBy || '');
        this.orderBy = orderBy; // Store the order by in scope. This can be used to retain the sort after filtering
        // Copy the values to be sent to the user as '$data' before servicecall
        this.form.formFields.forEach(field => {
            const fieldSelector = 'div[name=' + field.name + '] input';
            const $el = this.form.$element;
            let fieldEle;
            if ((field.widgettype === FormWidgetType.AUTOCOMPLETE || field.widgettype === FormWidgetType.TYPEAHEAD) && $el) {
                fieldEle = $el.find(fieldSelector);
                if (!field['is-range']) {
                    dataModel[field.field] = {
                        'value': isDefined(field.value) ? field.value : fieldEle.val() // For autocomplete, set the datavalue. If not present, set query value
                    };
                } else {
                    dataModel[field.field] = {
                        'minValue':  isDefined(field.minValue) ? field.minValue : fieldEle.first().val(),
                        'maxValue':  isDefined(field.maxValue) ? field.maxValue : fieldEle.last().val()
                    };
                }
                return;
            }
            if (!field['is-range']) {
                dataModel[field.field] = {
                    'value': field.value
                };
            } else {
                dataModel[field.field] = {
                    'minValue': field.minValue,
                    'maxValue': field.maxValue
                };
            }
        });
        /*Perform this function for the event onBeforeservicecall*/
        try {
            isValid = this.form.invokeEventCallback(this.form, 'beforeservicecall', {$data: dataModel});
            if (isValid === false) {
                return;
            }
            if (isValid && isValid.error) {
                this.form.toggleMessage(true, isValid.error, 'error', 'ERROR');
                return;
            }
            /*Update these values in the formFields with new reference, inorder to maintain the UI values*/
            this.form.formFields.forEach(filterField => {
                if (!filterField['is-range']) {
                    filterField._value = dataModel[filterField.field].value;
                } else {
                    filterField._minValue = dataModel[filterField.field].minValue;
                    filterField._maxValue = dataModel[filterField.field].maxValue;
                }
            });
        } catch (err) {
            if (err.message === 'Abort') {
                return;
            }
        }
        /* Construct the formFields Variable to send it to the queryBuilder */
        this.form.formFields.forEach(filterField => {
            let fieldValue;
            let matchMode;
            let colName  = filterField.field;
            const minValue = filterField._minValue;
            const maxvalue = filterField._maxValue;
            /* if field is part of a related entity, column name will be 'entity.fieldName' */
            if (filterField['is-related']) {
                colName += '.' + filterField['lookup-field'];
            }
            if (filterField['is-range']) {
                /*Based on the min and max values, decide the matchmode condition*/
                fieldValue = getRangeFieldValue(minValue, maxvalue);
                matchMode  = getRangeMatchMode(minValue, maxvalue);
                if (isDefined(fieldValue)) {
                    formFields[colName] = {
                        'value'     : fieldValue,
                        'matchMode' : matchMode,
                        'logicalOp' : 'AND'
                    };
                }
            } else {
                switch (filterField.widgettype) {
                    case FormWidgetType.SELECT:
                    case FormWidgetType.RADIOSET:
                        if (getEnableEmptyFilter(this.form.enableemptyfilter) && filterField._value === FILTER_CONSTANTS.EMPTY_KEY) {
                            matchMode  = getEmptyMatchMode(this.form.enableemptyfilter);
                            fieldValue = filterField._value;
                        } else {
                            if (filterField.type === DataType.BOOLEAN) {
                                if (isDefined(filterField._value) && filterField._value !== '') {
                                    fieldValue = JSON.parse(filterField._value);
                                }
                            } else {
                                fieldValue = filterField._value;
                            }
                        }
                        break;
                    case FormWidgetType.CHECKBOXSET:
                    case FormWidgetType.CHIPS:
                        if (filterField._value && filterField._value.length) {
                            fieldValue = filterField._value;
                        }
                        break;
                    case FormWidgetType.CHECKBOX:
                    case FormWidgetType.TOGGLE:
                        if (isDefined(filterField._value) && filterField._value !== '') {
                            fieldValue = filterField.type === DataType.BOOLEAN ? JSON.parse(filterField._value) : filterField._value;
                        }
                        break;
                    default:
                        fieldValue = filterField._value;
                        break;
                }
                if (isDefined(fieldValue) && fieldValue !== '' && fieldValue !== null) {
                    formFields[colName] = {};
                    if (matchMode) {
                        formFields[colName].matchMode = matchMode;
                        fieldValue = undefined;
                    } else if (filterField.type === DataType.STRING || filterField.isRelated) { // Only for string types and related fields, custom match modes are enabled.
                        formFields[colName].matchMode = matchMode || filterField.matchmode ||
                            this.form.datasource.execute(DataSource.Operation.GET_MATCH_MODE);
                    }
                    formFields[colName].value     = fieldValue;
                    formFields[colName].logicalOp = 'AND';
                }
            }
        });

        if (options.exportType) {
            return this.form.datasource.execute(DataSource.Operation.DOWNLOAD, {
                matchMode : 'anywhere',
                filterFields : formFields,
                orderBy : orderBy,
                exportType : options.exportType,
                logicalOp : 'AND',
                size : options.exportdatasize
            });
        }
        return this.form.datasource.execute(DataSource.Operation.LIST_RECORDS, {
            filterFields : formFields,
            orderBy : orderBy,
            page : page,
            pagesize : this.form.pagesize || 20,
            skipDataSetUpdate : true, // dont update the actual variable dataset,
            inFlightBehavior : 'executeAll'
        }).then(response => {
            const result = <any>{};
            const data = response.data;
            const propertiesMap = response.propertiesMap;
            const pageOptions = response.pagingOptions;

            if (data.error) {
                // disable readonly and show the appropriate error
                this.form.toggleMessage(true, data.error, 'error', 'ERROR');
                this.form.onResult(data, false);
            } else {
                result.data = data;
                result.formFields = getClonedObject(formFields);
                result.pagingOptions = {
                    'dataSize': pageOptions.dataSize,
                    'maxResults': this.form.pagesize || 20,
                    'currentPage': page
                };
                result.options = {
                    'page': page,
                    'orderBy': orderBy
                };
                result.propertiesMap = propertiesMap;
                this.form.result = {...this.form.result, ...result};
                this.form.onResult(data, true);
            }
            return result;
        }, error => {
            this.form.toggleMessage(true, error, 'error', 'ERROR');
            this.form.onResult(error, false);
            return error;
        });
    }

    // Calls the filter function if default values are present
    filterOnDefault() {
        /*Check if default value is present for any filter field*/
        const defaultObj = _.find(this.form.formFields, obj => {
            return isDefined(obj.value) || isDefined(obj.minValue) || isDefined(obj.maxValue);
        });
        /*If default value exists and data is loaded, apply the filter*/
        if (defaultObj && this.form.result) {
            this._filter(this.form.result.options);
        }
    }

    registerFormWidget(widget) {
        const name = widget.key || widget.name;
        this.form.filterWidgets[name] = widget;
    }
}

