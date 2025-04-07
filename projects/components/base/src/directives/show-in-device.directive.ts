import {Directive, Inject, Injector, Input, OnDestroy, Optional, TemplateRef, ViewContainerRef} from '@angular/core';
import {isLargeTabletLandscape, isLargeTabletPortrait} from '@wm/core';
import {extend} from "lodash-es";

@Directive({
  standalone: true,
    selector: '[wmShowInDevice]'
})
export class ShowInDeviceDirective implements OnDestroy {
    private readonly context = {};
    private devices;
    private embeddedView;
    constructor(
        private viewContainerRef: ViewContainerRef,
        inj: Injector,
        private templateRef: TemplateRef<any>,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        extend(this.context, (inj as any)._lView[8], explicitContext);

        window.addEventListener('resize', this.onResize.bind(this));
    }
    @Input() set wmShowInDevice(devices) {
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

        const lgWidth = getComputedStyle(document.documentElement).getPropertyValue('--screen-lg') || '1200px';
        const mdWidth = getComputedStyle(document.documentElement).getPropertyValue('--screen-md') || '992px';
        const smWidth = getComputedStyle(document.documentElement).getPropertyValue('--screen-sm') || '768px';
        const lgTabLandScapeWidth = getComputedStyle(document.documentElement).getPropertyValue('--screen-lg-tab-landscape') || '1366px';
        const lgTabPortraitWidth = getComputedStyle(document.documentElement).getPropertyValue('--screen-lg-tab-portrait') || '1024px';
        const lgWidthMin = parseFloat(lgWidth)-1;
        const lgUnit =  lgWidthMin + "px";
        const mdWidthMin = parseFloat(mdWidth)-1;
        const mdUnit = mdWidthMin + "px";
        const smWidthMin = parseFloat(smWidth)-1;
        const smUnit = smWidthMin + "px";
        if (
            (this.devices.indexOf('lg') > -1 && window.matchMedia("(min-width: "+lgWidth+")").matches && !isLargeTabletLandscape(lgTabLandScapeWidth, lgTabPortraitWidth))
            ||  (this.devices.indexOf('md') > -1 && (isLargeTabletLandscape(lgTabLandScapeWidth, lgTabPortraitWidth) || (window.matchMedia("(min-width: "+mdWidth+") and (max-width: "+lgUnit +")").matches && !isLargeTabletPortrait(lgTabLandScapeWidth, lgTabPortraitWidth))))
            ||  (this.devices.indexOf('sm') > -1 && (window.matchMedia("(min-width: "+smWidth+") and (max-width: "+mdUnit+")").matches || isLargeTabletPortrait(lgTabLandScapeWidth, lgTabPortraitWidth)))
            ||  (this.devices.indexOf('xs') > -1 && window.matchMedia("(max-width: "+smUnit+")").matches)
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
