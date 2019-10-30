import { AfterContentInit, ContentChildren, Directive, Injector, NgZone, OnDestroy, OnInit, QueryList } from '@angular/core';

import { CarouselComponent, SlideComponent } from 'ngx-bootstrap';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './carousel.props';
import { CarouselAnimator } from './carousel.animator';
import { createArrayFrom } from '../../../utils/data-utils';

declare const _;

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-carousel'
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

    constructor(public component: CarouselComponent, inj: Injector, private ngZone: NgZone) {
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
        setTimeout(() => {
            this.animator = new CarouselAnimator(this, this.interval, this.ngZone);
        }, 50);
    }

    private setupHandlers() {
        this.slides.changes.subscribe( slides => {
            this.stopAnimation();
            this.onSlidesRender(slides);
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

    }

    // on property change handler
    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'dataset') {
            this.onDataChange(nv);
        } else if (key === 'controls') {
            // For showing controls
            this.navigationClass = navigationClassMap[this.controls];
        }  else if (key === 'animation' || key === 'animationinterval') {
            this.animation === 'none' ? this.stopAnimation() :  this.startAnimation();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
