import { AfterContentInit, ContentChildren, Directive, Injector, OnDestroy, OnInit, QueryList } from '@angular/core';

import { CarouselComponent, SlideComponent } from 'ngx-bootstrap';

import { isPageable } from '@wm/core';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './carousel.props';
import { CarouselAnimator } from './carousel.animator';
import { createArrayFrom } from '../../../utils/data-utils';

declare const _;

registerProps();

const DEFAULT_CLS = 'app-carousel carousel';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-carousel',
    hostClass: DEFAULT_CLS
};

const navigationClassMap = {
    indicators: 'hide-navs',
    navs: 'hide-indicators',
    none: 'hide-both'
};

@Directive({
    selector: '[wmCarousel]',
    exportAs: 'wmCarousel'
})
export class CarouselDirective extends StylableComponent implements AfterContentInit, OnDestroy, OnInit {
    private animator;
    private navigationClass;
    private fieldDefs;
    private interval;

    public animationinterval;
    public animation;
    public controls;

    @ContentChildren(SlideComponent) slides: QueryList<SlideComponent>;

    constructor(public component: CarouselComponent, inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    private onDataChange(newVal) {
        this.fieldDefs = createArrayFrom(newVal);
    }

    private stopAnimation() {
        if (this.animator) {
            this.animator.stop();
        }
    }

    private onSlidesRender(slides) {
        setTimeout(() => {
            this.animator = new CarouselAnimator(this, this.interval);
        }, 50);
    }

    private setupHandlers() {
        this.slides.changes.subscribe( slides => {
            this.stopAnimation();
            this.onSlidesRender(slides);
        });
        this.slides.setDirty();
    }

    ngAfterContentInit() {
        this.setupHandlers();
    }

    ngOnDestroy() {
        this.stopAnimation();
        super.ngOnDestroy();
    }

    ngOnInit() {
        super.ngOnInit();

        // Calculating animation interval if animation is enabled
        this.animation === 'auto' ? this.interval = this.animationinterval * 1000 : this.interval = 0 ;
        // TODO transition is pending

        // For showing controls
        this.navigationClass = navigationClassMap[this.controls];
    }

    // on property change handler
    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'dataset') {
            this.onDataChange(nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}