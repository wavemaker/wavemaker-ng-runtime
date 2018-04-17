import { ChangeDetectorRef, Component, ElementRef, forwardRef, Injector } from '@angular/core';
import { styler } from '../../utils/styler';
import { registerProps } from './slider.props';
import { getControlValueAccessor, invokeEventHandler } from '../../utils/widget-utils';
import { BaseFormComponent } from '../base/base-form.component';

const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG = {widgetType: 'wm-slider', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSlider]',
    templateUrl: './slider.component.html',
    providers: [getControlValueAccessor(SliderComponent), {
        provide: '@Widget', useExisting: forwardRef(() => SliderComponent)
    }]
})
export class SliderComponent extends BaseFormComponent {

    oldVal;
    datavalue;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    onChange($event) {
        invokeEventHandler(this, 'change', {$event, newVal: this.datavalue, oldVal: this.oldVal});
        this.oldVal = this.datavalue;
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);
    }
}
