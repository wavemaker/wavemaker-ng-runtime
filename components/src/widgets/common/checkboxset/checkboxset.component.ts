import {Component, Injector, forwardRef, OnInit} from '@angular/core';

import {switchClass, $appDigest} from '@wm/core';

import {styler} from '../../framework/styler';
import {getControlValueAccessor} from '../../../utils/widget-utils';
import {registerProps} from '../checkboxset/checkboxset.props';
import {DatasetAwareFormComponent} from '../base/dataset-aware-form.component';

registerProps();
const DEFAULT_CLS = 'app-checkboxset list-group';
const WIDGET_CONFIG = {widgetType: 'wm-checkboxset', hostClass: DEFAULT_CLS};
declare const _;

@Component({
    selector: '[wmCheckboxset]',
    exportAs: 'wmCheckboxset',
    templateUrl: 'checkboxset.component.html',
    providers: [getControlValueAccessor(CheckboxsetComponent), {
        provide: '@Widget', useExisting: forwardRef(() => CheckboxsetComponent)
    }]
})

export class CheckboxsetComponent extends DatasetAwareFormComponent implements OnInit {
    public layout = '';

    private oldValue;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.multiple = true;
    }

    onCheckboxLabelClick($event) {
        // construct the _model from the checked elements.
        const inputElements = this.nativeElement.querySelectorAll('input:checked');
        const keys = [];
        _.forEach(inputElements, ($el) => {
            keys.push($el.value);
        });

        // Sets the datavalue from _model_
        this.selectByKey(keys);

        this.invokeOnTouched();
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
    }

    onPropertyChange(key, nv, ov?) {
        super.onPropertyChange(key, nv, ov);
        switch (key) {
            case 'selectedvalues':
                this.datavalue = nv;
                break;
            case 'layout':
                switchClass(this.nativeElement, nv, ov);
                break;
        }
    }

    // Todo: As the datavalue is overridden by angular.
    writeValue() {

    }
}
