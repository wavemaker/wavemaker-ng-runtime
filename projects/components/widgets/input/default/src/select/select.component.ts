import { AfterViewInit, Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { DataSource, removeAttr, setAttr } from '@wm/core';
import { provideAsWidgetRef, provideAs, styler } from '@wm/components/base';
import { DatasetAwareFormComponent } from '../dataset-aware-form.component';

import { registerProps } from './select.props';

declare const _;

const WIDGET_CONFIG = {widgetType: 'wm-select', hostClass: 'app-select-wrapper'};

@Component({
    selector: 'wm-select',
    templateUrl: './select.component.html',
    providers: [
        provideAs(SelectComponent, NG_VALUE_ACCESSOR, true),
        provideAs(SelectComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(SelectComponent)
    ]
})
export class SelectComponent extends DatasetAwareFormComponent implements AfterViewInit {
    static initializeProps = registerProps();

    public readonly: boolean;
    public placeholder: string;
    public navsearchbar: any;
    public class: any;
    public required: boolean;
    public disabled: boolean;
    public tabindex: any;
    public name: string;
    public autofocus: boolean;

    @ViewChild('select', { static: true, read: ElementRef }) selectEl: ElementRef;

    set datasource(ds) {
        if (ds && ds.execute && ds.execute(DataSource.Operation.IS_BOUND_TO_LOCALE)) {
            this.datavalue = ds.execute(DataSource.Operation.GET_DEFAULT_LOCALE);
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        this.acceptsArray = true;
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.selectEl.nativeElement as HTMLElement, this);
        setTimeout(() => {
            const parentEl = $(this.selectEl.nativeElement).closest('.app-composite-widget.caption-floating');
            if (parentEl.length > 0 && this.multiple) {
                parentEl.addClass('float-active');
            }
        }, 50);
    }

    // Change event is registered from the template, Prevent the framework from registering one more event
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (!_.includes(['blur', 'change'], eventName)) {
            super.handleEvent(this.selectEl.nativeElement, eventName, eventCallback, locals);
        }
    }

    onSelectValueChange($event) {
        if (this.readonly) {
            if (this.placeholder) {
                this.selectEl.nativeElement.value = this.placeholder;
            } else {
                this.selectEl.nativeElement.value = '';
            }
            this.datavalue = (this as any).prevDatavalue;
            return;
        }
        this.invokeOnTouched();
        // invoke on datavalue change.
        this.invokeOnChange(this.datavalue, $event || {}, true);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'required')  {
            this._onChange(this.datavalue);
            return;
        }
        if (key === 'class' ||  key === 'tabindex') {
            return;
        } else if (key === 'readonly') {
             (nv === true) ? setAttr(this.selectEl.nativeElement, 'readonly', 'readonly') : removeAttr(this.selectEl.nativeElement, 'readonly') ;
        } 
        super.onPropertyChange(key, nv, ov);
    }
}
