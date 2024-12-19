import {AfterViewChecked, Component, ElementRef, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR, NgModel} from '@angular/forms';

import {provideAs, provideAsWidgetRef} from '@wm/components/base';

import {registerProps} from './textarea.props';
import {BaseInput} from '../text/base/base-input';

const WIDGET_CONFIG = {
    widgetType: 'wm-textarea',
    hostClass: 'app-input-wrapper'
};

@Component({
    selector: 'wm-textarea',
    templateUrl: './textarea.component.html',
    standalone:false,
    providers: [
        provideAs(TextareaComponent, NG_VALUE_ACCESSOR, true),
        provideAs(TextareaComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(TextareaComponent)
    ]
})
export class TextareaComponent extends BaseInput implements AfterViewChecked {
    static initializeProps = registerProps();
    public required: boolean;
    public maxchars: number;
    public disabled: boolean;
    public name: string;
    public readonly: boolean;
    public conditionalclass: any;
    public conditionalstyle: any;
    public tabindex: any;
    public placeholder: any;
    public shortcutkey: string;
    public autofocus: boolean;
    public hint: string;
    public arialabel: string;
    public limitdisplaytext: string;
    public charlength: number = 0;

    @ViewChild('textarea', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel) ngModel: NgModel;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }

    public onInputChange() {
        this.charlength = this.inputEl.nativeElement.value.length;
    }
    ngAfterViewChecked(): void {
        this.charlength = this.inputEl.nativeElement.value.length;
      }
}
