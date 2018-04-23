import { Component, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './icon.props';

registerProps();

const DEFAULT_CLS = 'app-icon-wrapper';
const WIDGET_CONFIG = {widgetType: 'wm-icon', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmIcon]',
    templateUrl: './icon.component.html'
})
export class IconComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
