import { AfterContentInit, AfterViewInit, Attribute, Component, ContentChildren, Injector, OnInit, QueryList } from '@angular/core';

import { addClass, appendNode, DynamicComponentRefProvider, noop, removeClass, StatePersistence } from '@wm/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler, StylableComponent } from '@wm/components/base';

import { TabsAnimator } from './tabs.animator';
import { registerProps } from './tabs.props';
import { TabPaneComponent } from './tab-pane/tab-pane.component';

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
    static initializeProps = registerProps();

    public defaultpaneindex: number;
    public transition: string;
    public tabsposition: string;
    public statehandler: any;
    private statePersistence: StatePersistence;

    public vertical: boolean;
    public justified: boolean;
    private activeTab: TabPaneComponent;
    private readonly promiseResolverFn: Function;
    private tabsAnimator: TabsAnimator;
    private _oldPaneIndex: number;
    private isPageLoadCall: boolean;
    private dynamicComponentProvider;
    private _dynamicContext;
    private dynamicPaneIndex;
    public dynamicTabs;

    @ContentChildren(TabPaneComponent) panes: QueryList<TabPaneComponent>;

    constructor(
        inj: Injector,
        dynamicComponentProvider: DynamicComponentRefProvider,
        @Attribute('transition') _transition: string,
        @Attribute('tabsposition') _tabsPosition: string,
        statePersistence: StatePersistence,
    ) {
        // handle to the promise resolver
        let resolveFn: Function = noop;
        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));

        this.transition = _transition;
        this.tabsposition = _tabsPosition;
        this.statePersistence = statePersistence;
        this.dynamicComponentProvider = dynamicComponentProvider;
        this.dynamicTabs = [];
        this.dynamicPaneIndex = 0;

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
     * This method is used to register the dynamic panes.
     * After all panes are initialzed, update the querylist manually based on index.
     * @param paneRef - refrence of the tabpane
     */
    public registerDynamicTab(paneRef) {
        this.dynamicTabs.push(paneRef);
        const isLastPane =  this.dynamicTabs.length === this.dynamicPaneIndex;
        if (isLastPane) {
            for (let i = 0; i < this.dynamicTabs.length; i++) {
                const newPaneRef  = _.find(this.dynamicTabs, pane => pane.dynamicPaneIndex === i);
                const isPaneAlreadyExist = _.find(this.panes.toArray(), newPaneRef);
                if (!isPaneAlreadyExist) {
                    this.panes.reset([...this.panes.toArray(), newPaneRef]);
                    if (newPaneRef.active) {
                        setTimeout(() => {
                            newPaneRef.select();
                        }, 20);
                    }
                }
            }
        }
    }

    /**
     * This method is to add the tabpane dynamically
     * @param tabpanes - list of tabpanes
     */
    public addPane(tabpanes) {
        if (!_.isArray(tabpanes)) {
            tabpanes = [tabpanes];
        }
        const paneNamesList = [];
        _.forEach(tabpanes, (pane, index) => {
            const isPaneAlreadyCreated = _.find(this.panes.toArray(), {name: pane.name});
            const isPaneNameExist = _.indexOf(paneNamesList, pane.name);
            // If user tries to add tabpane with the same name which is already exists then do not create the pane
            if (isPaneAlreadyCreated || isPaneNameExist > 0) {
                console.warn(`The tab pane with name ${pane.name} already exists`);
                return;
            }

            let paramMarkup = '';
            let propsTmpl = '';
            this.dynamicPaneIndex++;
            const name = pane.name ? pane.name : `tabpane${this.panes.toArray().length + (index + 1)}`;
            paneNamesList.push(name);
            const partialParams = _.get(pane, 'params');

            _.forEach(pane, (value, key) => {
                if (key !== 'params') {
                    propsTmpl = `${propsTmpl} ${key}="${value}"`;
                }
            });

            _.forEach(partialParams, (value, key) => {
                paramMarkup = `${paramMarkup} <wm-param name="${key}" value="${value}"></wm-param>`;
            });
            const markup = `<wm-tabpane dynamicPaneIndex="${this.dynamicPaneIndex - 1}" isdynamic="true" name="${name}" ${propsTmpl}>
                            ${paramMarkup}
                        </wm-tabpane>`;

            if (!this._dynamicContext) {
                this._dynamicContext = Object.create(this.viewParent);
                this._dynamicContext[this.getAttr('wmTab')] = this;
            }

            this.dynamicComponentProvider.addComponent(this.getNativeElement().querySelector('.tab-content'), markup, this._dynamicContext, {inj: this.inj});

        });
        return paneNamesList;
    }

    /**
     * This method is to remove the tabpane
     * @param paneIndex - index of the pane
     */
    public removePane(paneName) {
        const paneRef = this.getPaneRefByName(paneName);
        if (paneRef) {
            paneRef.remove();
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
        const newPaneIndex = this.getPaneIndexByRef(paneRef);
        const mode = this.statePersistence.computeMode(this.statehandler);
        if (!this.isPageLoadCall && mode && mode.toLowerCase() !== 'none') {
            this.statePersistence.setWidgetState(this, this.activeTab.name);
        } else {
            this.defaultpaneindex = this.getPaneIndexByRef(paneRef);
            this.isPageLoadCall = false;
        }

        // invoke change callback if the evt is present, select a tab programmatically will not have the event
        if (evt) {
            this.invokeEventCallback('change', {
                $event: evt,
                newPaneIndex: newPaneIndex,
                oldPaneIndex: this._oldPaneIndex || 0
            });
        }
        this._oldPaneIndex = newPaneIndex;

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

    private getPaneRefByName(name: string): TabPaneComponent {
        return _.find(this.panes.toArray(), {name: name});
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
            this.defaultpaneindex = nv;
        } else if (key === 'statehandler') {
            this.isPageLoadCall = true;
            const widgetState = this.statePersistence.getWidgetState(this);
            if (nv !== 'none' && widgetState) {
                const paneToSelect: any = this.panes.filter(function(pane) {
                    return widgetState === pane.name;
                });
                if (!paneToSelect.length) {
                    console.warn('Tab pane name ' + widgetState + ' in State is incorrect. Falling back to the default pane');
                    setTimeout(() => this.selectDefaultPaneByIndex(this.defaultpaneindex || 0), 20);
                } else {
                    const index = this.getPaneIndexByRef(paneToSelect[0]);
                    setTimeout(() => this.selectDefaultPaneByIndex(index), 20);
                }
            } else {
                setTimeout(() => this.selectDefaultPaneByIndex(this.defaultpaneindex || 0), 20);
            }
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
