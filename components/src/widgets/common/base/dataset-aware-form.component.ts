import { Injector, OnInit } from '@angular/core';

import { styler } from '../../framework/styler';
import { DataSetItem, getOrderedDataSet, transformData, transformDataWithKeys } from '../../../utils/form-utils';
import { BaseFormCustomComponent } from './base-form-custom.component';

declare const _;

export abstract class DatasetAwareFormComponent extends BaseFormCustomComponent implements OnInit {
    public dataset: any;
    public datafield: string;
    public displayfield: string;
    public displayexpression: string;
    public usekeys: boolean;
    public orderby: string;
    public multiple: boolean;
    public readonly: boolean;

    public datasetItems: DataSetItem[] = [];
    public displayValue;

    private _datavalue: any;
    private _model: any;
    public acceptsArray = false; // set to true if proxyModel on widget accepts array type.

    get proxyModel() {
        return this._model;
    }

    // triggers on ngModel change. This function extracts the datavalue value.
    set proxyModel(val: any) {
        this.selectByKey(val);
        this._model = val;
        // invoke on datavalue change.
        this.invokeOnChange(this._datavalue);
    }

    get datavalue() {
        return this._datavalue;
    }

    // triggers on setting the datavalue. This function extracts the model value.
    set datavalue(val: any) {
        this.selectByValue(val);
        this._datavalue = val;
    }

    constructor(inj: Injector, WIDGET_CONFIG) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.children[0] as HTMLElement, this);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'dataset':
            case 'datafield':
            case 'displayfield':
            case 'displayexpression':
            case 'orderby':
            case 'usekeys':
                this.initDatasetItems();
                break;
        }
    }

    // Reset the selected flag on datasetItems to false.
    protected resetDataSetItems() {
        this.datasetItems.forEach(item => item.selected = false);
    }

    /**
     * This function sets the _datavalue value from the model and sets the selected flag when item is found.
     * Here model is the value obtained from ngModel.
     * @param keys represent the model.
     */
    protected selectByKey(keys) {
        this.resetDataSetItems();

        if (!this.datasetItems.length) {
            return;
        }

        if (this.multiple && !_.isArray(keys)) {
            keys = [keys];
        }

        if (this.multiple) {
            this._datavalue = [];
            keys.forEach(key => {
                const itemByKey = _.find(this.datasetItems, item => {
                    // not triple equal, as the instance type can be different.
                    // only value comparison should be done.
                    return _.toString(item.key) === _.toString(key);
                });
                if (itemByKey) {
                    itemByKey.selected = true;
                    this._datavalue.push(itemByKey.value);
                }
            });
        } else {
            this._datavalue = undefined;
            const itemByKey = _.find(this.datasetItems, item => {
                // not triple equal, as the instance type can be different.
                // only value comparison should be done.
                return _.toString(item.key) === _.toString(keys);
            });
            if (itemByKey) {
                itemByKey.selected = true;
                this._datavalue = itemByKey.value;
            }
        }
        this.initDisplayValues();
    }

    /**
     * This function sets the _model value from the datavalue (selectedvalues) and sets the selected flag when item is found.
     * datavalue is the default value or a value representing the displayField (for suppose: object incase of ALLFIELDS).
     * If acceptsArray is true, the model always accepts an array.
     * For example, select always accepts model as array whether multiple select is true or false.
     * @param values represent the datavalue.
     */
    protected selectByValue(values) {
        this.resetDataSetItems();

        if (!this.datasetItems.length) {
            return;
        }

        if (this.acceptsArray && !_.isArray(values)) {
            values = [values];
        }

        if (_.isArray(values)) {
            this._model = [];
            values.forEach(val => {
                const itemByValue = _.find(this.datasetItems, item => {
                    return ((_.isObject(val) && _.isEqual(item.value, val)) || item.value === val);
                });
                if (itemByValue) {
                    itemByValue.selected = true;
                    this._model.push(itemByValue.key);
                }
            });
        } else {
            const itemByValue = _.find(this.datasetItems, item => {
                return ((_.isObject(values) && _.isEqual(item.value, values)) || _.toString(item.value) === _.toString(values));
            });
            if (itemByValue) {
                itemByValue.selected = true;
                this._model = itemByValue.key;
            }
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

        this.displayValue =  this.multiple ? displayValues : displayValues[0];
    }


    // This function parses the dataset and extracts the displayOptions from parsed dataset.
    protected initDatasetItems() {
        if (!this.dataset || _.isEmpty(this.dataset)) {
            this.datasetItems = [];
            return;
        }

        // TODO: remove check for data property
        let newDataSet = this.dataset.hasOwnProperty('data') ? this.dataset.data : this.dataset;

        newDataSet = getOrderedDataSet(newDataSet, this.orderby);

        if (this.usekeys) {
            this.datasetItems = transformDataWithKeys(newDataSet);
        } else {
            const displayOptions = transformData(newDataSet, this.datafield, this.displayfield, this.displayexpression);
            // get the unique objects out of the extracted data.
            this.datasetItems = _.uniqBy(displayOptions, 'key');
        }

        this.postDatasetItemsInit();
    }


    // Once the dataSetItems are ready, set the proxyModel by using datavalue.
    protected postDatasetItemsInit() {
        if (this.datasetItems.length) {
            this.selectByValue(this.datavalue);
        }
    }
}
