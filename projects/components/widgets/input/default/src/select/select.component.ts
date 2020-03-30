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
        } else if (key === 'groupby' || key === 'match') {
           this.setGroupData();
        }
        super.onPropertyChange(key, nv, ov);
    }

    /**
     * When caption floating is enabled and placeholder is given, do not show placeholder until user focuses on the field
     * When focused add the placeholder to the option which is selected
     * On blur, remove the placeholder and do not animate the label
     * @param $event event received will be either a blur or focus event
     */
    checkForFloatingLabel($event) {
        const captionEl = $(this.selectEl.nativeElement).closest('.app-composite-widget.caption-floating');
        if (this.placeholder && captionEl.length > 0 && !this.datavalue) {
            if ($event.type === 'focus') {
                $(this.selectEl.nativeElement).find('option:selected').text(this.placeholder);   
            } else {
                $(this.selectEl.nativeElement).find('option:selected').text('');
                captionEl.removeClass('float-active');
            }
        } 
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.groupby) {
            this.setGroupData();
        }
    }
}
