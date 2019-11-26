import { Injector } from '@angular/core';

import { Subject } from 'rxjs';

import { $appDigest, debounce, isDefined, isEqualWithFields, toBoolean } from '@wm/core';

import { convertDataToObject, DataSetItem, extractDataAsArray, getOrderedDataset, getUniqObjsByDataField, transformFormData, transformDataWithKeys } from '../../../utils/form-utils';
import { BaseFormCustomComponent } from './base-form-custom.component';
import { ALLFIELDS } from '../../../utils/data-utils';

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
    public binddisplaylabel: string;

    public displayValue: Array<string> | string;

    public datasetItems: DataSetItem[] = [];
    public acceptsArray = false; // set to true if proxyModel on widget accepts array type.
    protected dataset$ = new Subject();
    protected datavalue$ = new Subject();

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

    protected constructor(inj: Injector, WIDGET_CONFIG) {
        super(inj, WIDGET_CONFIG);

        this.binddisplayexpression = this.nativeElement.getAttribute('displayexpression.bind');
        this.binddisplayimagesrc = this.nativeElement.getAttribute('displayimagesrc.bind');
        this.binddisplaylabel = this.nativeElement.getAttribute('displaylabel.bind');

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
            this._modelByValue = undefined;
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

        this.displayValue = this.multiple ? displayValues : displayValues[0];
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
            const _datavalue = !isDefined(this.toBeProcessedDatavalue) ? this.datavalue : this.toBeProcessedDatavalue;
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
