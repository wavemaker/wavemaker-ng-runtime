import { AfterContentInit, Component, ContentChild, ElementRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { addClass, formatStyle, setAttr, setCSSFromObj } from '@wm/core';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './popover.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-popover'
};

const eventsMap = {
    click: 'click',
    hover: 'mouseenter:click',
    default: 'click mouseenter'
};

let activePopover: PopoverComponent;

@Component({
    selector: 'wm-popover',
    templateUrl: './popover.component.html',
    providers: [
        provideAsWidgetRef(PopoverComponent)
    ]
})

export class PopoverComponent extends StylableComponent implements OnInit, AfterContentInit {
    private event: string;
    private isOpen: boolean = false;
    private closePopoverTimeout;
    private readonly popoverContainerCls;

    public interaction: string;
    public popoverarrow: boolean;
    public popoverwidth: string;
    public popoverheight: string;
    public contentanimation: string;


    @ViewChild('anchor') anchorRef: ElementRef;
    @ContentChild(TemplateRef) popoverTemplate;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        this.popoverContainerCls = `app-popover-${this.widgetId}`;
    }

    // Trigger on hiding popover
    public onHidden() {
        this.invokeEventCallback('hide', {$event: {type: 'show'}});
        this.anchorRef.nativeElement.focus();
    }

    // Trigger on showing popover
    public onShown() {
        if (activePopover && activePopover.isOpen) {
            activePopover.isOpen = false;
        }

        activePopover = this;
        activePopover.isOpen = true;

        const popoverContainer  = document.querySelector(`.${this.popoverContainerCls}`) as HTMLElement;
        setCSSFromObj(popoverContainer, {
            height: formatStyle(this.popoverheight),
            minWidth:  formatStyle(this.popoverwidth)
        });
        if (!this.popoverarrow) {
            addClass(popoverContainer.querySelector('.arrow') as HTMLElement, 'hidden');
        }

        this.invokeEventCallback('show', {$event: {type: 'show'}});

        if (this.interaction === 'hover' || this.interaction === 'default') {

            // do not use addEventListener here
            // attaching the event this way will override the existing event handlers
            popoverContainer.onmouseenter = () => clearTimeout(this.closePopoverTimeout);
            popoverContainer.onmouseleave = () => this.hidePopover();
            this.anchorRef.nativeElement.onmouseenter = () => clearTimeout(this.closePopoverTimeout);
            this.anchorRef.nativeElement.onmouseleave = () => this.hidePopover();
        }

        const deRegister = this.eventManager.addEventListener(popoverContainer, 'keydown.esc', () => {
            this.isOpen = false;
            deRegister();
        });

        setAttr(popoverContainer, 'tabindex', 0);
        setTimeout(() => popoverContainer.focus(), 50);
    }

    private hidePopover() {
        this.closePopoverTimeout = setTimeout(() => this.isOpen = false, 500);
    }

    ngOnInit() {
        super.ngOnInit();
        this.event = eventsMap[this.interaction];
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();

        if (!this.popoverTemplate) {
            this.event = '';
        }
    }
}

// todo(swathi) keyboard events
