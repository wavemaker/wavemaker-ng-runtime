import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';

import { registerProps } from './segment-content.props';
import { SegmentedControlComponent } from '../segmented-control.component';

registerProps();

const DEFAULT_CLS = 'app-segment-content clearfix';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-segment-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmSegmentContent]',
    templateUrl: './segment-content.component.html',
    providers: [
        provideAsWidgetRef(SegmentContentComponent)
    ]
})
export class SegmentContentComponent extends StylableComponent {

    constructor(private segmentedControl: SegmentedControlComponent, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        segmentedControl.addContent(this);
        // TODO:  On demand load
        this.invokeEventCallback('load');
        this.invokeEventCallback('ready');
    }
}
