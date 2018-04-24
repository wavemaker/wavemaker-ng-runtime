import { Component, forwardRef, Injector } from '@angular/core';

import { $appDigest, isEqualWithFields, setCSS } from '@wm/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { BaseFormComponent } from '../base/base-form.component';
import { registerProps } from './switch.props';
import { getOrderedDataSet } from '../../../utils/form-utils';
import { getControlValueAccessor, invokeEventHandler } from '../../../utils/widget-utils';

declare const _, $;

const DEFAULT_CLS = 'app-switch';
const WIDGET_CONFIG = {widgetType: 'wm-switch', hostClass: DEFAULT_CLS};

const toOptionsObjFromString = str => {
    return {
        'value': str,
        'label': str
    };
};

enum DatasetType {
    NONE,
    COMMA_SEP_STRING,
    ARRAY_STRINGS,
    ARRAY_OBJECTS
}

registerProps();

@Component({
    selector: 'div[wmSwitch]',
    templateUrl: './switch.component.html',
    providers: [
        getControlValueAccessor(SwitchComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => SwitchComponent)}
    ]
})
export class SwitchComponent extends BaseFormComponent {

    _model;
    datafield;
    options = [];
    compareby;
    selected: any = {};
    orderby;
    disabled;
    dataset;
    displayfield;
    iconclass;
    required;
    private oldVal;
    private datasetType;
    private btnwidth;

    set datavalue(val) {
        this._model_ = val;
    }

    get datavalue() {
        return this._model_;
    }

    constructor(inj: Injector, ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'dataset':
                this.updateSwitchOptions();
                break;
        }
    }

    onStyleChange(key, newVal, oldVal) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', newVal ? 'auto' : '');
        }
    }

    private setSelectedValue() {
        const options = this.options;
        // If _model_ is defined and is not empty string, then set selected index (_model_ can be 0)
        if (!_.isUndefined(this._model_) && _.trim(this._model_).length) {
            options.some( (opt, index) => {
                if (this.datafield === 'All Fields' && this.compareby && this.compareby.length) {
                    if (isEqualWithFields(opt, this._model_, this.compareby)) {
                        this.selected.index = index;
                        return true;
                    }
                    return false;
                }
                if (_.isEqual(this._model_, opt)
                    || this._model_ === opt[this.datafield]
                    || this._model_ === opt.value) {

                    this.selected.index = index;

                    return true;
                }
            });
        } else {
            // If no value is provided, set first value as default if options are available else set -1 ie no selection
            if (this.options && this.options.length) {
                this.selectOptAtIndex(0);
            } else {
                this.selected.index = -1;
            }
        }
    }

    private updateSwitchOptions() {
        let options = [],
        dataset = this.dataset;

        this.selected.index = -1;
        this.datasetType = DatasetType.NONE;
        dataset = dataset ? dataset.data || dataset : [];

        if (typeof dataset === 'string') { // comma separated strings
            options = dataset.split(',').map(_.trim).map(toOptionsObjFromString);
            this.datasetType = DatasetType.COMMA_SEP_STRING;
        } else if (_.isObject(dataset)) { // array or object
            if (_.isArray(dataset)) { // array
                dataset = getOrderedDataSet(dataset, this.orderby);
                if (_.isString(dataset[0])) { // array of strings
                    options = dataset.map(_.trim).map(toOptionsObjFromString);
                    this.datasetType = DatasetType.ARRAY_STRINGS;
                } else if (_.isObject(dataset[0]) && !_.isArray(dataset[0])) { // array of objects
                    options = dataset;
                    this.datasetType = DatasetType.ARRAY_OBJECTS;
                }
            }
        }

        if (options.length) {
            this.btnwidth = (100 / options.length);
            setCSS(this.nativeElement.querySelector('.app-switch-overlay') as HTMLElement, 'width', this.btnwidth + '%');
        }

        this.options = options;

        this.setSelectedValue();
        this.updateHighlighter(true);
        this.oldVal = this.datavalue;
        $appDigest();
    }

    private updateHighlighter(skipAnimation?) {
        const handler = $(this.nativeElement).find('span.app-switch-overlay');
        let left,
            index = this.selected.index;
        if (index === undefined || index === null) {
            index = -1;
        }
        left = index * this.btnwidth;
        if (skipAnimation) {
            handler.css('left', left + '%');
        } else {
            handler.animate({
                left: left + '%'
            }, 300);
        }
    }

    get _model_() {
        return this._model;
    }

    set _model_(val) {
        this._model = val;
        this.setSelectedValue();
        setTimeout(() => {
            this.updateHighlighter(true);
        }, 130);
        this.invokeOnChange(val);
    }

    private selectOptAtIndex($index) {
        const opt = this.options[$index];
        if (this.datasetType === DatasetType.ARRAY_OBJECTS) {
            if (this.datafield) {
                if (this.datafield === 'All Fields') {
                    this._model_ = opt;
                } else {
                    this._model_ = opt[this.datafield];
                }
            }
        } else {
            this._model_ = opt.value;
        }
    }

    selectOpt($event, $index) {

        this.invokeOnTouched();
        $event.preventDefault();

        if (this.disabled) {
            return;
        }

        if (this.selected.index === $index) {
            if (this.options.length === 2) {
                $index = $index === 1 ? 0 : 1;
            } else {
                return;
            }
        }
        this.selected.index = $index;

        this.selectOptAtIndex($index);

        invokeEventHandler(this, 'change', {$event, newVal: this.datavalue, oldVal: this.oldVal});

        this.oldVal = this.datavalue;

        $appDigest();
    }

    reset() {
        if (this.options.length > 0) {
            this.datavalue = this.options[0].value;
            this.selected.index = 0;
        }
    }
}
