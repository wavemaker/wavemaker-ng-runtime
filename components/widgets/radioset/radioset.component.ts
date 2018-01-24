import { Component, OnInit, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import {
    toString as _toString,
    find as _find
} from 'lodash';
import { addClass } from '@utils/dom';
import { BaseComponent } from '../base/base.component';
import { initWidget } from '../../utils/init-widget';
import { styler } from '@utils/styler';
import { registerProps } from './radioset.props';
import { updatedCheckedValues, setCheckedAndDisplayValues, extractDisplayOptions, assignModelForSelected, updateCheckedValue } from '../../utils/form-utils';
import { debounce } from '@utils/utils';
import { $appDigest } from '@utils/watcher';

registerProps();

const WIDGET_TYPE = 'wm-radioset';
const DEFAULT_CLS = '';

/**
 * The radioset component
 * Radioset is arrangement of radio widgets grouped together.
 * Example of usage:
 * <example-url>http://localhost:4200/radioset</example-url>
 *
 */
@Component({
    selector: 'wm-radioset',
    templateUrl: './radioset.component.html'
})
export class RadiosetComponent extends BaseComponent implements OnInit {
    class = '';
    width;
    height;
    margin;
    required;


    public displayOptions: any[];
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

    get _model_() {
        return this.__model;
    }

    set _model_(val) {
        this.__model = val;
        this.modelProxy = updatedCheckedValues(this.displayOptions, val, this.modelProxy, this.usekeys);
        this.displayValue = setCheckedAndDisplayValues(this.displayOptions, this.modelProxy);
    }

    /**
     * This property can be used to set the value of the component.
     * */
    set datavalue(val) {
        this._model_ = val;
    }

    get datavalue() {
        return this._model_;
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

        this.assignModelValue(undefined);
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
            this._model_ = assignModelForSelected(this.displayOptions, this._model_, this.modelProxy,
                this.datafield, this._isChangedManually);
        }

        $appDigest();
    }

    /**
     * On click of the option, update the datavalue
     */
    _onRadioLabelClick($event, radioOption) {
        if (this.disabled || this.readonly) {
            return;
        }

        this._isChangedManually = true;

        const dataObj = _find(this.displayOptions, {'isChecked': true});
        let checkedDisplayOption;

        // RadioOption should not be deselected when clicked again. Model and display value remains the same.
        if (dataObj && (_toString(radioOption) === _toString(dataObj.key))) {
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
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(elRef.nativeElement, elRef.nativeElement, cdr);

        addClass(this.$element, DEFAULT_CLS);

        initWidget(this, WIDGET_TYPE, (<any>inj).elDef, (<any>inj).view);
        styler(this.$element, this);
    }

    ngOnInit() {
    }

}
