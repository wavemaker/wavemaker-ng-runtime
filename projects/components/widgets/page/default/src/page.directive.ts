import { AfterViewInit, Directive, Injector } from '@angular/core';

import { updateDeviceView, provideAsWidgetRef, StylableComponent } from '@wm/components/base';

import { registerProps } from './page.props';

const DEFAULT_CLS = 'app-page container';
const WIDGET_CONFIG = {widgetType: 'wm-page', hostClass: DEFAULT_CLS};

@Directive({
    selector: '[wmPage]',
    providers: [
        provideAsWidgetRef(PageDirective)
    ],
    exportAs: 'wmPage'
})
export class PageDirective extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            updateDeviceView(this.nativeElement, this.getAppInstance().isTabletApplicationType);
        }, 1);
    }
}
