import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR, NgModel} from '@angular/forms';
import {Component, ElementRef, EventEmitter, Inject, Injector, Optional, Output, ViewChild} from '@angular/core';

import {AbstractI18nService} from '@wm/core';
import {IWidgetConfig, provideAs, provideAsWidgetRef, TrailingZeroDecimalPipe} from '@wm/components/base';

import {registerProps} from './number.props';
import {NumberLocale} from '../text/locale/number-locale';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-number',
    hostClass: 'app-input-wrapper'
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
    selector: '[wmNumber]',
    templateUrl: './number.component.html',
    providers: [
        provideAs(NumberComponent, NG_VALUE_ACCESSOR, true),
        provideAs(NumberComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(NumberComponent)
    ]
})
export class NumberComponent extends NumberLocale {
    static initializeProps = registerProps();

    public required: boolean;
    public regexp: string;
    public disabled: boolean;
    public name: string;
    public hint: string;
    public arialabel: string;
    public tabindex: any;
    public conditionalclass: any;
    public conditionalstyle: any;
    public shortcutkey: string;
    public autofocus: boolean;
    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel, {static: true}) ngModel: NgModel;
    @Output() wmblur = new EventEmitter<{ [key: string]: any }>();
    @Output() wmfocus = new EventEmitter<{ [key: string]: any }>();
 
    constructor(inj: Injector, i18nService: AbstractI18nService, trailingZeroDecimalPipe: TrailingZeroDecimalPipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, i18nService, trailingZeroDecimalPipe, explicitContext);
    }
}
