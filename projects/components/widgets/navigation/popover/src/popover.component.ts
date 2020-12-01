import { AfterViewInit, Component, ContentChild, ElementRef, Inject, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

import { PopoverDirective } from 'ngx-bootstrap/popover';

import { addClass, App, setAttr, setCSSFromObj, findRootContainer, adjustContainerPosition, adjustContainerRightEdges} from '@wm/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, styler, StylableComponent, provideAsWidgetRef, AUTOCLOSE_TYPE, getContainerTargetClass } from '@wm/components/base';

import { registerProps } from './popover.props';

declare const _, $;

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

export class PopoverComponent extends StylableComponent implements OnInit, AfterViewInit {
    static initializeProps = registerProps();

    public event: string;
    public isOpen = false;
    private closePopoverTimeout;
    public readonly popoverContainerCls;
    private keyEventPlugin;
    public canPopoverOpen = true;
    private Widgets;
    private Variables;
    private Actions;

    public interaction: string;
    public popoverarrow: boolean;
    public popoverwidth: string;
    public popoverheight: string;
    public contentanimation: string;
    public contentsource: string;
    public content: string;
    public popoverplacement: string;
    public outsideclick: boolean;
    public autoclose: string;

    public class: string;
    public title: string;
    public tabindex: any;
    public name: string;
    public adaptiveposition:boolean;
    public containerTarget: string;

    @ViewChild(PopoverDirective) private bsPopoverDirective;
    @ViewChild('anchor', { static: true }) anchorRef: ElementRef;
    @ContentChild(TemplateRef) popoverTemplate;
    @ContentChild('partial') partialRef;

    constructor(inj: Injector, private app: App, @Inject(EVENT_MANAGER_PLUGINS) evtMngrPlugins) {
        super(inj, WIDGET_CONFIG);

        // KeyEventsPlugin
        this.keyEventPlugin = evtMngrPlugins[1];
        this.popoverContainerCls = `app-popover-${this.widgetId}`;
    }

    // This mehtod is used to show/open the popover. This refers to the same method showPopover.
    public open() {
        this.showPopover();
    }

    // This mehtod is used to hide/close the popover.
    public close() {
        this.isOpen = false;
    }

    // Trigger on hiding popover
    public onHidden() {
        this.invokeEventCallback('hide', {$event: {type: 'hide'}});
    }

    private setFocusToPopoverLink() {
        setTimeout(() => this.anchorRef.nativeElement.focus(), 10);
    }

    private adjustPopoverArrowPosition(popoverElem, popoverLeftShift) {
        this.bsPopoverDirective._popover._ngZone.onStable.subscribe(() => {
            popoverElem.find('.popover-arrow').css('left', popoverLeftShift + 'px');
        });
    }

    private calculatePopoverPostion(element) {

        const popoverElem = $(element);
        let popoverLeft =  popoverElem.offset().left;
        const popoverWidth = popoverElem[0].offsetWidth;
        const viewPortWidth = $(window).width();
        const parentDimesion = this.anchorRef.nativeElement.getBoundingClientRect();
        // Adjusting popover position, if it is not visible at left side
        if (popoverLeft < 0) {
            adjustContainerPosition(popoverElem, this.nativeElement, this.bsPopoverDirective._popover);
            const popoverLeftShift = 4;
            const arrowLeftShift = (parentDimesion.left + (parentDimesion.width / 2)) - popoverLeftShift;
            this.adjustPopoverArrowPosition(popoverElem, arrowLeftShift);
        }
        // Adjusting popover position, if it is not visible at right side
        if (popoverLeft + popoverWidth > viewPortWidth) {
            adjustContainerRightEdges(popoverElem, this.nativeElement, this.bsPopoverDirective._popover);
            setTimeout(() => {
                popoverLeft = popoverElem.offset().left;
                const popoverLeftAdjust = (popoverLeft + popoverWidth) - viewPortWidth;
                const popoverLeftShift =  popoverLeft - popoverLeftAdjust;
                let arrowLeftShift ;
                if(popoverLeft<=100){
                    arrowLeftShift =  (parentDimesion.left + (parentDimesion.width / 2)) - popoverLeft;
                }else{
                    arrowLeftShift = (parentDimesion.left + (parentDimesion.width / 2)) - popoverLeftShift;
                }
                if(viewPortWidth > 500){
                    arrowLeftShift += 30;
                }
               this.adjustPopoverArrowPosition(popoverElem, arrowLeftShift);
            });
        }
    }

    // Trigger on showing popover
    public onShown() {
        const root = findRootContainer(this.$element);
        // if page styles have to be applied to popover then popover has to be child of page element.
        if (root) {
            $('body > popover-container').wrap('<' + root + '/>');
        }

        if (activePopover && activePopover.isOpen) {
            activePopover.isOpen = false;
        }

        activePopover = this;
        activePopover.isOpen = true;

        const popoverContainer  = document.querySelector(`.${this.popoverContainerCls}`) as HTMLElement;
        setCSSFromObj(popoverContainer, {
            height: this.popoverheight,
            minWidth: this.popoverwidth,
            width: this.popoverwidth
        });
        if (!this.popoverarrow) {
            addClass(popoverContainer.querySelector('.arrow') as HTMLElement, 'hidden');
        }
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
            this.setFocusToPopoverLink();
            deRegister();
        });
        const popoverStartBtn: HTMLElement = popoverContainer.querySelector('.popover-start');
        const popoverEndBtn: HTMLElement = popoverContainer.querySelector('.popover-end');
        popoverStartBtn.onkeydown = (event) => {
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            // Check for Shift+Tab key
            if (action === 'shift.tab') {
                this.bsPopoverDirective.hide();
                this.setFocusToPopoverLink();
            }
        };
        popoverEndBtn.onkeydown = (event) => {
            const action = this.keyEventPlugin.constructor.getEventFullKey(event);
            // Check for Tab key
            if (action === 'tab') {
                this.bsPopoverDirective.hide();
                this.setFocusToPopoverLink();
            }
        };

        //Whenever autoclose property is set to 'always', adding the onclick listener to the popover container to close the popover.
        if (this.autoclose === AUTOCLOSE_TYPE.ALWAYS) {
            popoverContainer.onclick = () => this.close();
        }

        setAttr(popoverContainer, 'tabindex', 0);
        setTimeout(() => popoverStartBtn.focus(), 50);
        // Adjusting popover position if the popover placement is top or bottom
        setTimeout( () => {
            if (!this.adaptiveposition ) {
                this.calculatePopoverPostion(popoverContainer);
            }
            // triggering onload and onshow events after popover content has rendered
            this.triggerPopoverEvents();
        });
    }

    triggerPopoverEvents() {
        if (this.contentsource === 'partial') {
            const cancelSubscription = this.app.subscribe('partialLoaded', (data) => {
                const parEle = this.partialRef.nativeElement;
                let partialScope;

                if (parEle) {
                    partialScope  = parEle.widget;
                    this.Widgets   = partialScope.Widgets;
                    this.Variables = partialScope.Variables;
                    this.Actions   = partialScope.Actions;
                    this.invokeEventCallback('load');
                    this.invokeEventCallback('show', {$event: {type: 'show'}});
                }
                cancelSubscription();
            });
        } else {
            this.Widgets   = this.viewParent.Widgets;
            this.Variables = this.viewParent.Variables;
            this.Actions   = this.viewParent.Actions;
            this.invokeEventCallback('show', {$event: {type: 'show'}});
        }
    }

    private hidePopover() {
        this.closePopoverTimeout = setTimeout(() => this.isOpen = false, 500);
    }

    private showPopover() {
        this.bsPopoverDirective.show();
    }

    onPopoverAnchorKeydown($event) {
        // if there is no content available, the popover should not open through enter key. So checking whether the canPopoverOpen flag is true or not.
        if (!this.canPopoverOpen) {
           return;
        }
        const action = this.keyEventPlugin.constructor.getEventFullKey(event);
        if (action === 'enter') {
            $event.stopPropagation();
            this.showPopover();
        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'class' || key === 'tabindex') {
            return;
        }
        if (key === 'contentsource') {
            // if there is no partial content available, the popover should not open
            if (this.contentsource === 'partial' && !this.content) {
                this.canPopoverOpen = false;
            }
        }
        if (key === 'content' && nv) {
            this.canPopoverOpen = true;
        }
        if (key === 'autoclose') {
            this.outsideclick = (nv === AUTOCLOSE_TYPE.OUTSIDECLICK || nv === AUTOCLOSE_TYPE.ALWAYS) ? true : false;
        }
        super.onPropertyChange(key, nv, ov);
    }

    ngOnInit() {
        super.ngOnInit();
        this.event = eventsMap[this.interaction];
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.anchorRef.nativeElement, this);
        this.containerTarget = getContainerTargetClass(this.nativeElement);
        let parentElemPopover = $(this.nativeElement).parents();
        if (parentElemPopover.closest('[wmTable]').length ||
            parentElemPopover.closest('[wmtabs]').length ||
            parentElemPopover.closest('modal-container').length) {
            this.adaptiveposition = false;
        }
    }
}
