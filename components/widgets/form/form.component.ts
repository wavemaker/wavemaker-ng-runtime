import { ChangeDetectorRef, Component, ElementRef, HostBinding, Injector, forwardRef, HostListener } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './form.props';
import { getFieldLayoutConfig } from '../../utils/live-utils';
import { $appDigest } from '@utils/watcher';
declare const _;

registerProps();

const DEFAULT_CLS = 'panel app-panel app-form';
const WIDGET_CONFIG = {widgetType: 'wm-form', hostClass: DEFAULT_CLS};

export abstract class ParentForm {
    _ngForm: any;
}

@Component({
    selector: 'form[wmForm]',
    templateUrl: './form.component.html',
    providers: [{ provide: ParentForm, useExisting: forwardRef(() => FormComponent) }]
})
export class FormComponent extends BaseComponent {

    public statusMessage: string;
    public captionAlignClass: string;
    public validationtype: string;
    public captionalign: string;
    public captionposition: string;
    public _widgetClass = '';
    public captionwidth: string;
    public _captionClass = '';
    public _ngForm: FormGroup;
    public isUpdateMode = true;

    @HostBinding('autocomplete') autocomplete: boolean;
    @HostBinding('action') action: string;

    @HostListener('submit') onSubmit() {
        if (this._ngForm.invalid && this.validationtype === 'default') {
            _.forEach(this._ngForm.controls, (control) => control.markAsTouched());
            return;
        }
        this.statusMessage = 'Form Submitted Successfully';
    }

    @HostListener('reset') onReset() {
    }

    onPropertyChange(key, newVal, ov?) {
        switch (key) {
            case 'captionalign':
                this.captionAlignClass = 'align-' + newVal;
                break;
            case 'captionposition':
                this.setLayoutConfig();
                break;
            case 'captionwidth':
                this.setLayoutConfig();
                break;
        }
    }

    private setLayoutConfig() {
        let layoutConfig;
        layoutConfig = getFieldLayoutConfig(this.captionwidth, this.captionposition);
        this._widgetClass = layoutConfig.widgetCls;
        this._captionClass = layoutConfig.captionCls;

        $appDigest();
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private fb: FormBuilder) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);

        this._ngForm = fb.group({});
    }
}
