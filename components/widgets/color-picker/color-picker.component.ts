import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Output } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './color-picker.props';

const DEFAULT_CLS = 'input-group app-colorpicker';
const WIDGET_CONFIG = {widgetType: 'wm-colorpicker', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmColorPicker]',
    templateUrl: './color-picker.component.html'
})

export class ColorPickerComponent extends BaseComponent {

    @Output() change = new EventEmitter();

    oldVal;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    onChange($event) {
        this.change.emit({$event, $isolateScope: this, newVal: $event, oldVal: this.oldVal});
        this.oldVal = $event;
    }
}
