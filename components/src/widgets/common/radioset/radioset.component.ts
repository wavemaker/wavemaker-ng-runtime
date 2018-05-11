import {Component, forwardRef, Injector, OnInit} from '@angular/core';

import {$appDigest, switchClass} from '@wm/core';

import {WidgetRef} from '../../framework/types';
import {styler} from '../../framework/styler';
import {registerProps} from './radioset.props';
import {getControlValueAccessor} from '../../../utils/widget-utils';
import {DatasetAwareFormComponent} from '../base/dataset-aware-form.component';

registerProps();

const DEFAULT_CLS = 'app-radioset list-group';
const WIDGET_CONFIG = {widgetType: 'wm-radioset', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmRadioset]',
    exportAs: 'wmRadioset',
    templateUrl: './radioset.component.html',
    providers: [
        getControlValueAccessor(RadiosetComponent),
        {provide: WidgetRef, useExisting: forwardRef(() => RadiosetComponent)}
    ]
})
export class RadiosetComponent extends DatasetAwareFormComponent implements OnInit {

    public layout = '';
    private oldValue;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.multiple = false;
    }

    /**
     * On click of the option, update the datavalue
     */
    onRadioLabelClick($event, key) {
        this.selectByKey(key);

        this.invokeOnTouched();
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
    }

    onPropertyChange(key, nv, ov?) {
        super.onPropertyChange(key, nv, ov);
        switch (key) {
            case 'selectedvalue':
                this.datavalue = nv;
                break;
            case 'layout':
                switchClass(this.nativeElement, nv, ov);
                break;
        }
    }
}
