import { AfterContentInit, AfterViewInit, Component, ContentChild, ElementRef, Injector, OnInit, TemplateRef, ViewChild, Inject } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { PopoverDirective } from 'ngx-bootstrap';

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
    private keyEventPlugin;

    public interaction: string;
    public popoverarrow: boolean;
    public popoverwidth: string;
    public popoverheight: string;
    public contentanimation: string;
    public contentsource: string;
    public content: string;

    @ViewChild(PopoverDirective) private bsPopoverDirective;
    @ViewChild('anchor') anchorRef: ElementRef;
    @ContentChild(TemplateRef) popoverTemplate;

    constructor(inj: Injector, @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);

        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1].constructor;
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
            const action = this.keyEventPlugin.getEventFullKey(event);
            // Check for Shift+Tab key
            if (action === 'shift.tab') {
                this.isOpen = false;
            }
        };
        popoverEndBtn.onkeydown = (event) => {
            const action = this.keyEventPlugin.getEventFullKey(event);
            // Check for Tab key
            if (action === 'tab') {
                this.isOpen = false;
            }
        };

        setAttr(popoverContainer, 'tabindex', 0);
        setTimeout(() => popoverStartBtn.focus(), 50);
    }

    private hidePopover() {
        this.closePopoverTimeout = setTimeout(() => this.isOpen = false, 500);
    }

    private showPopover() {
        this.bsPopoverDirective.show();
    }

    private onPopoverAnchorKeydown($event) {
        const action = this.keyEventPlugin.getEventFullKey(event);
        if (action === 'enter') {
            this.showPopover();
        }
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

        if ((!this.content && !this.contentsource) || (this.contentsource === 'partial' && !this.content)) {
            this.event = '';
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.anchorRef.nativeElement, this);
    }
}

// todo(swathi) keyboard events
