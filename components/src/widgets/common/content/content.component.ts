import { Component, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './content.props';

registerProps();

const DEFAULT_CLS = 'app-content clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmContent]',
    templateUrl: './content.component.html'
})
export class ContentComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
