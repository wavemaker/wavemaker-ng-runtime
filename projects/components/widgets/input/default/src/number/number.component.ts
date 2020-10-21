import { NgModel, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';

import { AbstractI18nService } from '@wm/core';
import { IWidgetConfig, provideAs, provideAsWidgetRef, TrailingZeroDecimalPipe } from '@wm/components/base';

import { registerProps } from './number.props';
import { NumberLocale } from '../text/locale/number-locale';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-number',
    hostClass: 'app-input-wrapper'
};

@Component({
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
    public tabindex: any;
    public shortcutkey: string;
    public autofocus: boolean;
    @ViewChild('input', {static: true}) inputEl: ElementRef;
    @ViewChild(NgModel, {static: true}) ngModel: NgModel;

    constructor(inj: Injector, i18nService: AbstractI18nService, trailingZeroDecimalPipe: TrailingZeroDecimalPipe) {
        super(inj, WIDGET_CONFIG, i18nService, trailingZeroDecimalPipe);
    }
}
