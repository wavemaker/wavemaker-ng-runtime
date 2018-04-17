import { ChangeDetectorRef, Component, ElementRef, forwardRef, Injector, OnInit } from '@angular/core';
import { styler } from '../../utils/styler';
import { registerProps } from './select.props';
import { assignModelForMultiSelect, assignModelForSelected, extractDisplayOptions, setCheckedAndDisplayValues, updatedCheckedValues } from '../../utils/form-utils';
import { removeAttr, setAttr } from '@wm/utils';
import { invokeEventHandler, getControlValueAccessor } from '../../utils/widget-utils';
import { BaseFormComponent } from '../base/base-form.component';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-select', hostClass: 'app-select-wrapper'};

@Component({
    selector: '[wmSelect]',
    templateUrl: './select.component.html',
    providers: [getControlValueAccessor(SelectComponent), {
        provide: '@Widget', useExisting: forwardRef(() => SelectComponent)
    }]
})
export class SelectComponent extends BaseFormComponent implements OnInit {

    public readonly;
    public multiple;
    public displayOptions: any[];
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
    public modelProxy: any;

    private __model;
    private oldValue;

    get _model_() {
        return this.__model;
    }

    set _model_(val) {
        let model;
        this.__model = val;
        model = updatedCheckedValues(this.displayOptions, val, this.modelProxy, this.usekeys);
        this.modelProxy = _.isArray(model) ? model : [model];
        this.displayValue = setCheckedAndDisplayValues(this.displayOptions, this.modelProxy);
        this.invokeOnChange(this.datavalue);
    }

    get datavalue() {
        return this._model_;
    }

    set datavalue(val: any) {
        if (this.multiple) {
            this._model_ = [val];
        } else {
            this._model_ = val;
        }

    }

    onSelectValueChange($event, selectedValue) {
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
        invokeEventHandler(this, 'change', {$event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
    }

    /**
     * This function parses the dataset and extracts the displayOptions from parsed dataset.
     * displayOption will contain datafield as key, displayfield as value.
     */
    private constructDisplayOptions() {
        this.displayOptions = [];
        this.displayOptions = extractDisplayOptions(this.dataset, {
            'datafield': this.datafield,
            'displayfield': this.displayfield,
            'displayexpression': this.displayexpression,
            'usekeys': this.usekeys,
            'orderby': this.orderby
        });

        this.modelProxy = updatedCheckedValues(this.displayOptions, this._model_, this.modelProxy, this.usekeys);
        this.displayValue = setCheckedAndDisplayValues(this.displayOptions, this.modelProxy);

        this.assignModelValue();
    }

    /**
     * function to assign the values to the model variable based on the selectedvalue as provided
     */
    private assignModelValue() {
        if (this.multiple) {
            this._model_ = assignModelForMultiSelect(this.displayOptions, this.datafield, this.modelProxy, this._model_, this._isChangedManually);
        } else {
            this._model_ = assignModelForSelected(this.displayOptions, this._model_, this.modelProxy && this.modelProxy[0],
                this.datafield, this._isChangedManually);
        }
    }

    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'readonly':
                if (nv) {
                    setAttr(this.$element, 'readonly', true);
                } else {
                    removeAttr(this.$element, 'readonly');
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
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    ngOnInit() {
        super.ngOnInit();
        styler(<HTMLElement>this.$element.children[0], this);
    }
}
