import {
    AfterContentInit,
    ContentChildren,
    Directive, Inject,
    Injector,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    QueryList
} from '@angular/core';

import { CarouselComponent, SlideComponent } from 'ngx-bootstrap/carousel';

import { createArrayFrom, IWidgetConfig, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './carousel.props';
import { CarouselAnimator } from './carousel.animator';

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-carousel'
};

const navigationClassMap = {
    indicators: 'hide-navs',
    navs: 'hide-indicators',
    none: 'hide-both'
};

@Directive({
  standalone: true,
    selector: '[wmCarousel]',
    exportAs: 'wmCarousel'
})
export class CarouselDirective extends StylableComponent implements AfterContentInit, OnDestroy, OnInit {
    static initializeProps = registerProps();

    private animator;
    private navigationClass;
    private fieldDefs;
    private interval;

    public animationinterval;
    public animation;
    public controls;
    public currentslide;
    public previousslide;

    @ContentChildren(SlideComponent) slides: QueryList<SlideComponent>;

    constructor(public component: CarouselComponent, inj: Injector, private ngZone: NgZone, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
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

    private startAnimation() {
        if (this.animator) {
            this.animator.interval = this.animationinterval * 1000;
            this.animator.start();
        }
    }

    private onSlidesRender(slides) {
        // if dynamic carousel, initialize the 'currentslide' property as the first object
        if (this.fieldDefs && this.fieldDefs.length) {
            this.currentslide = this.fieldDefs[0];
        }
        if (slides.length) {
            setTimeout(() => {
                this.animator = new CarouselAnimator(this, this.interval, this.ngZone);
            }, 50);
        }
    }

    private setupHandlers() {
        this.slides.changes.subscribe( slides => {
            this.triggerAnimation(slides);
        });
        this.slides.setDirty();
    }

    public onChangeCB(newIndex, oldIndex) {
        // assign current and previous slides on widget. In case of static carousel, fieldDefs will be undefined, hence the check
        this.currentslide = this.fieldDefs && this.fieldDefs[newIndex];
        this.previousslide = this.fieldDefs && this.fieldDefs[oldIndex];
        this.invokeEventCallback('change', {newIndex: newIndex, oldIndex: oldIndex});
    }

    ngAfterContentInit() {
        this.triggerAnimation(this.slides);
        this.setupHandlers();
    }

    ngOnDestroy() {
        this.stopAnimation();
        super.ngOnDestroy();
    }

    // Calculating animation interval if animation is enabled
    setanimationinterval() {
        this.interval = this.animation === 'auto' ? this.animationinterval * 1000 : 0 ;
    }

    triggerAnimation(slides) {
        this.stopAnimation();
        this.onSlidesRender(slides);
    }

    ngOnInit() {
        super.ngOnInit();
         this.setanimationinterval();
        // TODO transition is pending

    }

    // on property change handler
    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'dataset') {
            this.onDataChange(nv);
        } else if (key === 'controls') {
            // For showing controls
            this.navigationClass = navigationClassMap[this.controls];
        }  else if (key === 'animation' || key === 'animationinterval') {
            if (key === 'animationinterval') {
                this.stopAnimation();
                this.setanimationinterval();
            }
            this.animation === 'none' ? this.stopAnimation() :  this.startAnimation();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
