import { Injector } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { $appDigest, debounce } from '@wm/core';

import { convertDataToObject, DataSetItem, extractDataAsArray, getOrderedDataset, getUniqObjsByDataField, transformData, transformDataWithKeys } from '../../../utils/form-utils';
import { BaseFormCustomComponent } from './base-form-custom.component';

declare const _;

export abstract class DatasetAwareFormComponent extends BaseFormCustomComponent {
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

    public binddisplayexpression: string;
    public binddisplayimagesrc: string;

    public displayValue: Array<string> | string;

    protected datasetItems: DataSetItem[] = [];
    public acceptsArray = false; // set to true if proxyModel on widget accepts array type.
    protected dataset$ = new Subject();
    protected datavalue$ = new Subject();

    protected _modelByKey: any;
    protected _modelByValue: any;

    // this field contains the initial datavalue which needs to be processed once the dataset is available
    private toBeProcessedDatavalue: any;
    private readonly _debouncedInitDatasetItems: Function;

    protected get modelByKey() {
        return this._modelByKey;
    }

    // triggers on ngModel change. This function extracts the datavalue value.
    protected set modelByKey(val: any) {
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
        this.selectByValue(val);

        // invoke on datavalue change.
        this.invokeOnChange(val);

        // changes on the datavalue can be subscribed using listenToDatavalue
        this.datavalue$.next(val);
    }

    protected constructor(inj: Injector, WIDGET_CONFIG) {
        super(inj, WIDGET_CONFIG);

        this.binddisplayexpression = this.nativeElement.getAttribute('displayexpression.bind');
        this.binddisplayimagesrc = this.nativeElement.getAttribute('displayimagesrc.bind');

        this._debouncedInitDatasetItems = debounce(() => {
            this.initDatasetItems();
            $appDigest();
        }, 150);
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
        if (_.isUndefined(values) || _.isNull(values) || (values instanceof Array && !values.length)) {
            this._modelByKey = undefined;
            return;
        }

        if (this.acceptsArray && !_.isArray(values)) {
            values = extractDataAsArray(values);
        }

        // preserve the datavalue if datasetItems are empty.
        if (!this.datasetItems.length && !_.isUndefined(values)) {
            this.toBeProcessedDatavalue = values;
            return;
        }

        if (_.isArray(values)) {
            this._modelByKey = [];
            values.forEach(val => {
                const itemByValue = _.find(this.datasetItems, item => {
                    return (_.isObject(item.value) ? _.isEqual(item.value, val) : _.toString(item.value) === _.toString(val));
                });
                if (itemByValue) {
                    itemByValue.selected = true;
                    this._modelByKey.push(itemByValue.key);
                }
            });
        } else {
            this._modelByKey = undefined;
            const itemByValue = _.find(this.datasetItems, item => {
                return (_.isObject(item.value)  ? _.isEqual(item.value, values) : _.toString(item.value) === _.toString(values));
            });
            if (itemByValue) {
                itemByValue.selected = true;
                this._modelByKey = itemByValue.key;
            }
        }

        // if no item is found in datasetItems, wait untill the dataset updates by preserving the datavalue in toBeProcessedDatavalue.
        if (_.isUndefined(this._modelByKey) || !this._modelByKey.length) {
            this.toBeProcessedDatavalue = values;
        } else if (!_.isUndefined(this.toBeProcessedDatavalue)) {
            this._modelByValue = this.toBeProcessedDatavalue;
            this.toBeProcessedDatavalue = undefined;
        }

        this.initDisplayValues();
    }

    // Updates the displayValue property.
    protected initDisplayValues() {
        const displayValues = [];
        this.datasetItems.forEach(item => {
            if (item.selected) {
                displayValues.push(item.label);
            }
        });

        this.displayValue = this.multiple ? displayValues : displayValues[0];
    }

    // This function parses the dataset and extracts the displayOptions from parsed dataset.
    protected initDatasetItems() {
        if (!this.dataset || _.isEmpty(this.dataset)) {
            this.datasetItems = [];
            return;
        }

        // convert any dataset to the object format.
        const orderedDataset = getOrderedDataset(convertDataToObject(this.dataset), this.orderby);

        if (this.usekeys) {
            this.datasetItems = transformDataWithKeys(orderedDataset);
        } else {
            const displayOptions = transformData(orderedDataset, this.datafield, {
                displayField: this.displayfield || this.displaylabel,
                displayExpr: this.displayexpression,
                bindDisplayExpr: this.binddisplayexpression,
                bindDisplayImgSrc: this.binddisplayimagesrc,
                displayImgSrc: this.displayimagesrc
            });
            // get the unique objects out of the extracted data.
            this.datasetItems = getUniqObjsByDataField(displayOptions, this.datafield, this.displayfield || this.displaylabel);
        }

        this.postDatasetItemsInit();
    }

    // Once the datasetItems are ready, set the proxyModel by using datavalue.
    protected postDatasetItemsInit() {
        if (this.datasetItems.length) {
            // use the latest of toBeProcessedDatavalue, datavalue
            const _datavalue = _.isUndefined(this.toBeProcessedDatavalue) ? this.datavalue : this.toBeProcessedDatavalue;
            this.selectByValue(_datavalue);
        }
        // notify the dataset listeners
        this.dataset$.next(this.datasetItems);
    }

    // Reset the selected flag on datasetItems to false.
    protected resetDatasetItems() {
        this.datasetItems.forEach(item => item.selected = false);
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
        }
    }
}
