import {Component, ElementRef, Injector, OnInit, ViewChild} from '@angular/core';
import {NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';

import {IWidgetConfig, provideAs, provideAsWidgetRef} from '@wm/components/base';
import {registerProps} from './input-text.props';
import {BaseInput} from '../base/base-input';
import { IMaskDirective } from 'angular-imask';

declare const _;

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-input-text',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-input[type="text"], wm-input:not([type]), wm-input[type="password"], wm-input[type="search"], wm-input[type="tel"], wm-input[type="url"]',
    templateUrl: './input-text.component.html',
    providers: [
        provideAs(InputTextComponent, NG_VALUE_ACCESSOR, true),
        provideAs(InputTextComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(InputTextComponent)
    ]
})
export class InputTextComponent extends BaseInput implements OnInit{
    static initializeProps = registerProps();

    public required: boolean;
    public maxchars: number;
    public regexp: string;
    public displayformat: string;
    public disabled: boolean;
    public type: any;
    public name: string;
    public readonly: boolean;
    public tabindex: any;
    public placeholder: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public autocomplete: any;
    public maskVal: any;
    public isFocused: boolean;
    private lazy: boolean = false;

    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;
    @ViewChild('input', {read: IMaskDirective}) imask: IMaskDirective<any>;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    onPropertyChange(key, nv, ov) {
        /*Monitoring changes for styles or properties and accordingly handling respective changes.*/
        switch (key) {
            case 'displayformat':
                this.maskVal = this.displayformat;
                this.checkForDisplayFormat();
                break;
            case 'showdisplayformaton':
                this.lazy = nv === 'keypress' ? true : false;
                break;
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }

    get mask() {
        if (this.displayformat && (!this.placeholder || (this.placeholder && this.isFocused))) {
            return {
                mask: this.maskVal,
                lazy: this.lazy,
                definitions: {
                    '9': /\d/,
                    'A': /[a-zA-Z]/,
                    'a': /[a-z]/,
                    '*': /\w/
                }
            };
        } else {
            return false;
        }
    }

    // show display format on focus or when it has a data value present. Else show the placeholder
    public checkForDisplayFormat($event?) {
        if (this.displayformat) {
            this.isFocused = (($event && $event.type === 'focus') || this.datavalue) ? true : false;
            // Do not show format placeholder when no value is present on blur
            if (!this.isFocused && this.imask && this.imask.maskRef) {
                this.imask.maskRef.updateOptions({ lazy: true });
                // on blur, when no value is present assign maskref to null, as in some cases (where format palceholder starts with pranthesis) the format placeholder is still shown. WMS-20124
                if (!this.datavalue && this.imask.maskRef.value) {
                    this.imask.maskRef.value = this.datavalue;
                }
            } else {
                // when display format is dynamically populated, cursor position is at the end of the format, readjusting the cursor position based on input value
                // Adding timeout, as the below code should be on hold until imask model is generated
                setTimeout(() => {
                    if (this.imask && this.imask.maskRef && this.datavalue && this.datavalue.length + 1 !== this.imask.maskRef.cursorPos) {
                        this.imask.maskRef.updateCursor(this.datavalue.length + 1);
                    }
                }, 50);
            }
        } else if (this.imask && this.imask.maskRef) { // When display format is bound via condition, remove the placeholder when the format is not applicable
            this.imask.maskRef.updateOptions({ lazy: true });
            // when display format is removed assign input value to the datavalue attr. WMS-20124
            this.inputEl.nativeElement.value = this.datavalue;
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.isFocused = !!this.datavalue;
    }
}
