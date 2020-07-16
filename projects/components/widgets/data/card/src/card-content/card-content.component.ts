import { AfterViewInit, Component, ElementRef, Injector, ViewChild } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './card-content.props';

const DEFAULT_CLS = 'app-card-content card-body card-block';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card-content',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: 'div[wmCardContent]',
    templateUrl: './card-content.component.html',
    providers: [
        provideAsWidgetRef(CardContentComponent)
    ]
})
export class CardContentComponent extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

    @ViewChild('cardContentContainer', /* TODO: add static flag */ {static: false}) private cardContentContainerElRef: ElementRef;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.cardContentContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
