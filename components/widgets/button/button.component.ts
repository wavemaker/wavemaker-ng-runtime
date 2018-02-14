import { ChangeDetectorRef, Component, ElementRef, HostBinding, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './button.props';

registerProps();

const DEFAULT_CLS = 'btn app-button';
const WIDGET_CONFIG = {widgetType: 'wm-button', hostClass: DEFAULT_CLS};

@Component({
    selector: 'button[wmButton]',
    templateUrl: './button.component.html'
})
export class ButtonDirective extends BaseComponent {

    @HostBinding('type') type: string = 'button';
    @HostBinding('tabIndex') tabindex: number;
    @HostBinding('disabled') disabled: boolean;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
    }
}
