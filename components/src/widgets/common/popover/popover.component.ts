import { Component, ContentChild, Injector, OnInit, TemplateRef } from '@angular/core';
import { formatStyle } from '@wm/core';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './popover.props';

registerProps();
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-popover'
};

const eventsMap = {
    click : 'click',
    hover : 'mouseenter:mouseleave',
    default : 'click mouseenter:mouseleave'
};

@Component({
    selector: '[wmPopover]',
    templateUrl: './popover.component.html'
})

export class PopoverComponent extends StylableComponent implements OnInit {
    private event: string;
    private popoverAnimation: string;

    public interaction: string;
    public popoverarrow: boolean;
    public popoverwidth: string;
    public popoverheight: string;
    public contentanimation: string;

    @ContentChild(TemplateRef) popoverTemplate;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        this.event = eventsMap[this.interaction];
        this.popoverAnimation = `animated ${this.contentanimation}`;
    }

    // Trigger on hiding popover
    private onHidden() {
        this.invokeEventCallback('hide');
    }

    // Trigger on showing popover
    private onShown() {
        const popover: HTMLElement = document.querySelector('.popover');
        popover.style.height = formatStyle(this.popoverheight, 'px');
        popover.style.width = formatStyle(this.popoverwidth, 'px');
        if (!this.popoverarrow) {
            document.querySelector('.arrow').classList.add('hidden');
        }
        this.invokeEventCallback('show');
    }
}