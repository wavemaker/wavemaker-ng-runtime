import { Component, forwardRef, Injector, OnInit } from '@angular/core';

import { removeAttr, setAttr } from '@wm/core';

import { WidgetRef } from '../../framework/types';
import { styler } from '../../framework/styler';
import { registerProps } from './select.props';
import { assignModelForMultiSelect, assignModelForSelected, extractDisplayOptions, getDisplayValues, updatedCheckedValues } from '../../../utils/form-utils';
import { getControlValueAccessor } from '../../../utils/widget-utils';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-select', hostClass: 'app-select-wrapper'};

@Component({
    selector: '[wmSelect]',
    templateUrl: './select.component.html',
    providers: [
        getControlValueAccessor(SelectComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => SelectComponent)}
    ]
})

export class SelectComponent extends BaseFormCustomComponent implements OnInit {

    class = '';
    required;
    tabindex;

    public readonly;
    public multiple;
    private ALLFIELDS = 'All Fields';
    private _isChangedManually = false;
    public displayValue: string;
    public dataset: any;
    public datafield: string;
    public displayfield: string;
    public displayexpression: string;
    public usekeys: boolean;
    public orderby: string;
    public placeholder: string;
    public disabled;

    private __model;
    public _modelProxy: any[] = [];
    private _dataVal;
    private oldValue;
    public _displayOptions: any[] = [];

    get _model_() {
        return this.__model;
    }

    set _model_(val: any) {
        this.__model = val;
        if (this.displayOptions.length) {
            updatedCheckedValues(this.displayOptions, val, this.modelProxy, this.usekeys, (_modelProxy) => {
                this.modelProxy = _modelProxy;
                this.displayValue = getDisplayValues(this.displayOptions);
            });
        }
        this.invokeOnChange(this.datavalue);
    }

    get datavalue() {
        return this._model_;
    }

        set datavalue(val: any) {
            this._model_ = val;
        }
        get displayOptions() {
            return this._displayOptions;
        }
        set displayOptions(val: any) {
            this._displayOptions = val;
        }
        get modelProxy() {
            return this.multiple ? this._modelProxy : this._modelProxy[0];
        }
        set modelProxy(val: any) {
            this._modelProxy = _.isArray(val) ? val : [val];
        }
        private updateValues(modelObj) {
            this._dataVal = modelObj._dataVal;
            this._model_ = modelObj.model;
        }

        /**
         * function to assign the values to the model variable based on the selectedvalue as provided
         */
        private assignModelValue() {
            if (this.multiple) {
                assignModelForMultiSelect(this.displayOptions, this.datafield, this.modelProxy, this._model_, this._isChangedManually, this._dataVal, this.updateValues.bind(this));
            } else {
                assignModelForSelected(this.displayOptions, this._model_, this.modelProxy, this.datafield, this._isChangedManually, this._dataVal, this.updateValues.bind(this));
            }
        }

    onSelectValueChange($event) {
        this._isChangedManually = true;
        let prevSelectedOption;
        const dataField = this.datafield;

        // modelProxy should not change when select is set to readonly.
        if (this.readonly) {
            if (dataField !== this.ALLFIELDS || _.isUndefined(this._model_)) {
                this.modelProxy = this._model_;
            } else {
                prevSelectedOption = this.displayOptions.find((opt) => {
                    return _.isEqual(opt.dataObject, this._model_);
                });
                this.modelProxy = prevSelectedOption.key;
            }
            return;
        }
        this.assignModelValue();
        this.invokeOnTouched();
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
    }

        private onResult(displayOptions) {
            this.displayOptions = displayOptions;
            // Use _dataVal as model when the displayOptions are updated i.e. when latest dataset is retrieved
            if (this.displayOptions.length && !_.isNull(this._model_) && this._model_ !== ''
                && (_.isUndefined(this._model_) || !this._model_.length)) {
                this._model_ = this._dataVal;
            }
            if (this.displayOptions.length) {
                updatedCheckedValues(this.displayOptions, this._model_, this.modelProxy, this.usekeys, _modelProxy => {
                    this.modelProxy = _modelProxy;
                    this.displayValue = getDisplayValues(this.displayOptions);
                    this.assignModelValue();
                });
            }
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

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'readonly':
                if (nv) {
                    setAttr(this.nativeElement, 'readonly', true);
                } else {
                    removeAttr(this.nativeElement, 'readonly');
                }
                break;
            case 'dataset':
            case 'datafield':
            case 'displayfield':
            case 'displayexpression':
            case 'orderby':
            case 'usekeys':
                this.constructDisplayOptions();
                break;
            case 'datavalue':
                this.datavalue = nv;
                break;
            case 'multiple':
                this.modelProxy = nv ? [] : '';
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.children[0] as HTMLElement, this);
    }
}
