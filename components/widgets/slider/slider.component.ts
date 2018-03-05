import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './slider.props';

const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG = {widgetType: 'wm-slider', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSlider]',
    templateUrl: './slider.component.html'
})
export class SliderComponent extends BaseComponent implements OnInit {

    oldVal;
    datavalue;

    @Output() change = new EventEmitter();

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    onChange($event) {
        this.change.emit({$event, $isolateScope: this, newVal: this.datavalue, oldVal: this.oldVal});
        this.oldVal = this.datavalue;
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
