import { ChangeDetectorRef, Component, ElementRef, forwardRef, Injector } from '@angular/core';
import { styler } from '../../utils/styler';
import { registerProps } from './color-picker.props';
import { getControlValueAccessor, invokeEventHandler } from '../../utils/widget-utils';
import { BaseFormComponent } from '../base/base-form.component';

const DEFAULT_CLS = 'input-group app-colorpicker';
const WIDGET_CONFIG = {widgetType: 'wm-colorpicker', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmColorPicker]',
    templateUrl: './color-picker.component.html',
    providers: [getControlValueAccessor(ColorPickerComponent), {
        provide: '@Widget', useExisting: forwardRef(() => ColorPickerComponent)
    }]
})
export class ColorPickerComponent extends BaseFormComponent {

    oldVal;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    onChange($event) {
        invokeEventHandler(this, 'change', {$event, newVal: $event, oldVal: this.oldVal});
        this.oldVal = $event;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
}
