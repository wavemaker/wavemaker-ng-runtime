import {Component, Injector, Optional} from '@angular/core';

import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './content.props';
import {UserDefinedExecutionContext} from '@wm/core';

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
    static initializeProps = registerProps();

    constructor(inj: Injector, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);

        styler(this.nativeElement, this);
    }
}
