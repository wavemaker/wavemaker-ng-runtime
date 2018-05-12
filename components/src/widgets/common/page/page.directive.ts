import { Directive, Injector } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './page.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';


registerProps();

const DEFAULT_CLS = 'app-page container';
const WIDGET_CONFIG = {widgetType: 'wm-page', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPage]',
    providers: [
        provideAsWidgetRef(PageDirective)
    ]
})
export class PageDirective extends StylableComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'pagetitle') {
            this.titleService.setTitle(nv);
        }
    }

    constructor(inj: Injector, private titleService: Title) {
        super(inj, WIDGET_CONFIG);
    }
}
