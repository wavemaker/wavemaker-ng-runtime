import { Directive, Injector } from '@angular/core';

import { addClass, removeClass, switchClass, toggleClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './left-panel.props';
import { LeftPanelAnimator } from './left-panel.animator';
import { PageDirective } from '../page/page.directive';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-left-panel left-panel-collapsed';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-left-panel',
    hostClass: DEFAULT_CLS
};

export enum AnimationType {
    SLIDE_IN = 'slide-in',
    SLIDE_OVER = 'slide-over'
}

@Directive({
    selector: '[wmLeftPanel]',
    providers: [
        provideAsWidgetRef(LeftPanelDirective)
    ]
})
export class LeftPanelDirective extends StylableComponent {

    public animation: AnimationType;
    public columnwidth: number;
    public expanded: boolean;
    public gestures: string;
    public xscolumnwidth: number;

    public $ele;
    public $page;
    public isTabletApplicationType = false;

    private _destroyCollapseActionListener: () => void;
    private _leftPanelAnimator;

    constructor(private page: PageDirective, inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.$ele = this.$element;
        this.$page = page.$element;
        addClass(this.$page[0], 'left-panel-collapsed-container');
        if (this.columnwidth) {
            this.setLeftPanelWidth(['md', 'sm'], this.columnwidth);
        }
    }

    public collapse(): void {
        addClass(this.nativeElement, 'swipee-transition');
        switchClass(this.nativeElement, 'left-panel-collapsed', 'left-panel-expanded');
        this.expanded = false;
        switchClass(this.$page[0], 'left-panel-collapsed-container', 'left-panel-expanded-container');
        if (this.animation === AnimationType.SLIDE_IN) {
            this.setPageWidthAndPosition(['md', 'sm'], null, this.columnwidth);
            this.setPageWidthAndPosition(['xs'], null, this.xscolumnwidth);
        }
        if (this._destroyCollapseActionListener) {
            this._destroyCollapseActionListener();
        }
        this.page.notify('wmLeftPanel:collapse');
    }

    public expand(): void {
        removeClass(this.nativeElement, 'swipee-transition');
        switchClass(this.nativeElement, 'left-panel-expanded', 'left-panel-collapsed');
        this.expanded = true;
        if (!(this.isTabletApplicationType && this.animation === AnimationType.SLIDE_IN)) {
            this._destroyCollapseActionListener = this.listenForCollapseAction();
        }
        switchClass(this.$page[0], 'left-panel-expanded-container', 'left-panel-collapsed-container');
        if (this.animation === AnimationType.SLIDE_IN) {
            this.setPageWidthAndPosition(['md', 'sm'], this.columnwidth);
            this.setPageWidthAndPosition(['xs'], this.xscolumnwidth);
        }
        this.page.notify('wmLeftPanel:expand');
    }

    public isGesturesEnabled(): boolean {
        return this.gestures === 'on';
    }

    public isVisible(): boolean {
        return this.expanded;
    }

    public onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'animation' :
                if (nv === AnimationType.SLIDE_IN) {
                    removeClass(this.$page[0], 'slide-over-left-panel-container');
                    addClass(this.$page[0], 'slide-in-left-panel-container');
                    this.setPageWidthAndPosition(['md', 'sm'], this.columnwidth);
                    this.setPageWidthAndPosition(['xs'], this.xscolumnwidth);
                } else if (nv === AnimationType.SLIDE_OVER) {
                    removeClass(this.$page[0], 'slide-in-left-panel-container');
                    addClass(this.$page[0], 'slide-over-left-panel-container');
                }
                this._leftPanelAnimator = new LeftPanelAnimator(this);
                switchClass(this.nativeElement, nv, ov);
                break;
            case 'columnwidth':
                this.setLeftPanelWidth(['md', 'sm'], nv, ov);
                if (this.animation === AnimationType.SLIDE_IN) {
                    this.setPageWidthAndPosition(['md', 'sm'], nv, ov);
                }
                break;
            case 'expanded':
                toggleClass(this.nativeElement, 'left-panel-expanded', nv);
                toggleClass(this.nativeElement, 'left-panel-collapsed', !nv);
                break;
            case 'xscolumnwidth':
                this.setLeftPanelWidth(['xs'], nv, ov);
                if (this.animation === AnimationType.SLIDE_IN) {
                    this.setPageWidthAndPosition(['xs'], nv, ov);
                }
                break;
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }

    public  toggle(): void {
        this.$ele.swipeAnimation(this.expanded ? 'gotoLower' : 'gotoUpper');
    }

    private listenForCollapseAction(): () => void {
        const eventName = 'click.leftNavToggle';
        let skipEvent = false;
        this.$ele.on(eventName, () => {
            skipEvent = true;
        });
        this.$page.on(eventName, () =>  {
            if (!skipEvent) {
                this.toggle();
            }
            skipEvent = false;
        });
        return () => {
            this.$ele.off(eventName);
            this.$page.off(eventName);
        };
    }

    private setLeftPanelWidth(devices: string[], newVal: number, oldVal?: number) {
        devices.forEach(device => {
            if (newVal) {
                addClass(this.nativeElement, `col-${device}-${newVal}`);
            }
            if (oldVal) {
                removeClass(this.nativeElement, `col-${device}-${oldVal}`);
            }
        });
    }

    private setPageWidthAndPosition(devices: string[], newVal: number, oldVal?: number) {
        devices.forEach(device => {
            if (newVal) {
                addClass(this.$page[0], `left-panel-container-${device}-${12 - newVal}`);
            }
            if (oldVal) {
                removeClass(this.$page[0], `left-panel-container-${device}-${12 - oldVal}`);
            }
        });
    }
}