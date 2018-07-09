import { Component, Injector } from '@angular/core';

import { switchClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './radioset.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';

registerProps();

const DEFAULT_CLS = 'app-radioset list-group';
const WIDGET_CONFIG = {widgetType: 'wm-radioset', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmRadioset]',
    exportAs: 'wmRadioset',
    templateUrl: './radioset.component.html',
    providers: [
        provideAsNgValueAccessor(RadiosetComponent),
        provideAsWidgetRef(RadiosetComponent)
    ]
})
export class RadiosetComponent extends DatasetAwareFormComponent {

    public layout = '';

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.multiple = false;
    }

    /**
     * On click of the option, update the datavalue
     */
    onRadioLabelClick($event, key) {
        if (!$($event.target).is('input')) {
            return;
        }

        this.modelByKey = key;

        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'tabindex') {
            return;
        }

        if (key === 'layout') {
            switchClass(this.nativeElement, nv, ov);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
