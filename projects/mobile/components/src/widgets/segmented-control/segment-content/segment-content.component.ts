import { AfterViewInit, Component, Injector } from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';

import { registerProps } from './segment-content.props';
import { SegmentedControlComponent } from '../segmented-control.component';

registerProps();

declare const _;

const DEFAULT_CLS = 'app-segment-content clearfix';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-segment-content', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmSegmentContent]',
    templateUrl: './segment-content.component.html',
    providers: [
        provideAsWidgetRef(SegmentContentComponent)
    ]
})
export class SegmentContentComponent extends StylableComponent implements AfterViewInit {
    private loadmode: string;
    public compile = false;
    private loaddelay: number;

    constructor(private segmentedControl: SegmentedControlComponent, inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        segmentedControl.addContent(this);
    }

    public ngAfterViewInit() {
        // load the content on demand when loadmode is not specified
        if (!this.loadmode) {
            this.loadContent(true);
        }
    }

    public navigate() {
        this.segmentedControl.showContent(this);
    }

    // sets the compile flag to load the content
    private _loadContent() {
        if (!this.compile) {
            this.compile = true;
            this.invokeEventCallback('ready');
        }
    }

    public loadContent(defaultLoad) {
        if (this.loadmode === 'after-delay' || defaultLoad) {
            setTimeout(this._loadContent.bind(this), defaultLoad ? 0 : this.loaddelay);
        } else {
            this._loadContent();
        }
    }
}
