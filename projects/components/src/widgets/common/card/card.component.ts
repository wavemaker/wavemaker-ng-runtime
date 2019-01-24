import { AfterViewInit, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './card.props';
import { MenuAdapterComponent } from '../base/menu-adapator.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-card card app-panel';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmCard]',
    templateUrl: './card.component.html',
    providers: [
        provideAsWidgetRef(CardComponent)
    ]
})
export class CardComponent extends MenuAdapterComponent implements OnInit, AfterViewInit {
    public showHeader: boolean;

    public title: string;
    public subheading: string;
    public iconclass: string;
    public iconurl: string;
    public actions: string;

    @ViewChild('cardContainerWrapper') private cardContainerElRef: ElementRef;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.cardContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.INNER_SHELL);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'title' || key === 'subheading' || key === 'iconclass' || key === 'iconurl' || key === 'actions') {
            this.showHeader = !!(this.title || this.subheading || this.iconclass || this.iconurl || this.actions);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}

// Todo(swathi) - menu
