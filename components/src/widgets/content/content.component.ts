import { Component, Injector } from '@angular/core';

import { IStylableComponent } from '../base/framework/types';
import { styler } from '../base/framework/styler';

import { BaseComponent } from '../base/base.component';
import { registerProps } from './content.props';

registerProps();

const DEFAULT_CLS = 'app-content clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmContent]',
    templateUrl: './content.component.html'
})
export class ContentComponent extends BaseComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent);
    }
}
