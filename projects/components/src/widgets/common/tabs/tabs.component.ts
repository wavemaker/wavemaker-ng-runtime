import { AfterContentInit, AfterViewInit, Attribute, Component, ContentChildren, Injector, OnInit, QueryList } from '@angular/core';

import { addClass, appendNode, noop, removeClass } from '@wm/core';

import { TabsAnimator } from './tabs.animator';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './tabs.props';
import { StylableComponent } from '../base/stylable.component';
import { TabPaneComponent } from './tab-pane/tab-pane.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

declare const _, $;

const DEFAULT_CLS = 'app-tabs clearfix';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-tabs',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: 'div[wmTabs]',
    templateUrl: './tabs.component.html',
    providers: [
        provideAsWidgetRef(TabsComponent)
    ]
})
export class TabsComponent extends StylableComponent implements AfterContentInit, OnInit, AfterViewInit {

    public defaultpaneindex: number;

    public transition: string;
    public tabsposition: string;

    private vertical: boolean;
    private activeTab: TabPaneComponent;
    private readonly promiseResolverFn: Function;
    private tabsAnimator: TabsAnimator;

    @ContentChildren(TabPaneComponent) panes: QueryList<TabPaneComponent>;

    constructor(
        inj: Injector,
        @Attribute('transition') _transition: string,
        @Attribute('tabsposition') _tabsPosition: string
    ) {
        // handle to the promise resolver
        let resolveFn: Function = noop;

        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));

        this.transition = _transition;
        this.tabsposition = _tabsPosition;

        this.promiseResolverFn = resolveFn;

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    animateIn (element: HTMLElement) {
        const tabHeader = $(element);
        // when the animation is not present toggle the active class.
        tabHeader.siblings('.active').removeClass('active');
        tabHeader.addClass('active');

        const ul = this.nativeElement.querySelector('ul.nav.nav-tabs');

        // move the tabheader into the viewport
        const $prevHeaderEle = tabHeader.prev();
        if ($prevHeaderEle.length) {
            ul.scrollLeft = $prevHeaderEle[0].offsetLeft;
        } else {
            ul.scrollLeft = 0;
        }
    }

    /**
     * TabPane children components invoke this method to communicate with the parent
     * if the evt argument is defined on-change callback will be invoked.
     */
    public notifyChange(paneRef: TabPaneComponent, evt: Event) {
        if (!this.isSelectableTab(paneRef)) {
            return;
        }

        let headerElement;
        // invoke deselect event callback on the preset active tab
        if (this.activeTab) {
            this.activeTab.deselect();
        }

        // invoke select callback on the selected tab
        paneRef.invokeOnSelectCallback(evt);

        this.activeTab = paneRef.getWidget();

        // invoke change callback if the evt is present, select a tab programmatically will not have the event
        if (evt) {
            this.invokeEventCallback('change', {
                $event: evt,
                newPaneIndex: this.getPaneIndexByRef(paneRef),
                oldPaneIndex: this.getActiveTabIndex()
            });
        }

        if (evt) {
            headerElement = $(evt.target as HTMLElement).closest('li.tab-header');
        } else {
            headerElement = this.nativeElement.querySelector(`li[data-paneid=${paneRef.widgetId}]`);
        }
        this.animateIn(headerElement);

        // this.setTabsLeftPosition(this.getPaneIndexByRef(this.activeTab), this.panes.length);
        if (this.canSlide()) {
            if (!this.tabsAnimator) {
                this.tabsAnimator = new TabsAnimator(this);
                this.tabsAnimator.setGesturesEnabled(this.canSlide());
            }
            this.tabsAnimator.transitionTabIntoView();
        }
    }

    public goToTab(tabIndex) {
        if (this.isValidPaneIndex(tabIndex - 1)) {
            const tab = this.getPaneRefByIndex(tabIndex - 1);
            tab.select();
        }
    }

    private getPaneIndexByRef(paneRef: TabPaneComponent): number {
        return this.panes.toArray().indexOf(paneRef);
    }

    // Returns the active tab index from tabs.
    public getActiveTabIndex(): number {
        return _.findIndex(this.panes.toArray(), {isActive: true});
    }

    private isValidPaneIndex(index: number): boolean {
        return (index >= 0 && index < this.panes.length);
    }

    private getPaneRefByIndex(index: number): TabPaneComponent {
        return this.panes.toArray()[index];
    }

    // returns false if the pane is hidden or disabled
    private isSelectableTab(paneRef: TabPaneComponent): boolean {
        return paneRef.show && !paneRef.disabled;
    }

    private canSlide() {
        return this.transition === 'slide' && !this.vertical;
    }

    private getSelectableTabAfterIndex(index: number): TabPaneComponent {
        for (let i = index + 1; i < this.panes.length; i++) {
            const pane = this.getPaneRefByIndex(i);
            if (this.isSelectableTab(pane)) {
                return pane;
            }
        }
    }

    private getSelectableTabBeforeIndex(index: number): TabPaneComponent {
        for (let i = index - 1; i >= 0; i--) {
            const pane = this.getPaneRefByIndex(i);
            if (this.isSelectableTab(pane)) {
                return pane;
            }
        }
    }

    // select next tab relative to the current active tab
    public next() {
        const pane = this.getSelectableTabAfterIndex(this.getActiveTabIndex());
        if (pane) {
            pane.select();
        }
    }

    // select prev tab relative to the current active tab
    public prev() {
        const pane = this.getSelectableTabBeforeIndex(this.getActiveTabIndex());
        if (pane) {
            pane.select();
        }
    }

    /**
     * this method will be invoked during the initialization of the component and on defaultpaneindex property change,
     * if the provided defaultpaneindex is not valid, find the first pane index which can be shown and select it
     */
    private selectDefaultPaneByIndex(index: number) {
        if (!this.isValidPaneIndex(index)) {
            return;
        }

        let paneRef = this.getPaneRefByIndex(index);
        if (!this.isSelectableTab(paneRef)) {
            paneRef = this.getSelectableTabAfterIndex(0);
        }
        if (paneRef) {
            paneRef.select();
        }
    }


    // update the postion of tab header
    private setTabsPosition() {
        const ul = this.nativeElement.children[0];

        this.vertical = (this.tabsposition === 'left' || this.tabsposition === 'right');

        removeClass(this.nativeElement, 'inverted');
        if (this.tabsposition === 'bottom' || this.tabsposition === 'right') {
            appendNode(ul as HTMLElement, this.nativeElement);
            addClass(this.nativeElement, 'inverted');
        }
    }

    onPropertyChange(key: string, nv: any, ov) {

        if (key === 'defaultpaneindex') {
            // If no active tab is set ie.. no isdefaulttab then honor the defaultpaneindex
            setTimeout(() => this.selectDefaultPaneByIndex(nv || 0), 20);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    registerTabsScroll() {
        setTimeout(() => {
            const $ul = this.$element.find('> ul');
            let $liPosition;

            const  $li = $ul.children();
            $liPosition = $li.last().position();
            if ($liPosition && ($liPosition.left > $ul.width())) {
                $ul.on('mousewheel', (e) => {
                    const left = $ul[0].scrollLeft,
                        _delta = -1 * e.originalEvent.wheelDelta;
                    e.stopPropagation();
                    e.preventDefault();
                    $ul.animate({scrollLeft: left + _delta}, {'duration': 10});
                });
            }
        });
    }

    ngAfterContentInit() {
        this.promiseResolverFn();
        super.ngAfterContentInit();
        this.setTabsPosition();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.registerTabsScroll();
    }
}
