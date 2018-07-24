import { Component, Injector } from '@angular/core';

import { switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './page-content.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-page-content app-content-column';
const WIDGET_CONFIG = {widgetType: 'wm-page-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmPageContent]',
    templateUrl: './page-content.component.html',
    providers: [
        provideAsWidgetRef(PageContentComponent)
    ]
})
export class PageContentComponent extends StylableComponent {

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-md-${nv} col-sm-${nv}`, `col-md-${ov} col-sm-${ov}`);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
