import { Directive, Inject, Self } from '@angular/core';
import { $appDigest, DataType, debounce, FormWidgetType, getClonedObject, isDefined } from '@wm/core';
import { DataSource } from '@wm/core';

import { FormComponent } from '../form.component';
import { registerLiveFilterProps } from '../form.props';
import { applyFilterOnField, fetchDistinctValues, getDistinctValuesForField, getEmptyMatchMode, getEnableEmptyFilter, getRangeFieldValue, getRangeMatchMode, LIVE_CONSTANTS } from '../../../../utils/data-utils';
import { isDataSetWidget } from '../../../../utils/widget-utils';

declare const _;

registerLiveFilterProps();

const FILTER_CONSTANTS = {
    'EMPTY_KEY'   : 'EMPTY_NULL_FILTER'
};
const noop = () => {};

@Directive({
    selector: '[wmLiveFilter]'
})
export class LiveFilterDirective {

    private _options;

    orderBy;

    // debounce the filter function. If multiple filter calls are made at same time, calls will be delayed and last call is fired
    _filter = debounce(options => {
        this.filter(options);
    }, 250);

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
    }

    execute(operation, options) {
        if (operation === DataSource.Operation.LIST_RECORDS || operation === DataSource.Operation.DOWNLOAD) {
            return this.applyFilter(options);
        }
        if (operation === DataSource.Operation.GET_OPTIONS) {
            return this._options || {};
        }
        if (operation === DataSource.Operation.GET_PAGING_OPTIONS) {
            return this.form.pagination;
        }
        if (!this.form.datasource) {
            return {};
        }
        if (operation === DataSource.Operation.FETCH_DISTINCT_VALUES) {
            return fetchDistinctValues(this.form.datasource, this.form.formFields, {
                widget: 'widgettype',
                enableemptyfilter: this.form.enableemptyfilter,
                EMPTY_VALUE: this.form.appLocale.LABEL_NO_VALUE
            });
        }
        return this.form.datasource.execute(operation, options);
    }

    onFieldDefaultValueChange(field, nv) {
        field.minValue = nv;
        field.value = nv;
        this.filterOnDefault();
    }

    onFieldValueChange(field, nv) {
        applyFilterOnField(this.form.datasource, field.widget, this.form.formFields, nv, {
            EMPTY_VALUE: this.form.appLocale.LABEL_NO_VALUE
        });
        if (this.form.autoupdate) {
            this._filter();
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
                    enableemptyfilter: this.form.enableemptyfilter,
                    EMPTY_VALUE: this.form.appLocale.LABEL_NO_VALUE
                });
                applyFilterOnField(dataSource, field.widget, this.form.formFields, field.value, {
                    isFirst: true,
                    EMPTY_VALUE: this.form.appLocale.LABEL_NO_VALUE
                });
            }
        });

        // On load check if default value exists and apply filter, Call the filter with the result options
        this._filter(this._options);
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
        options = options ? (options.data || options) : {};
        options.page = options.page || 1;
        options.orderBy = isDefined(options.orderBy) ?  options.orderBy : this.orderBy;
        return this.filter(options);
    }

    filter(options?) {
        if (!this.form.datasource) {
            return;
        }
        const filterFields = {};
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
            isValid = this.form.invokeEventCallback('beforeservicecall', {$data: dataModel});
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
                    filterFields[colName] = {
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
                    filterFields[colName] = {};
                    if (matchMode) {
                        filterFields[colName].matchMode = matchMode;
                        fieldValue = undefined;
                    } else if (filterField.type === DataType.STRING || filterField.isRelated) { // Only for string types and related fields, custom match modes are enabled.
                        filterFields[colName].matchMode = matchMode || filterField.matchmode ||
                            this.form.datasource.execute(DataSource.Operation.GET_MATCH_MODE);
                    }
                    filterFields[colName].value     = fieldValue;
                    filterFields[colName].logicalOp = 'AND';
                    filterFields[colName].type = filterField.type;
                }
            }
        });

        if (options.exportType) {
            return this.form.datasource.execute(DataSource.Operation.DOWNLOAD, {
                data: {
                    matchMode : 'anywhereignorecase',
                    filterFields : filterFields,
                    orderBy : orderBy,
                    exportType : options.exportType,
                    logicalOp : 'AND',
                    exportSize : options.exportSize,
                    fields : options.fields,
                    fileName: options.fileName
                }
            });
        }
        return this.form.datasource.execute(DataSource.Operation.LIST_RECORDS, {
            filterFields : filterFields,
            orderBy : orderBy,
            page : page,
            pagesize : this.form.pagesize || 20,
            skipDataSetUpdate : true, // dont update the actual variable dataset,
            inFlightBehavior : 'executeAll'
        }).then(response => {
            const data = response.data;
            this.form.pagination = response.pagination;

            if (data.error) {
                // disable readonly and show the appropriate error
                this.form.toggleMessage(true, data.error, 'error', 'ERROR');
                this.form.onResult(data, false);
            } else {
                this._options = {
                    'page': page,
                    'orderBy': orderBy
                };
                this.form.result = getClonedObject(data);
                this.form.onResult(data, true);
            }
            $appDigest();
            return this.form.result;
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
        if (defaultObj) {
            this._filter(this._options);
        }
    }

    registerFormWidget(widget) {
        const name = widget.key || widget.name;
        this.form.filterWidgets[name] = widget;
    }
}

