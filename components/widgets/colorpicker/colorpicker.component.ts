import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Output } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './colorpicker.props';

const WIDGET_CONFIG = {widgetType: 'wm-colorpicker', hasTemplate: true};

registerProps();

@Component({
    selector: 'wm-colorpicker',
    templateUrl: './colorpicker.component.html'
})

export class ColorpickerComponent extends BaseComponent {

    @Output() change = new EventEmitter();

    oldVal;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    onChange($event) {
        this.change.emit({$event, $isolateScope: this, newVal: $event, oldVal: this.oldVal});
        this.oldVal = $event;
    }

    _ngOnInit() {
        styler(this.$element, this);
    }
}
