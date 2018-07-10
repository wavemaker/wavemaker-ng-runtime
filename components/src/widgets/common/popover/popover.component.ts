import { AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { addClass, setAttr, setCSSFromObj } from '@wm/core';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './popover.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();
const DEFAULT_CLS = 'app-popover-wrapper';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-popover',
    hostClass: DEFAULT_CLS
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

export class PopoverComponent extends StylableComponent implements OnInit, AfterContentInit, AfterViewInit {
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

        this.popoverContainerCls = `app-popover-${this.widgetId}`;
    }

    // Trigger on hiding popover
    public onHidden() {
        this.invokeEventCallback('hide', {$event: {type: 'show'}});
        setTimeout(() => this.anchorRef.nativeElement.focus(), 10);
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
            height: this.popoverheight,
            minWidth: this.popoverwidth
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
        const popoverStartBtn: HTMLElement = popoverContainer.querySelector('.popover-start');
        const popoverEndBtn: HTMLElement = popoverContainer.querySelector('.popover-end');
        popoverStartBtn.onkeydown = (event) => {
            // Check for Shift+Tab key
            if (event.shiftKey && event.keyCode === 9) {
                this.isOpen = false;
            }
        };
        popoverEndBtn.onkeydown = (event) => {
            // Check for Tab key
            if (!event.shiftKey && event.keyCode === 9) {
                this.isOpen = false;
            }
        };

        setAttr(popoverContainer, 'tabindex', 0);
        setTimeout(() => popoverStartBtn.focus(), 50);
    }

    private hidePopover() {
        this.closePopoverTimeout = setTimeout(() => this.isOpen = false, 500);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'class' || key === 'tabindex') {
            return;
        }
        super.onPropertyChange(key, nv, ov);
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

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.anchorRef.nativeElement, this);
    }
}

// todo(swathi) keyboard events
