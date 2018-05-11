import { Component, forwardRef, Injector } from '@angular/core';

import { $appDigest, switchClass } from '@wm/core';

import { WidgetRef } from '../../framework/types';
import { styler } from '../../framework/styler';
import { registerProps } from './radioset.props';
import { assignModelForSelected, extractDisplayOptions, getDisplayValues, updateCheckedValue, updatedCheckedValues } from '../../../utils/form-utils';
import { getControlValueAccessor } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

declare const _;

registerProps();

const DEFAULT_CLS = 'app-radioset list-group';
const WIDGET_CONFIG = {widgetType: 'wm-radioset', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmRadioset]',
    templateUrl: './radioset.component.html',
    providers: [
        getControlValueAccessor(RadiosetComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => RadiosetComponent)}
    ]
})
export class RadiosetComponent extends BaseFormCustomComponent {
    class = '';
    itemclass = '';
    width;
    height;
    margin;
    required;
    tabindex;

    public _displayOptions: any[];
    private ALLFIELDS = 'All Fields';
    private _isChangedManually = false;
    private modelProxy;
    public displayValue;

    public dataset;
    public datafield;
    public displayfield;
    public displayexpression;
    public orderby;
    public usekeys;
    public readonly;
    public disabled;
    public layout = '';

    private __model;
    private _dataVal;

    get _model_() {
        return this.__model;
    }

    set _model_(val) {
        this.__model = val;
        updatedCheckedValues(this.displayOptions, val, this.modelProxy, this.usekeys, (_modelProxy) => {
            this.modelProxy = _modelProxy;
            this.displayValue = getDisplayValues(this.displayOptions);
        });
        this.invokeOnChange(this.datavalue);
    }

    /**
     * This property can be used to set the value of the component.
     * */
    set datavalue(val: any) {
        this._model_ = val;
    }

    get datavalue() {
        return this._model_;
    }

    get displayOptions() {
        return this._displayOptions;
    }

    set displayOptions(val: any[]) {
        this._displayOptions = val;
    }

    private onResult(displayOptions) {
        this.displayOptions = displayOptions;

        // Use _dataVal as model when the displayOptions are updated i.e. when latest dataset is retrieved
        if (this.displayOptions.length && !_.isNull(this._model_) && this._model_ !== ''
            && (_.isUndefined(this._model_) || !this._model_.length)) {
            this._model_ = this._dataVal;
        }

        updatedCheckedValues(this.displayOptions, this.__model, this.modelProxy, this.usekeys, (_modelProxy) => {
            this.modelProxy = _modelProxy;
            this.displayValue = getDisplayValues(this.displayOptions);
            this.assignModelValue(undefined);
        });
    }

    /**
     * This function parses the dataset and extracts the displayOptions from parsed dataset.
     * displayOption will contain datafield as key, displayfield as value.
     */
    private constructDisplayOptions() {
        this.displayOptions = [];
        extractDisplayOptions(this.dataset, {
            'datafield': this.datafield,
            'displayfield': this.displayfield,
            'displayexpression': this.displayexpression,
            'usekeys': this.usekeys,
            'orderby': this.orderby
        }, this.onResult.bind(this));
    }

    private updateValues(modelObj) {
        this._dataVal = modelObj._dataVal;
        this._model_ = modelObj.model;
    }

    /**
     * function to assign the values to the model variable based on the selectedvalue as provided
     */
    private assignModelValue(radioOption) {
        if (radioOption) {
            if (this.datafield === this.ALLFIELDS) {
                if (this.usekeys || !radioOption.dataObject) {
                    this._model_ = radioOption.key;
                } else {
                    this._model_ = radioOption.dataObject;
                }
            } else {
                this._model_ = radioOption.key;
            }
        } else {
            assignModelForSelected(this.displayOptions, this._model_, this.modelProxy,
                this.datafield, this._isChangedManually, this._dataVal, this.updateValues.bind(this));
        }

        $appDigest();
    }

    /**
     * On click of the option, update the datavalue
     */
    _onRadioLabelClick($event, radioOption) {
        this.invokeOnTouched();
        if (this.disabled || this.readonly) {
            return;
        }

        this._isChangedManually = true;

        const dataObj = _.find(this.displayOptions, {'isChecked': true});
        let checkedDisplayOption;

        // RadioOption should not be deselected when clicked again. Model and display value remains the same.
        if (dataObj && (_.toString(radioOption) === _.toString(dataObj.key))) {
            return;
        }

        checkedDisplayOption = updateCheckedValue(radioOption, this.displayOptions);

        if (dataObj) {
            dataObj.isChecked = false;
        }

        this.assignModelValue(checkedDisplayOption);
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'dataset':
            case 'datafield':
            case 'displayfield':
            case 'usekeys':
            case 'displayexpression':
            case 'orderby':
                this.constructDisplayOptions();
                break;
            case 'datavalue':
            case 'selectedvalue':
                this._model_ = nv;
                break;
            case 'layout':
                switchClass(this.nativeElement, nv, ov);
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
