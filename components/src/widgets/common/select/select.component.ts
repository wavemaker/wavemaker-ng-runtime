import { Component, Injector, OnInit } from '@angular/core';

import { styler } from '../../framework/styler';
import { registerProps } from './select.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';

declare const _;

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-select', hostClass: 'app-select-wrapper'};

@Component({
    selector: 'wm-select',
    templateUrl: './select.component.html',
    providers: [
        provideAsNgValueAccessor(SelectComponent),
        provideAsWidgetRef(SelectComponent)
    ]
})
export class SelectComponent extends DatasetAwareFormComponent implements OnInit {

    public readonly;
    private oldValue;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        this.acceptsArray = true;
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.children[0] as HTMLElement, this);
    }

    onSelectValueChange($event) {
        this.invokeOnTouched();
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
    }

    onPropertyChange(key, nv, ov?) {
        super.onPropertyChange(key, nv, ov);
    }

}
