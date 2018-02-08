import { Directive, ElementRef, Injector, ChangeDetectorRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './page.props';

registerProps();

const WIDGET_CONFIG = {widgetType: 'wm-page', hasTemplate: false};

@Directive({
    selector: '[wmPage]'
})
export class PageDirective extends BaseComponent {

    onPropertyChange(key, nv, ov) {
        if (key === 'pagetitle') {
            this.titleService.setTitle(nv);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private titleService: Title) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }
}
