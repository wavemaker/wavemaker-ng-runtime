import { AfterViewInit, Component, ElementRef, Injector, ViewChild } from '@angular/core';

import { styler } from '../../framework/styler';
import { registerProps } from './select.props';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';

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
export class SelectComponent extends DatasetAwareFormComponent implements AfterViewInit {

    public readonly;

    @ViewChild('select', {read: ElementRef}) selectEl: ElementRef;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        this.acceptsArray = true;
    }

    onSelectValueChange($event) {
        this.invokeOnTouched();
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
    }

    onPropertyChange(key, nv, ov?) {
        super.onPropertyChange(key, nv, ov);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.selectEl.nativeElement as HTMLElement, this);
    }

}
