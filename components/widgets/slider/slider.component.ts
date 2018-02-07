import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './slider.props';

const WIDGET_CONFIG = {widgetType: 'wm-slider', hasTemplate: true};

registerProps();

@Component({
    selector: 'wm-slider',
    templateUrl: './slider.component.html'
})
export class SliderComponent extends BaseComponent  {

    oldVal;
    datavalue;

    @Output() change = new EventEmitter();

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    _ngOnInit() {
        styler(this.$element, this);
    }

    onChange($event) {
        this.change.emit({$event, $isolateScope: this, newVal: this.datavalue, oldVal: this.oldVal});
        this.oldVal = this.datavalue;
    }
}
