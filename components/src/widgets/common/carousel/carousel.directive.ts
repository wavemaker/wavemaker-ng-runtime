import { AfterContentInit, Directive, Injector, OnDestroy, OnInit } from '@angular/core';

import { CarouselComponent } from 'ngx-bootstrap';

import { isPageable } from '@wm/core';

import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './carousel.props';
import { CarouselAnimator } from './carousel.animator';

declare const _;

registerProps();

const DEFAULT_CLS = 'app-carousel carousel';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-carousel',
    hostClass: DEFAULT_CLS
};

const navigationClassMap = {
    indicators : 'hide-navs',
    navs : 'hide-indicators',
    none : 'hide-both'
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

    constructor(public component: CarouselComponent, inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    ngAfterContentInit() {
        setTimeout(() => {
            this.animator = new CarouselAnimator(this, this.interval);
        }, 50);
    }

    ngOnDestroy() {
        if (this.animator) {
            this.animator.stop();
        }
    }

    ngOnInit() {
        super.ngOnInit();

        // Calculating animation interval if animation is enabled
        this.animation === 'auto' ? this.interval = this.animationinterval * 1000 : this.interval = 0 ;
        // TODO transition is pending

        // For showing controls
        this.navigationClass = navigationClassMap[this.controls];
    }

    private onDataChange(newVal) {
        if (newVal.data) {
            // TODO how to identify the incoming value contains the data. The "data" could be a field of an object.
            newVal = newVal.data;
        }

        // If the data is a pageable object, then display the content.
        if (_.isObject(newVal) && isPageable(newVal)) {
            newVal = newVal.content;
        }

        if (_.isObject(newVal) && !_.isArray(newVal)) {
            newVal = [newVal];
        }

        if (_.isString(newVal)) {
            newVal = newVal.split(',');
        }

        if (_.isArray(newVal)) {
            this.fieldDefs = newVal;
        }
    }

    // on property change handler
    onPropertyChange(key, newValue) {
        if (key === 'dataset') {
            this.onDataChange(newValue);
        }
    }
}