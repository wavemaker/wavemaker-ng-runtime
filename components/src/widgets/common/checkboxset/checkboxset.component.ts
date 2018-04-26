import {Component, Injector, forwardRef} from '@angular/core';

import {switchClass, $appDigest} from '@wm/core';

import {styler} from '../../framework/styler';
import {BaseFormComponent} from '../base/base-form.component';
import {updatedCheckedValues, updateCheckedValue, getDisplayValues, extractDisplayOptions, assignModelForMultiSelect} from '../../../utils/form-utils';
import {getControlValueAccessor} from '../../../utils/widget-utils';
import {registerProps} from '../checkboxset/checkboxset.props';

registerProps();
const DEFAULT_CLS = 'app-checkboxset list-group';
const WIDGET_CONFIG = {widgetType: 'wm-checkboxset', hostClass: DEFAULT_CLS};
declare const _;

@Component({
    selector: '[wmCheckboxset]',
    templateUrl: 'checkboxset.component.html',
    providers: [getControlValueAccessor(CheckboxsetComponent), {
        provide: '@Widget', useExisting: forwardRef(() => CheckboxsetComponent)
    }]
})

export class CheckboxsetComponent extends BaseFormComponent {
    itemclass;
    required;
    tabindex;
    hint;

    public dataset;
    public datafield;
    public displayfield;
    public displayexpression;
    public orderby;
    public usekeys;
    public readonly;
    public disabled;
    public layout = '';
    public datasource;
    public displayValue;

    public _displayOptions: any[];
    private _isChangedManually = false;
    private ALLFIELDS = 'All Fields';
    private modelProxy;

    private __model;
    private _dataVal;

    get _model_() {
        return this.__model;
    }

    set _model_(val: any) {
        this.__model = val;
        updatedCheckedValues(this.displayOptions, this.__model, this.modelProxy, this.usekeys, (_modelProxy) => {
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


    private updateValues(modelObj) {
        this._dataVal = modelObj._dataVal;
        this._model_ = modelObj.model;
    }

    private assignModelValue(option) {
        if (option) {
            if (this.datafield === this.ALLFIELDS) {
                if (this.usekeys || !option.dataObject) {
                    this._model_.push(option.key);
                } else {
                    this._model_.push(option.dataObject);
                }
            } else {
                this._model_.push(option.key);
            }
        } else {
            assignModelForMultiSelect(this.displayOptions, this.datafield, this.modelProxy, this._model_, this._isChangedManually, this._dataVal, this.updateValues.bind(this));
        }
        $appDigest();
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

    private constructDisplayOptions() {
        extractDisplayOptions(this.dataset, {
            'datafield': this.datafield,
            'displayfield': this.displayfield,
            'displayexpression': this.displayexpression,
            'usekeys': this.usekeys,
            'orderby': this.orderby
        }, this.onResult.bind(this));
    }

    _onCheckboxLabelClick($event) {
        this.invokeOnTouched();
        this._isChangedManually = true;

        // reset all the isChecked flags.
        _.forEach(this.displayOptions, (dataObj) => dataObj.isChecked = false);

        const inputElements = this.nativeElement.querySelectorAll('input:checked');
        this._model_ = [];

        _.forEach(inputElements, ($el) => {
            // set isChecked flag for displayOptions.
            const checkedDisplayOption = updateCheckedValue($el.value, this.displayOptions);
            this.assignModelValue(checkedDisplayOption);
        });

        this.invokeOnChange(this.datavalue);
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
            case 'selectedvalues':
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
