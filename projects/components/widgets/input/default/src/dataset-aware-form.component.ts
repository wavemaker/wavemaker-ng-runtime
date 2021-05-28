import { Injector, Attribute, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import { AppDefaults, $appDigest, debounce, isDefined, isEqualWithFields, noop, toBoolean } from '@wm/core';

import { ALLFIELDS, convertDataToObject, DataSetItem, extractDataAsArray, getOrderedDataset, getUniqObjsByDataField, handleHeaderClick, toggleAllHeaders, transformFormData, transformDataWithKeys, groupData, ToDatePipe } from '@wm/components/base';
import { BaseFormCustomComponent } from './base-form-custom.component';

declare const _;

export abstract class DatasetAwareFormComponent extends BaseFormCustomComponent implements OnInit {
    public dataset: any;
    public datafield: string;
    public displayfield: string;
    public displaylabel: string;
    public displayimagesrc: string;
    public displayexpression: string;
    public usekeys: boolean;
    public orderby: string;
    public multiple: boolean;
    public readonly: boolean;
    public content: string;
    public collapsible: boolean;
    public datePipe;

    public handleHeaderClick: ($event) => void;
    private toggleAllHeaders: void;
    public appDefaults;

    public binddisplayexpression: string;
    public binddisplayimagesrc: string;
    public binddisplaylabel: string;

    public displayValue: Array<string> | string;

    public datasetItems: DataSetItem[] = [];
    public acceptsArray = false; // set to true if proxyModel on widget accepts array type.
    protected dataset$ = new Subject();
    protected datavalue$ = new Subject();

    protected match: string;
    protected dateformat: string;
    public groupedData: any[];

    protected _modelByKey: any;
    public _modelByValue: any;
    public _defaultQueryInvoked: boolean; // for search/chips if datavalue is obtained from the default n/w call then set to true and do not update the modelByKeys.

    // this field contains the initial datavalue which needs to be processed once the dataset is available
    public toBeProcessedDatavalue: any;
    private readonly _debouncedInitDatasetItems: Function;
    protected allowempty = true;
    public compareby: any;

    public get modelByKey() {
        return this._modelByKey;
    }

    // triggers on ngModel change. This function extracts the datavalue value.
    public set modelByKey(val: any) {
        this.selectByKey(val);

        // invoke on datavalue change.
        this.invokeOnChange(this._modelByValue);
    }

    public get datavalue() {
        return this._modelByValue;
    }

    // triggers on setting the datavalue. This function extracts the model value.
    public set datavalue(val: any) {
        if (this.multiple) {
            val = extractDataAsArray(val);
        }
        this._modelByValue = val;

        this.selectByValue(val);

        // changes on the datavalue can be subscribed using listenToDatavalue
        this.datavalue$.next(val);

        // invoke on datavalue change.
        this.invokeOnChange(val, undefined, true);
    }

    protected constructor(inj: Injector, WIDGET_CONFIG, @Attribute('groupby') public groupby?: string) {
        super(inj, WIDGET_CONFIG);
        this.datePipe = this.inj.get(ToDatePipe);
        this.appDefaults = this.inj.get(AppDefaults);
        this.binddisplayexpression = this.nativeElement.getAttribute('displayexpression.bind');
        this.binddisplayimagesrc = this.nativeElement.getAttribute('displayimagesrc.bind');
        this.binddisplaylabel = this.nativeElement.getAttribute('displaylabel.bind');

        this._debouncedInitDatasetItems = debounce(() => {
            this.initDatasetItems();
            $appDigest();
        }, 150);
        this.handleHeaderClick = noop;
    }

    /**
     * This function sets the _datavalue value from the model and sets the selected flag when item is found.
     * Here model is the value obtained from ngModel.
     * @param keys represent the model.
     */
    protected selectByKey(keys) {
        this.resetDatasetItems();

        if (!this.datasetItems.length) {
            return;
        }

        if (this.multiple && !_.isArray(keys)) {
            keys = [keys];
        }

        // Set the _modelByKey to the modified keys.
        this._modelByKey = keys;

        if (this.multiple) {
            this._modelByValue = [];
            keys.forEach(key => {
                const itemByKey = _.find(this.datasetItems, item => {
                    // not triple equal, as the instance type can be different.
                    // only value comparison should be done.
                    return _.toString(item.key) === _.toString(key);
                });
                if (itemByKey) {
                    itemByKey.selected = true;
                    this._modelByValue = [...this._modelByValue, itemByKey.value];
                }
            });
        } else {
            this._modelByValue = '';
            const itemByKey = _.find(this.datasetItems, item => {
                // not triple equal, as the instance type can be different.
                // only value comparison should be done.
                return _.toString(item.key) === _.toString(keys);
            });
            if (itemByKey) {
                itemByKey.selected = true;
                this._modelByValue = itemByKey.value;
            }
        }
        this.initDisplayValues();
    }

    /**
     * This function sets the _model value from the datavalue (selectedvalues) and sets the selected flag when item is found.
     * datavalue is the default value or a value representing the displayField (for suppose: object in case of ALLFIELDS).
     * If acceptsArray is true, the model always accepts an array.
     * For example, select always accepts model as array whether multiple select is true or false.
     * @param values represent the datavalue.
     */
    protected selectByValue(values: Array<any> | any) {
        this.resetDatasetItems();

        // if datavalue is not defined or empty then set the model as undefined.
        if (!isDefined(values) || values === '' || _.isNull(values) || (values instanceof Array && !values.length)) {
            this._modelByKey = undefined;
            // do not return when allowempty is set to true.
            if (!this.allowempty || !isDefined(values)) {
                return;
            }
        }

        if (this.acceptsArray && !_.isArray(values)) {
            values = this.allowempty ? [values] : extractDataAsArray(values);
        }

        // preserve the datavalue if datasetItems are empty.
        if (!this.datasetItems.length && isDefined(values)) {
            this.toBeProcessedDatavalue = values;
            return;
        }

        const filterField = this.datafield === ALLFIELDS ? 'dataObject' : 'key';

        if (_.isArray(values)) {
            this._modelByKey = [];
            values.forEach(val => {
                const itemByValue = _.find(this.datasetItems, item => {
                    if (filterField === 'dataObject') {
                        if (this.compareby && this.compareby.length) {
                            return isEqualWithFields(item[filterField], val, this.compareby);
                        }
                    }
                    return (_.isObject(item.value) ? _.isEqual(item.value, val) : (_.toString(item.value)).toLowerCase() === (_.toString(val)).toLowerCase());
                });
                if (itemByValue) {
                    itemByValue.selected = true;
                    this._modelByKey.push(itemByValue.key);
                }
            });
        } else {
            this._modelByKey = undefined;
            const itemByValue = _.find(this.datasetItems, item => {
                if (filterField === 'dataObject') {
                    if (this.compareby && this.compareby.length) {
                        return isEqualWithFields(item[filterField], values, this.compareby);
                    }
                }
                return (_.isObject(item.value)  ? _.isEqual(item.value, values) : (_.toString(item.value)).toLowerCase() === (_.toString(values)).toLowerCase());
            });
            if (itemByValue) {
                itemByValue.selected = true;
                this._modelByKey = itemByValue.key;
            }
        }
        // delaying the datavalue update as the widgets in liveform are having datavalue as undefined and not the default provided value
        // because datavalue is updated later when new dataset is available.
        this._debounceDatavalueUpdation(values);
    }

    protected readonly _debounceDatavalueUpdation = _.debounce((values) => {
        // if no item is found in datasetItems, wait untill the dataset updates by preserving the datavalue in toBeProcessedDatavalue.
        if (!isDefined(this._modelByKey) || (_.isArray(this._modelByKey) && !this._modelByKey.length)) {
            this.toBeProcessedDatavalue = values;
            this._modelByValue = '';
        } else if (isDefined(this.toBeProcessedDatavalue)) {
            // obtain the first array value when multiple is set to false.
            // set the modelByValue only when undefined.
            if (!isDefined(this._modelByValue)) {
                this._modelByValue = (!this.multiple && _.isArray(this.toBeProcessedDatavalue)) ? this.toBeProcessedDatavalue[0] : this.toBeProcessedDatavalue;
            }
            this.toBeProcessedDatavalue = undefined;
        }

        this.initDisplayValues();
    }, 150);

    // Updates the displayValue property.
    protected initDisplayValues() {
        const displayValues = [];
        this.datasetItems.forEach(item => {
            if (item.selected) {
                displayValues.push(item.label);
            }
        });

        this.displayValue = this.multiple ? displayValues : displayValues[0] || '';
    }

    // This function parses the dataset and extracts the displayOptions from parsed dataset.
    protected initDatasetItems() {
        if (!this.dataset || _.isEmpty(this.dataset)) {
            this.datasetItems = [];
            // notify the dataset listeners
            this.dataset$.next(this.datasetItems);
            return;
        }

        // convert any dataset to the object format.
        const orderedDataset = getOrderedDataset(convertDataToObject(this.dataset), this.orderby);

        if (this.usekeys) {
            this.datasetItems = transformDataWithKeys(orderedDataset);
        } else {
            const displayOptions = transformFormData(this.viewParent, orderedDataset, this.datafield, {
                displayField: this.displayfield || this.displaylabel,
                displayExpr: this.displayexpression,
                bindDisplayExpr: this.binddisplayexpression || this.binddisplaylabel,
                bindDisplayImgSrc: this.binddisplayimagesrc,
                displayImgSrc: this.displayimagesrc
            });
            // get the unique objects out of the extracted data. Notify change in datasetItems using [...datasetItems] notation
            this.datasetItems = [...getUniqObjsByDataField(displayOptions, this.datafield, this.displayfield || this.displaylabel, toBoolean(this.allowempty))];
        }

        this.postDatasetItemsInit();
    }

    // Once the datasetItems are ready, set the proxyModel by using datavalue.
    protected postDatasetItemsInit() {
        if (this.datasetItems.length && !this._defaultQueryInvoked) {
            // use the latest of toBeProcessedDatavalue, datavalue
            const _datavalue = _.isEmpty(this.toBeProcessedDatavalue) ? this.datavalue : this.toBeProcessedDatavalue;
            this.selectByValue(_datavalue);
        }
        // notify the dataset listeners
        this.dataset$.next(this.datasetItems);
    }

    // Reset the selected flag on datasetItems to false.
    protected resetDatasetItems() {
        this.datasetItems.forEach(item => item.selected = false);
    }

    protected setTemplate(partialName) {
        this.content = partialName;
        if (this.viewParent && this.viewParent.prefabName) {
            this['prefabName'] = this.viewParent.prefabName;
        }
    }


    private getGroupedData() {
        return this.datasetItems.length ? groupData(this, convertDataToObject(this.datasetItems), this.groupby, this.match, this.orderby, this.dateformat, this.datePipe, 'dataObject', this.appDefaults) : [];
    }

    private datasetSubscription() {
        const datasetSubscription = this.dataset$.subscribe(() => {
            this.groupedData = this.getGroupedData();
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
    }

    protected setGroupData() {
        this.datasetSubscription();
        // If groupby is set, get the groupedData from the datasetItems.
        this.groupedData = this.getGroupedData();
    }


    onPropertyChange(key: string, nv: any, ov?: any) {
        super.onPropertyChange(key, nv, ov);
        switch (key) {
            case 'dataset':
            case 'datafield':
            case 'displayfield':
            case 'displaylabel':
            case 'displayexpression':
            case 'orderby':
            case 'usekeys':
                this._debouncedInitDatasetItems();
                break;
            case 'required':
            case 'datavalue':
                this._onChange(this.datavalue);
                break;
            case 'groupby':
            case 'match':
                if (this.widgetType !== 'wm-search' && this.widgetType !== 'wm-chips') {
                    this.setGroupData();
                }
            break;
        }
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.groupby && (this.widgetType !== 'wm-search' && this.widgetType !== 'wm-chips')) {
            this.setGroupData();
        }
        // adding the handler for header click and toggle headers.
        if (this.groupby && this.collapsible) {
            this.handleHeaderClick = handleHeaderClick;
            this.toggleAllHeaders = toggleAllHeaders.bind(undefined, this);
        }
    }
}
