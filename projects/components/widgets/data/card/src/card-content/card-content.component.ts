import { WmComponentsModule } from "@wm/components/base";
import {AfterViewInit, Component, ElementRef, Inject, Injector, Optional, ViewChild} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './card-content.props';

const DEFAULT_CLS = 'app-card-content card-body card-block';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card-content',
    hostClass: DEFAULT_CLS
};

@Component({
  standalone: true,
  imports: [WmComponentsModule],
    selector: 'div[wmCardContent]',
    templateUrl: './card-content.component.html',
    providers: [
        provideAsWidgetRef(CardContentComponent)
    ]
})
export class CardContentComponent extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

    @ViewChild('cardContentContainer') private cardContentContainerElRef: ElementRef;

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.cardContentContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
