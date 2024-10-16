import {
    AfterViewInit,
    Component,
    ContentChild,
    ElementRef,
    Inject,
    Injector,
    OnInit,
    Optional,
    TemplateRef,
    ViewChild
} from '@angular/core';

import {PopoverDirective} from 'ngx-bootstrap/popover';

import {
    addClass,
    adjustContainerPosition,
    adjustContainerRightEdges,
    App,
    findRootContainer,
    setCSSFromObj
} from '@wm/core';
import {
    AUTOCLOSE_TYPE,
    getContainerTargetClass,
    IWidgetConfig,
    provideAsWidgetRef,
    StylableComponent,
    styler
} from '@wm/components/base';

import {registerProps} from './popover.props';

declare const $;

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
    public hint: string;
    public arialabel: string;
    public caption: string;
    public badgevalue: string;
    private documentClickHandler: (e: MouseEvent) => void;
    private isClosingProgrammatically = false;
    private static activePopovers: PopoverComponent[] = [];

    @ViewChild(PopoverDirective) private bsPopoverDirective;
    @ViewChild('anchor', { static: true }) anchorRef: ElementRef;
    @ContentChild(TemplateRef) popoverTemplate;
    @ContentChild('partial') partialRef;

    constructor(inj: Injector, private app: App, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        this.popoverContainerCls = `app-popover-${this.widgetId}`;
    }

    private setupDocumentClickHandler() {
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler, true);
        }
    
        this.documentClickHandler = (event: MouseEvent) => {
            if (!this.isOpen) return;
    
            const target = event.target as HTMLElement;
    
            // Check if the clicked element or any of its parents is part of the datepicker, dropdown, or typeahead containers
            const isInsideSpecialContainer = !!(
                target.closest('.bs-datepicker-container') || 
                target.closest(".dropdown-menu")
            );
    
            if (isInsideSpecialContainer) {
                // If the click was inside one of these containers, we do not close the popover
                return;
            }
    
            const clickedPopoverIndex = PopoverComponent.activePopovers.findIndex(popover => {
                const popoverContainer = document.querySelector(`.${popover.popoverContainerCls}`);
                return popoverContainer?.contains(target);
            });
    
            if (clickedPopoverIndex === -1) {
                // Click is outside all popovers
                if (this.outsideclick) {
                    this.closeAllPopovers();
                }
            } else {
                // Click is inside a popover
                this.closeInnerPopovers(clickedPopoverIndex);
            }
        };
    
        document.addEventListener('click', this.documentClickHandler, true);
    }
    

    private closeAllPopovers() {
        PopoverComponent.activePopovers.forEach(popover => {
            if (popover.outsideclick) {
                popover.isClosingProgrammatically = true;
                popover.close();
            }
        });
    }

    private closeInnerPopovers(clickedIndex: number) {
        for (let i = clickedIndex + 1; i < PopoverComponent.activePopovers.length; i++) {
            const popover = PopoverComponent.activePopovers[i];
            if (popover.outsideclick) {
                popover.isClosingProgrammatically = true;
                popover.close();
            }
        }
    }

    private isChildPopover(): boolean {
        return !!$(this.nativeElement).closest('.popover').length;
    }
    // This mehtod is used to show/open the popover. This refers to the same method showPopover.
    public open() {
        this.showPopover();
        if (!PopoverComponent.activePopovers.includes(this)) {
            PopoverComponent.activePopovers.push(this);
        }
    }

    // This mehtod is used to hide/close the popover.
    public close() {
        if (this.isOpen) {
            this.isClosingProgrammatically = true;
            this.isOpen = false;
            this.bsPopoverDirective.hide();
            const index = PopoverComponent.activePopovers.indexOf(this);
            if (index > -1) {
                PopoverComponent.activePopovers.splice(index, 1);
            }
        }
    }

    // Trigger on hiding popover
    public onHidden() {
        if (!this.isChildPopover() || this.isClosingProgrammatically) {
            this.invokeEventCallback('hide', {$event: {type: 'hide'}});
            this.isOpen = false;
            if (activePopover === this) {
                activePopover = null;
            }
        }
        this.isClosingProgrammatically = false;
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
        // Fix for [WMS-25125]: Not closing the existing opened popovers when the autoclose property is DISABLED
        if (!this.isChildPopover()) {
            if (activePopover && activePopover !== this && 
                activePopover.autoclose !== AUTOCLOSE_TYPE.DISABLED) {
                activePopover.isClosingProgrammatically = true;
                activePopover.close();
            }
            activePopover = this;
        }

        this.isOpen = true;
        if (!PopoverComponent.activePopovers.includes(this)) {
            PopoverComponent.activePopovers.push(this);
        }
        const popoverContainer  = document.querySelector(`.${this.popoverContainerCls}`) as HTMLElement;
        if (popoverContainer) {
            popoverContainer.setAttribute('data-popover-id', this.widgetId);
            
            // Add click event listener to stop propagation
            popoverContainer.addEventListener('click', (event: Event) => {
                event.stopPropagation();
            });
        }
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
        if (this.outsideclick) {
            this.setupDocumentClickHandler();
        }
        setTimeout(() => {
            this.anchorRef.nativeElement.removeAttribute('aria-describedby');
        });
        const deRegister = this.eventManager.addEventListener(popoverContainer, 'keydown.esc', () => {
            this.isOpen = false;
            this.setFocusToPopoverLink();
            deRegister();
        });
        const popoverStartBtn: HTMLElement = popoverContainer.querySelector('.popover-start');
        const popoverEndBtn: HTMLElement = popoverContainer.querySelector('.popover-end');
        popoverStartBtn.onkeydown = (event) => {
            // Check for Shift+Tab key
            if (event.shiftKey && event.key === 'Tab') {
                this.bsPopoverDirective.hide();
                event.preventDefault();
                this.setFocusToPopoverLink();
                this.isOpen = false;            }
        };
        popoverEndBtn.onkeydown = (event) => {
            // Check for Tab key
            if (!event.shiftKey && event.key === 'Tab') {
                this.bsPopoverDirective.hide();
                event.preventDefault();
                this.setFocusToPopoverLink();
                this.isOpen = false;            }
        };

        //Whenever autoclose property is set to 'always', adding the onclick listener to the popover container to close the popover.
        if (this.autoclose === AUTOCLOSE_TYPE.ALWAYS) {
            popoverContainer.onclick = () => this.close();
        }

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
        this.isClosingProgrammatically = true;
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
        if ($event.key === 'Enter') {
            $event.stopPropagation();
            $event.preventDefault();
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
        // let parentElemPopover = $(this.nativeElement).parents();
        // if (parentElemPopover.closest('[wmTable]').length ||
        //     parentElemPopover.closest('[wmtabs]').length ||
        //     parentElemPopover.closest('modal-container').length) {
        //     this.adaptiveposition = false;
        // }
    }

    ngOnDetach() {
        // Hide the popover container while attaching the next component as part of page reuse strategy.
        this.bsPopoverDirective.hide();
    }

    OnDestroy() {
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler, true);
        }
        const index = PopoverComponent.activePopovers.indexOf(this);
        if (index > -1) {
            PopoverComponent.activePopovers.splice(index, 1);
        }
    }
}
