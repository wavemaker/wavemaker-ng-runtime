import { Component, ContentChild, Injector, Input, OnInit, TemplateRef } from '@angular/core';
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
    hover : 'mouseenter',
    default : 'click mouseenter'
};

@Component({
    selector: '[wmPopover]',
    templateUrl: './popover.component.html',
    exportAs: 'wmPopover'
})

export class PopoverComponent extends StylableComponent implements OnInit {
    private event: string;
    private popoverAnimation: string;
    private isOpen: boolean = false;
    private timeOut;

    public interaction: string;
    public popoverarrow: boolean;
    public popoverwidth: string;
    public popoverheight: string;
    public contentanimation: string;

    @ContentChild(TemplateRef) popoverTemplate;
    @Input() popoverId;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        this.event = eventsMap[this.interaction];
        this.popoverAnimation = `animated ${this.contentanimation}`;
    }
    // returns classes(animation and popover id) for popover
    getContainerClass() {
       return `${this.popoverAnimation} ${this.popoverId}`;
    }
    // Trigger on hiding popover
    private onHidden() {
        this.invokeEventCallback('hide');
    }

    // Trigger on showing popover
    private onShown() {
        this.isOpen = true;
        const popover: HTMLElement = document.querySelector(`.${this.popoverId}`);
        popover.style.height = formatStyle(this.popoverheight, 'px');
        popover.style.width = formatStyle(this.popoverwidth, 'px');
        if (!this.popoverarrow) {
            document.querySelector('.arrow').classList.add('hidden');
        }
        const popoverContent: HTMLElement = popover.querySelector('.popover-content');
        popoverContent.onkeydown = (event: any) => {
            // Check for Esc key
            if (event.keyCode === 27) {
                this.hidePopover();
            }
        };
        this.invokeEventCallback('show');
        if (this.interaction === 'hover' || this.interaction === 'default') {
            popover.onmouseenter = () => {
                clearTimeout(this.timeOut);
            };
            popover.onmouseleave = () => {
                this.hidePopover();
            };
        }
        const popoverStartBtn: HTMLElement = popover.querySelector('.popover-start');
        popoverStartBtn.focus();
    }

    private popoverEnd(event: any) {
        // Check for Tab key
        if (!event.shiftKey && event.keyCode === 9) {
            this.hidePopover();
        }
    }

    private popoverStart(event: any) {
        // Check for Shift+Tab key
        if (event.shiftKey && event.keyCode === 9) {
            this.hidePopover();
        }
    }

    private hidePopover() {
        this.timeOut = setTimeout(() => {
            this.isOpen = false;
            this.$element.find('a').focus();
        }, 500);
    }
}