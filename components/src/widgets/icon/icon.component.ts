import { Component, Injector } from '@angular/core';

import { styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './icon.props';

registerProps();

const DEFAULT_CLS = 'app-icon-wrapper';
const WIDGET_CONFIG = {widgetType: 'wm-icon', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmIcon]',
    templateUrl: './icon.component.html'
})
export class IconComponent extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent);
    }
}
