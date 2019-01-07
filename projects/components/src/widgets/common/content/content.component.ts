import { Component, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './content.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-content clearfix';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmContent]',
    templateUrl: './content.component.html',
    providers: [
        provideAsWidgetRef(ContentComponent)
    ]
})
export class ContentComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }
}
