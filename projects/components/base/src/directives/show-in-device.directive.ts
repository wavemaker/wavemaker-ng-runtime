import {
    Attribute,
    Directive,
    ElementRef,
    ViewContainerRef,
    Inject,
    Input,
    Injector,
    TemplateRef,
    OnDestroy
} from '@angular/core';
import { isLargeTabletLandscape, isLargeTabletPortrait } from '@wm/core';

import { WidgetRef } from '../widgets/framework/types';
import { BaseComponent } from '../widgets/common/base/base.component';
declare const _, $;

@Directive({
    selector: '[showInDevice]'
})
export class ShowInDeviceDirective implements OnDestroy {
    private readonly context;
    private devices;
    private embeddedView;
    constructor(
        private elRef: ElementRef,
        @Inject(WidgetRef) private widget: BaseComponent,
        private viewContainerRef: ViewContainerRef,
        inj: Injector,
        private templateRef: TemplateRef<any>
    ) {

        this.context = (inj as any).view.context;

        window.addEventListener('resize', this.onResize.bind(this));
    }
    @Input() set showInDevice(devices) {
        this.devices = devices.split(',');
        this.onResize();
    }
    /*
    This function handles the rendering of widgets based on the configured showindevice property
    for the widget.
    1. For Large Screen, create the view only when min-width is 1200px(except when the viewport is an Ipad Pro 13 inch(Landscape))
    2. For Laptop/Tablet Landscape, create the view only when either min-width is 992px and max-width is 1199px(except when the viewport is an Ipad Pro 13 inch(Portrait)), or its an Ipad Pro 13 inch(Landscape))
    3. For Tablet Portrait, create the view only when either min-width is 768px and max-width is 991px, or its an Ipad Pro 13 inch(Portrait))
    4. For Mobile, create the view only when max-width is 767px.
    5. For all, always render the view.
     */
    private onResize($event?) {
        if (
            (this.devices.indexOf('lg') > -1 && window.matchMedia("(min-width: 1200px)").matches && !isLargeTabletLandscape())
        ||  (this.devices.indexOf('md') > -1 && (isLargeTabletLandscape() || (window.matchMedia("(min-width: 992px) and (max-width: 1199px)").matches && !isLargeTabletPortrait())))
        ||  (this.devices.indexOf('sm') > -1 && (window.matchMedia("(min-width: 768px) and (max-width: 991px)").matches || isLargeTabletPortrait()))
        ||  (this.devices.indexOf('xs') > -1 && window.matchMedia("(max-width: 767px)").matches)
        ||  (this.devices.indexOf('all') > -1)) {
            if (!this.embeddedView) {
                this.embeddedView = this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
            }
        } else {
            this.viewContainerRef.clear();
            this.embeddedView = '';
        }

    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.onResize);
    }
}
