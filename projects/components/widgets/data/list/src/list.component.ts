import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import {
    AfterViewInit,
    Attribute,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef, Inject,
    Injector,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren
} from '@angular/core';

import {Subscription} from 'rxjs';

import {
    $appDigest,
    $invokeWatchers,
    App,
    AppDefaults,
    DataSource,
    getClonedObject,
    isDataSourceEqual,
    isDefined,
    isMobile,
    isObject,
    noop,
    switchClass,
    StatePersistence,
    PaginationService,
    setListClass,
    generateGUId
} from '@wm/core';
import {
    APPLY_STYLES_TYPE,
    configureDnD,
    DEBOUNCE_TIMES,
    getOrderedDataset,
    groupData,
    handleHeaderClick,
    NAVIGATION_TYPE,
    unsupportedStatePersistenceTypes,
    provideAsWidgetRef,
    StylableComponent,
    styler,
    ToDatePipe,
    toggleAllHeaders,
    WidgetRef,
    extractDataSourceName
} from '@wm/components/base';
import {PaginationComponent} from '@wm/components/data/pagination';
import {ButtonComponent} from '@wm/components/input';

import {registerProps} from './list.props';
import {ListItemDirective} from './list-item.directive';
import {ListAnimator} from './list.animator';
import {
    clone,
    cloneDeep,
    forEach,
    get, has,
    includes,
    isArray,
    isEmpty,
    isEqual,
    isNumber,
    isString,
    isUndefined,
    last, max, min, pullAllWith, pullAt, remove, some, toNumber
} from "lodash-es";

declare const $;

const DEFAULT_CLS = 'app-livelist app-panel';
const WIDGET_CONFIG = {widgetType: 'wm-list', hostClass: DEFAULT_CLS};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule, PaginationComponent, ListItemDirective],
    selector: 'div[wmList]',
    templateUrl: './list.component.html',
    providers: [
        provideAsWidgetRef(ListComponent)
    ]
})
export class ListComponent extends StylableComponent implements OnInit, AfterViewInit, OnDestroy {
    static initializeProps = registerProps();

    @ContentChild('listTemplate') listTemplate: TemplateRef<ElementRef>;

    @ContentChild('listLeftActionTemplate') listLeftActionTemplate: TemplateRef<ElementRef>;
    @ContentChild('listRightActionTemplate') listRightActionTemplate: TemplateRef<ElementRef>;
    @ContentChildren(ButtonComponent) btnComponents;

    @ViewChild(PaginationComponent) dataNavigator;
    @ViewChildren(ListItemDirective) listItems: QueryList<ListItemDirective>;
    public noDataFound: boolean;
    public lastSelectedItem: ListItemDirective;
    public fieldDefs: Array<any>;
    public disableitem;
    public navigation: string;
    public navigationalign: string;
    public pagesize: number;
    public dataset: any;
    public multiselect: boolean;
    public selectfirstitem: boolean;
    public orderby: string;
    public loadingicon: string;
    public paginationclass: string;
    public ondemandmessage: string;
    public loadingdatamsg: string;
    public selectionlimit: number;
    public infScroll: boolean;
    public enablereorder: boolean;
    public itemsperrow: string;
    public itemclass: string;
    public selectedItemWidgets: Array<WidgetRef> | WidgetRef;
    public variableInflight;
    public name;
    public currentPage;
    public direction;
    public tabindex;
    public handleHeaderClick: Function;
    public toggleAllHeaders: void;
    public groupby: string;
    public collapsible: string;
    public datePipe: ToDatePipe;
    public binditemclass: string;
    public binddisableitem: string;
    public binddataset: string;
    public mouseEnterCB: string;
    public mouseLeaveCB: string;
    public pulltorefresh: boolean;
    public title: string;
    public subheading: string;
    public iconclass: string;
    public listclass: any;
    public statehandler: any;
    public currentIndex: number;
    public titleId: string;
    public allowpagesizechange: boolean = false;
    public pagesizeoptions: string;
    public updatedPageSize;
    public actualPageSize;
    _isDependent;
    private itemsPerRowClass: string;
    private firstSelectedItem: ListItemDirective;
    private navigatorMaxResultWatch: Subscription;
    private navigatorResultWatch: Subscription;
    private navControls: string;
    private onDemandLoad: boolean;
    private _items: Array<any>;
    private dataNavigatorWatched: boolean;
    private datasource: any;
    private showNavigation: boolean;
    private reorderProps: any;
    private app: any;
    private appDefaults: any;
    private ngZone: NgZone;
    private statePersistence: StatePersistence;
    private paginationService: PaginationService;
    private binddatasource: string;
    private match: string;
    private dateformat: string;
    private groupedData: any;
    private cdRef: ChangeDetectorRef;
    private promiseResolverFn: Function;
    private propsInitPromise: Promise<any>;
    private $ulEle: any;
    private _listAnimator: ListAnimator;
    private _listenerDestroyers: Array<any>;
    private debouncedFetchNextDatasetOnScroll: Function;
    private isDataChanged: boolean;
    private isListElementMovable: boolean;
    private ariaText: String;
    private _pageLoad;
    private _selectedItemsExist;
    private listClickHandler;
    private addItemClickHandler;

    private touching;
    private touched;

    constructor(
        inj: Injector,
        cdRef: ChangeDetectorRef,
        datePipe: ToDatePipe,
        app: App,
        appDefaults: AppDefaults,
        ngZone: NgZone,
        @Attribute('itemclass.bind') binditemclass: string,
        @Attribute('disableitem.bind') binddisableitem: string,
        @Attribute('dataset.bind') binddataset: string,
        @Attribute('datasource.bind') binddatasource: string,
        @Attribute('mouseenter.event') mouseEnterCB: string,
        @Attribute('mouseleave.event') mouseLeaveCB: string,
        statePersistence: StatePersistence,
        paginationService: PaginationService,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        let resolveFn: Function = noop;
        const propsInitPromise = new Promise(res => resolveFn = res);
        super(inj, WIDGET_CONFIG, explicitContext, propsInitPromise);
        this.propsInitPromise = propsInitPromise;
        this.promiseResolverFn = resolveFn;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
        this.cdRef = cdRef;
        this.ngZone = ngZone;
        this.datePipe = datePipe;
        this.statePersistence = statePersistence;
        this.paginationService = paginationService;
        this._pageLoad = true;

        this.binditemclass = binditemclass;
        this.binddisableitem = binddisableitem;
        this.binddataset = binddataset;
        this.mouseEnterCB = mouseEnterCB;
        this.mouseLeaveCB = mouseLeaveCB;
        this.binddatasource = binddatasource;

        this.app = app;
        this.appDefaults = appDefaults;
        this.variableInflight = false;

        this.noDataFound = !binddataset;
        this.titleId = 'wmlist-' + generateGUId();

        // Updates pagination, filter, sort etc options for service and crud variables
        this._listenerDestroyers = [
            this.app.subscribe('check-state-persistence-options', options => {
                let dataSourceName = get(this.datasource, 'name');
                // in Prefabs, this.datasource is not resolved at the time of variable invocation, so additional check is required.
                if (!dataSourceName) {
                    dataSourceName = extractDataSourceName(this.binddatasource);
                }
                if (get(options, 'variable.name') !== dataSourceName) {
                    return;
                }
                this.handleStateParams(options);
            }),
            // Show loading status based on the variable life cycle
            this.app.subscribe('toggle-variable-state', this.handleLoading.bind(this)),
            this.app.subscribe('setup-cud-listener', param => {
                if (this.nativeElement.getAttribute('name') !== param) {
                    return;
                }
                this._isDependent = true;
            })
        ];
    }

    public get selecteditem() {
        if (this.multiselect) {
            return getClonedObject(this._items);
        }
        if (isEmpty(this._items)) {
            return {};
        }
        return getClonedObject(this._items[0]);
    }

    public set selecteditem(items) {
        this._items.length = 0;
        this.deselectListItems();

        if (isArray(items)) {
            items.forEach(item => this.selectItem(item));
        } else {
            this.selectItem(items);
        }
        $appDigest();
    }

    /**
     * Returns list of widgets present on list item by considering name and index of the widget.
     * If we did'nt pass index, it returns array of all the widgets which are matching to widget name
     * @param widgteName: Name of the widget
     * @param index: Index of the widget
     */
    public getWidgets(widgteName: string, index?: number) {
        let $target;
        const retVal = [];

        if (!widgteName) {
            return;
        }

        if (!isDefined(index)) {
            forEach(this.listItems.toArray(), (el) => {
                $target = get(el.currentItemWidgets, widgteName);
                if ($target) {
                    retVal.push($target);
                }
            });

            return retVal;
        }
        index = +index || 0;

        $target = get(this.listItems.toArray(), index);

        if ($target) {
            return [get($target.currentItemWidgets, widgteName)];
        }
    }

    // returns listitem reference by index value. This refers to the same method getListItemByIndex.
    public getItem(index: number) {
        return this.getListItemByIndex(index);
    }

    /**
     * Returns index of listItem(listItemDirective / listItemObject)
     * If item is a directive, index is fetched from listItems
     * If item is an object, index is fetched from fieldDefs
     */
    public getIndex(item: any) {
        if (item instanceof ListItemDirective) {
            return this.getListItemIndex(item);
        } else if (item) {
            return this.fieldDefs.findIndex((obj) => isEqual(obj, item));
        }
    }
     public getUpdatedPageSize() {
         return this.updatedPageSize;
     }

    create() {
        if (this._isDependent) {
            this.triggerWMEvent('insert');
        }
    }

    editRow(item?) {
        if (this._isDependent) {
            let listItem;
            if (item) {
                listItem = this.getItemRefByIndexOrModel(item).item;
            }
            this.triggerWMEvent('update', listItem);
        }
    }

    update(item?) {
        this.editRow(item);
    }

    deleteRow(item?) {
        if (this._isDependent) {
            let listItem;
            if (item) {
                listItem = this.getItemRefByIndexOrModel(item).item;
            }
            this.triggerWMEvent('delete', listItem);
        }
    }

    delete(item?) {
        this.deleteRow(item);
    }

    handleLoading(data) {
        const dataSource = this.datasource;
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.ngZone.run(() => {
                this.handleStateParams(data);
                this.variableInflight = data.active;
                // Fix for [WMS-23772] Update nodatafound flag once the response is recieved from the server
                const totalEle = data.data?.pagination?.totalElements;
                if (!isUndefined(totalEle)) {
                    this.noDataFound = totalEle === 0 ? true : false;
                } else { // totalelements is undefined
                    this.noDataFound = isEmpty(data.data?.data);
                }
            });
        }
    }

    public triggerListItemSelection($el: JQuery<HTMLElement>, $event: Event) {
        if ($el && $el[0]) {
            const listItemContext = $el.data('listItemContext');
            // Trigger click event only if the list item is from the corresponding list.
            if (listItemContext.listComponent === this) {
                this.onItemClick($event, listItemContext);
            }
        }
    }

    // this method is called form other data widgets like table.
    public execute(operation, options) {
        if ([DataSource.Operation.IS_API_AWARE, DataSource.Operation.IS_PAGEABLE, DataSource.Operation.SUPPORTS_SERVER_FILTER].includes(operation)) {
            return false;
        }
        return this.datasource.execute(operation, options);
    }

    public handleKeyDown($event, action: string) {
        $event.stopPropagation();
        if ($event.keyCode !== 13 && $event.keyCode !== 9 && !(($event.target.classList.contains('form-control') || $event.target.classList.contains('note-editable')) && $event.keyCode === 32)) {
            $event.preventDefault();
        }

        const listItems: QueryList<ListItemDirective> = this.listItems;

        let presentIndex: number = this.getListItemIndex(this.lastSelectedItem);

        if (this.multiselect) {
            const firstIndex: number = this.getListItemIndex(this.firstSelectedItem);
            const selectCount: number = isArray(this.selecteditem) ? this.selecteditem.length : (isObject(this.selecteditem) ? 1 : 0);
            if (action === 'selectPrev') {
                if (presentIndex > 0) {
                    if ((presentIndex <= firstIndex) && this.checkSelectionLimit(selectCount)) {
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex - 1);
                        this.toggleListItemSelection(this.lastSelectedItem);
                    } else if (presentIndex > firstIndex) {
                        this.toggleListItemSelection(this.getListItemByIndex(presentIndex));
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex - 1);
                    } else {
                        this.invokeEventCallback('selectionlimitexceed', {$event});
                    }
                }
            } else if (action === 'selectNext') {
                if (presentIndex < listItems.length - 1) {
                    if ((presentIndex >= firstIndex) && this.checkSelectionLimit(selectCount)) {
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex + 1);
                        this.toggleListItemSelection(this.lastSelectedItem);
                    } else if (presentIndex < firstIndex) {
                        this.toggleListItemSelection(this.getListItemByIndex(presentIndex));
                        this.lastSelectedItem = this.getListItemByIndex(presentIndex + 1);
                    } else {
                        this.invokeEventCallback('selectionlimitexceed', {$event});
                    }
                }
            }
        }
        if (action === 'focusPrev') {
            if (this.isListElementMovable) {
                presentIndex = presentIndex <= 0 ? 0 : (presentIndex);
                if (presentIndex === 0) {
                    return;
                }

                this.lastSelectedItem = this.getListItemByIndex(presentIndex);
                const prevElt = this.getListItemByIndex(presentIndex - 1);
                prevElt.nativeElement.before(this.lastSelectedItem.nativeElement);
                this.lastSelectedItem.nativeElement.focus();
                this.statePersistence.removeWidgetState(this, 'selectedItem');
                const arr = this.listItems.toArray();
                [arr[presentIndex - 1], arr[presentIndex]] = [arr[presentIndex], arr[presentIndex - 1]];
                this.listItems.reset(arr);
                this.currentIndex = presentIndex;
                this.ariaText = "selected ";
            } else {
                presentIndex = presentIndex <= 0 ? 0 : (presentIndex - 1);
                this.lastSelectedItem = this.getListItemByIndex(presentIndex);
                this.lastSelectedItem.nativeElement.focus();
                this.currentIndex = presentIndex + 1;
                this.ariaText = "selected ";
            }
        } else if (action === 'focusNext') {
            if (this.isListElementMovable) {
                presentIndex = presentIndex < (listItems.length - 1) ? (presentIndex) : (listItems.length - 1);
                if (presentIndex === this.listItems.length - 1) {
                    return;
                }

                this.lastSelectedItem = this.getListItemByIndex(presentIndex);
                const nextElt = this.getListItemByIndex(presentIndex + 1);
                nextElt.nativeElement.after(this.lastSelectedItem.nativeElement);
                this.lastSelectedItem.nativeElement.focus();
                this.statePersistence.removeWidgetState(this, 'selectedItem');
                const arr = this.listItems.toArray();
                [arr[presentIndex], arr[presentIndex + 1]] = [arr[presentIndex + 1], arr[presentIndex]];
                this.listItems.reset(arr);
                this.currentIndex = presentIndex + 2;
                this.ariaText = "selected ";
            } else {
                presentIndex = presentIndex < (listItems.length - 1) ? (presentIndex + 1) : (listItems.length - 1);
                this.lastSelectedItem = this.getListItemByIndex(presentIndex);
                this.lastSelectedItem.nativeElement.focus();
                this.currentIndex = presentIndex + 1;
                this.ariaText = "selected ";
            }
        } else if (action === 'select') {
            // if the enter click is pressed on the item which is not the last selected item, the find the item from which the event is originated.
            if (presentIndex === -1 || !$($event.target).closest(this.lastSelectedItem.nativeElement)) {
                const $li = $($event.target).closest('li.app-list-item');
                const $ul = $li.closest('ul.app-livelist-container');
                presentIndex = $ul.find('li.app-list-item').index($li);
            }
            this.onItemClick($event, this.getListItemByIndex(presentIndex));
        } else if (action === 'space') {
            if (!this.enablereorder) {
                return;
            }
            this.isListElementMovable = !this.isListElementMovable;
            this.onItemClick($event, this.getListItemByIndex(presentIndex));
            this.currentIndex = presentIndex + 1;
            if (this.isListElementMovable) {
                this.ariaText = `Item ${this.currentIndex} grabbed, current position `;
                this.$ulEle.data('oldIndex', presentIndex);
            } else {
                this.ariaText = `Item ${this.currentIndex} dropped, final position `;
                this.onUpdate($event, undefined, presentIndex);
            }
        }
    }
    getActualPageSize()  {
        return this.actualPageSize || 20;
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'dataset') {
            if (!nv && this.binddatasource && !this.datasource) {
                return;
            }
            this.onDataSetChange(nv);
        } else if (key === 'datasource') {
            if(this.allowpagesizechange){
                this.datasource.maxResults = this.pagesize || this.datasource.maxResults
            }
            if (this.dataset) {
                this.onDataSetChange(this.dataset);
            }
        } else if (key === 'navigation') {
            // Support for older projects where navigation type was advanced instead of classic
            if (nv === 'Advanced') {
                this.navigation = 'Classic';
                return;
            }
            switchClass(this.nativeElement, nv, ov);
            this.onNavigationTypeChange(nv);
            if (this.dataNavigator) {
                this.dataNavigator.navigationClass = this.paginationclass;
            }
        } else if (key === 'itemsperrow') {
            setListClass(this);
        } else if (key === 'tabindex') {
            return;
        } else if (key === 'pulltorefresh' && nv) {
            this.app.notify('pullToRefresh:enable');
            this.subscribeToPullToRefresh();
        } else if (key === 'paginationclass') {
            if (this.dataNavigator) {
                // Adding setTimeout because in pagination component updateNavSize method is overriding navigationclass
                setTimeout(() => this.dataNavigator.navigationClass = nv);
            }
        } else if (key === 'pagesize') {
            this.actualPageSize = nv; // maintain default page size to calculate pagesize options
            this.setDefaultPageSize(nv)
        } else if (key === 'enablereorder') {
            if (nv && this.$ulEle) {
                this.$ulEle.attr('aria-describedby', this.titleId);
                this.configureDnD();
                this.$ulEle.sortable('enable');
            } else if (this.$ulEle && !nv) {
                this.$ulEle.removeAttr('aria-describedby');
                this.$ulEle.sortable('disable');
            }
        } else if (key === 'allowpagesizechange') {
            this.allowpagesizechange = nv;
        } else if(key === 'pagesizeoptions') {
                this.pagesizeoptions = nv;
                this.setDefaultPageSize(nv)
        }else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    setDefaultPageSize(nv: any){
     if (this.allowpagesizechange) {
        const widgetState = this.statePersistence.getWidgetState(this);
        if (get(widgetState, 'pagesize')) {
            nv = get(widgetState, 'pagesize');
            this.pagesize = nv; // updating the default pagesize to user selected pagesize
        } else if (this.pagesizeoptions) {
            nv = this.pagesizeoptions?.split(',').map(Number).sort((a, b) => a - b)[0]
            this.pagesize = nv;
        }
    }
        this.updatedPageSize = nv;
        this.dataNavigator.updatedPageSize = nv;

        this.dataNavigator.options = {
            maxResults: nv
        };
        this.dataNavigator.widget.maxResults = nv;
        this.dataNavigator.maxResults = nv;
    }

    public onItemClick(evt: any, $listItem: ListItemDirective) {
        let selectCount: number;

        if (!$listItem.disableItem) {
            this.firstSelectedItem = this.firstSelectedItem || $listItem;
            // Setting selectCount value based number of items selected.
            selectCount = isArray(this.selecteditem) ? this.selecteditem.length : (isObject(this.selecteditem) ? 1 : 0);

            // Handling multiselect for mobile device
            if (this.multiselect && isMobile()) {
                if (this.checkSelectionLimit(selectCount) || $listItem.isActive) {
                    this.toggleListItemSelection($listItem);
                } else {
                    this.invokeEventCallback('selectionlimitexceed', {$event: evt});
                }
            } else if ((evt.ctrlKey || evt.metaKey) && this.multiselect) {
                if (this.checkSelectionLimit(selectCount) || $listItem.isActive) {
                    this.firstSelectedItem = this.lastSelectedItem = $listItem;
                    this.toggleListItemSelection($listItem);
                } else {
                    this.invokeEventCallback('selectionlimitexceed', {$event: evt});
                }
            } else if (evt.shiftKey && this.multiselect) {
                let first = $listItem.context.index;
                let last = this.firstSelectedItem.context.index;

                // if first is greater than last, then swap values
                if (first > last) {
                    last = [first, first = last][0];
                }
                if (this.checkSelectionLimit(last - first)) {
                    this.clearSelectedItems();
                    this.listItems.forEach(($liItem: ListItemDirective) => {
                        const index = $liItem.context.index;
                        if (index >= first && index <= last) {
                            this.toggleListItemSelection($liItem);
                        }
                    });
                    this.lastSelectedItem = $listItem;
                } else {
                    this.invokeEventCallback('selectionlimitexceed', {$event: evt});
                }

            } else {
                if (!$listItem.isActive || selectCount > 1) {
                    this.clearSelectedItems();
                    this.toggleListItemSelection($listItem);
                    this.firstSelectedItem = this.lastSelectedItem = $listItem;
                }
            }
            $appDigest();
        }
    }

    // Empty the list content on clear
    public clear() {
        this.updateFieldDefs([]);
    }

    /**
     * deselects item in the list.
     * @param val: index | model of the list item.
     */
    public deselectItem(val: any) {
        const listItem = this.getItemRefByIndexOrModel(val);
        if (listItem && listItem.isActive) {
            this.toggleListItemSelection(listItem);
        }
    }

    /**
     * selects item in the list.
     * @param val: index | model of the list item.
     */
    public selectItem(val, statePersistenceTriggered?) {
        const listItem = this.getItemRefByIndexOrModel(val);
        if (!listItem) {
            return;
        }
        if (!listItem.isActive) {
            this.toggleListItemSelection(listItem, statePersistenceTriggered);
        }
        // focus the element.
        listItem.nativeElement.focus();
    }

    ngOnInit() {
        super.ngOnInit();
        this.handleHeaderClick = noop;
        setTimeout(() => {
            this.debouncedFetchNextDatasetOnScroll = this.paginationService.debouncedFetchNextDatasetOnScroll(this.dataNavigator, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME, this);
        }, 0);
        this._items = [];
        this.fieldDefs = [];
        this.reorderProps = {
            minIndex: null,
            maxIndex: null
        };
    }

    ngAfterViewInit() {
        this.promiseResolverFn();
        this.propsInitPromise.then(() => {
            super.ngAfterViewInit();
            this.setUpCUDHandlers();
            this.selectedItemWidgets = this.multiselect ? [] : {};
            var ele = $(this.nativeElement).find('.app-livelist-container');

            if (this.enablereorder && !this.groupby) {
                if (ele) {
                    ele.attr('aria-describedby', this.titleId);
                }
                this.configureDnD();
            }
            if (!this.enablereorder) {
                if (ele) {
                    ele.removeAttr('aria-describedby');
                }
            }
            if (this.groupby && this.collapsible) {
                this.handleHeaderClick = handleHeaderClick;
                this.toggleAllHeaders = toggleAllHeaders.bind(undefined, this);
            }
            setListClass(this);
        });
        this.setupHandlers();
        const $ul = this.nativeElement.querySelector('ul.app-livelist-container');
        styler($ul as HTMLElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        if (this.enablereorder) {
            if ($ul) {
                $ul.setAttribute('aria-describedby', this.titleId);
            }
        }
        if (!this.enablereorder) {
            if ($ul) {
                $ul.removeAttribute('aria-describedby');
            }
        }
    }

    ngOnDestroy() {
        if (this._listAnimator && this._listAnimator.$btnSubscription) {
            this._listAnimator.$btnSubscription.unsubscribe();
        }
        this._listenerDestroyers.forEach(d => d && d());
        
        // Destroy jQuery UI sortable to prevent memory leaks
        if (this.$ulEle && this.$ulEle.hasClass('ui-sortable')) {
            this.$ulEle.sortable('destroy');
        }
        
        // Remove event listeners to prevent memory leaks
        const listContainer = this.nativeElement.querySelector('ul.app-livelist-container');
        if (listContainer && this.listClickHandler) {
            listContainer.removeEventListener('click', this.listClickHandler, true);
        }
        const $addItem = document.getElementsByClassName("add-list-item")[0];
        if ($addItem && this.addItemClickHandler) {
            $addItem.removeEventListener('click', this.addItemClickHandler);
        }
        
        // Remove jQuery data to prevent DOM reference leaks
        if (this.$ulEle) {
            this.$ulEle.removeData('oldIndex');
        }
        
        super.ngOnDestroy();
    }

    ngOnDetach() {
        super.ngOnDetach();
        this._pageLoad = true;
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        // tap and doubleTap events are not getting propagated.So, using mouse events instead.
        const touchToMouse = {
            tap: 'click',
            doubletap: 'dblclick'
        };
        if (includes(['click', 'tap', 'dblclick', 'doubletap'], eventName)) {
            this.eventManager.addEventListener(
                this.nativeElement,
                touchToMouse[eventName] || eventName,
                (evt) => {
                    const target = $(evt.target).closest('.app-list-item');
                    if (target.length) {
                        const listItemContext: ListItemDirective = target.data('listItemContext');
                        if (!listItemContext.disableItem) {
                            this.invokeEventCallback(eventName, {
                                widget: listItemContext,
                                $event: evt,
                                item: listItemContext.item
                            });
                        }
                    }
                }
            );
        }
    }

    private getConfiguredState() {
        const mode = this.statePersistence.computeMode(this.statehandler);
        return mode && mode.toLowerCase();
    }

    private handleStateParams(options) {
        if (this._pageLoad && this.getConfiguredState() !== 'none') {
            this._pageLoad = false;
            const widgetState = this.statePersistence.getWidgetState(this);
            if (get(widgetState, 'pagination')) {
                options.options = options.options || {};
                options.options.page = widgetState.pagination;
            }
            if (get(widgetState, 'selectedItem')) {
                this._selectedItemsExist = true;
            }
        }
    }

    private triggerWMEvent(eventName, item?) {
        $invokeWatchers(true);
        // If we have multiselect for the livelist(List with form template), in run mode deleting a record is getting failed. Becuase the selecteditem will be array of objects. So consider the last object.
        let row = this.multiselect ? last(this.selecteditem) : this.selecteditem;
        if (item) {
            row = item;
        }
        this.app.notify('wm-event', {eventName, widgetName: this.name, row: row});
    }

    private resetNavigation() {
        this.showNavigation = false;
        this.navControls = undefined;
        this.infScroll = false;
        this.onDemandLoad = false;
    }

    private enableBasicNavigation() {
        this.navControls = NAVIGATION_TYPE.BASIC;
        this.showNavigation = true;
    }

    private enableInlineNavigation() {
        this.navControls = NAVIGATION_TYPE.INLINE;
    }

    private enableClassicNavigation() {
        this.navControls = NAVIGATION_TYPE.CLASSIC;
        this.showNavigation = true;
    }

    private enablePagerNavigation() {
        this.navControls = NAVIGATION_TYPE.PAGER;
        this.showNavigation = true;
    }

    private setNavigationTypeNone() {
        this.navControls = NAVIGATION_TYPE.NONE;
        this.showNavigation = false;
    }

    private enableInfiniteScroll() {
        this.infScroll = true;
    }

    private enableOnDemandLoad() {
        this.onDemandLoad = true;
        this.showNavigation = true;
    }

    /**
     * Sets Navigation type for the list.
     * @param type
     */
    private onNavigationTypeChange(type) {
        this.resetNavigation();
        switch (type) {
            case NAVIGATION_TYPE.BASIC:
                this.enableBasicNavigation();
                break;
            case NAVIGATION_TYPE.INLINE:
                this.enableInlineNavigation();
                break;
            case NAVIGATION_TYPE.ADVANCED:
            case NAVIGATION_TYPE.CLASSIC:
                this.enableClassicNavigation();
                break;
            case NAVIGATION_TYPE.PAGER:
                this.enablePagerNavigation();
                break;
            case NAVIGATION_TYPE.NONE :
                this.setNavigationTypeNone();
                break;
            case NAVIGATION_TYPE.SCROLL:
                this.enableInfiniteScroll();
                break;
            case NAVIGATION_TYPE.ONDEMAND:
                this.enableOnDemandLoad();
                break;
        }
    }

    /**
     * Update fieldDefs property, fieldDefs is the model of the List Component.
     * fieldDefs is an Array type.
     * @param newVal
     */
    private updateFieldDefs(newVal: Array<any>) {
        if (this.infScroll || this.onDemandLoad) {
            [this.fieldDefs, this.currentPage] = this.paginationService.updateFieldsOnPagination(this, newVal);
        } else {
            this.fieldDefs = newVal;
        }

        if (this.orderby) {
            this.fieldDefs = getOrderedDataset(this.fieldDefs, this.orderby);
        }
        if (this.groupby) {
            this.groupedData = groupData(this, this.fieldDefs, this.groupby, this.match, this.orderby, this.dateformat, this.datePipe, undefined, this.appDefaults);
        }

        if (!this.fieldDefs.length) {
            this.noDataFound = true;
            this.selecteditem = undefined;
        }
        $appDigest();
        this.listItems.setDirty();
    }

    private onDataChange(newVal) {
        // Check for newVal is not empty
        if (!isEmpty(newVal)) {

            this.noDataFound = false;
            this.isDataChanged = true;

            if (this.datasource && this.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
                // clone the the data in case of live and service variables to prevent the two-way binding for these variables.
                newVal = cloneDeep(newVal);
            }

            if (isObject(newVal) && !isArray(newVal)) {
                newVal = isEmpty(newVal) ? [] : [newVal];
            }

            if (isString(newVal)) {
                newVal = newVal.split(',');
            }

            // if the page number is greater than 1 on initial load then we render the first page.
            if (this.datasource && this.datasource.owner === 'App' && (this.infScroll || this.onDemandLoad) && !this.currentPage && this.datasource.execute(DataSource.Operation.GET_PAGING_OPTIONS).number > 0) {
                newVal = this.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                    'page': 1
                });
            }

            if (isArray(newVal)) {
                if (newVal.length) {
                    this.invokeEventCallback('beforedatarender', {$data: newVal});
                }
                this.updateFieldDefs(newVal);
            }
        } else {
            this.updateFieldDefs([]);
        }
    }

    // Updates the dataSource when pagination is enabled for the Component.
    private setupDataSource() {
        const dataNavigator = this.dataNavigator;

        dataNavigator.options = {
            maxResults: this.pagesize || 20
        };

        this.dataNavigatorWatched = true;

        if (this.navigatorResultWatch) {
            this.navigatorResultWatch.unsubscribe();
        }
        /*Register a watch on the "result" property of the "dataNavigator" so that the paginated data is displayed in the live-list.*/
        this.navigatorResultWatch = dataNavigator.resultEmitter.subscribe((newVal: any) => {
            this.onDataChange(newVal);
        }, true);
        /*De-register the watch if it is exists */
        if (this.navigatorMaxResultWatch) {
            this.navigatorMaxResultWatch.unsubscribe();
        }
        /*Register a watch on the "maxResults" property of the "dataNavigator" so that the "pageSize" is displayed in the live-list.*/
        this.navigatorMaxResultWatch = dataNavigator.maxResultsEmitter.subscribe((val) => {
            this.pagesize = val;
        });

        dataNavigator.maxResults = this.pagesize || 20;
        this.removePropertyBinding('dataset');
        // when list having "datasetboundexpr" attr indicates that list is bound to item context
        // when dataset is bound to "item.FIELD" then item context is passed as the datasource.
        const datasetBoundExpr = this.getAttr('datasetboundexpr');
        this.dataNavigator.setBindDataSet(
            this.binddataset,
            this.viewParent,
            datasetBoundExpr ? this.context : this.datasource,
            this.dataset,
            this.binddatasource,
            datasetBoundExpr,
            this.statehandler
        );
    }

    private onDataSetChange(newVal) {
        if (get(this.datasource, 'category') === 'wm.Variable' && this.getConfiguredState() !== 'none' && this._pageLoad) {
            const widgetState = this.statePersistence.getWidgetState(this);
            this._pageLoad = false;
            if (this.allowpagesizechange) { // maintain updated page size in the statePersistence
                if (get(widgetState, 'pagination') || get(widgetState, 'pagesize')) {
                    this.dataNavigator.pageChanged({page: widgetState.pagination || 1, pagesize: widgetState.pagesize}, true);
                }
            } else {
                if (get(widgetState, 'pagination')) {
                    this.dataNavigator.pageChanged({page: widgetState.pagination}, true);
                }
            }
            if (get(widgetState, 'selectedItem')) {
                this._selectedItemsExist = true;
            }
        }
        if (!this.dataNavigatorWatched) {
            if (this.navigation && this.navigation !== NAVIGATION_TYPE.NONE) {
                this.setupDataSource();
            } else {
                this.onDataChange(newVal);
            }
        } else if (this.navigation && this.navigation !== NAVIGATION_TYPE.NONE) {
            // If navigation is already setup and datasource is changed, update the datasource on navigation
            this.dataNavigator.setDataSource(this.datasource);
        }
    }

    // All the ListItem's Active state is set to false.
    private deselectListItems() {
        this.listItems.forEach(item => item.isActive = false);
    }

    // Deselect all the ListItems and clear the selecteditem(InOutBound Property model)
    private clearSelectedItems() {
        this.deselectListItems();
        this._items.length = 0;
        $appDigest();
    }

    /**
     * return the ListItemDirective instance by checking the equality of the model.
     * @param listModel: model to be searched for
     * @returns ListItem if the model is matched else return null.
     */
    private getListItemByModel(listModel): ListItemDirective {
        return this.listItems.find((listItem) => {
            let itemObj = listItem.item;
            if (this.groupby && !has(listModel, '_groupIndex')) {
                // If groupby is enabled, item contains _groupIndex property which should be excluded while comparing model.
                itemObj = clone(itemObj);
                delete itemObj._groupIndex;
            }
            if (isEqual(itemObj, listModel)) {
                return true;
            }
        }) || null;
    }

    private updateSelectedItemsWidgets(statePersistenceTriggered?) {
        let obj = {}, widgetState;
        const pageNum = get(this.dataNavigator, 'dn.currentPage') || 1;
        if (this.getConfiguredState() !== 'none') {
            // remove previously configured selected items for current page and construct new ones later below.
            widgetState = this.statePersistence.getWidgetState(this) || {};
            if (get(widgetState, 'selectedItem')) {
                // when multiselect is on and an item is selected without pressing CTRL, previously selected items in state should be empty.
                if (this.multiselect && this.selecteditem.length === 1) {
                    widgetState.selectedItem = [];
                } else {
                    remove(widgetState.selectedItem, function (selectedItem: any) {
                        return selectedItem.page === pageNum;
                    });
                }
            }
        }
        if (this.multiselect) {
            (this.selectedItemWidgets as Array<WidgetRef>).length = 0;
        }
        this.listItems.forEach((item: ListItemDirective, index) => {
            if (item.isActive) {
                if (this.multiselect) {
                    (this.selectedItemWidgets as Array<WidgetRef>).push(item.currentItemWidgets);
                } else {
                    this.selectedItemWidgets = item.currentItemWidgets;
                }
                obj = {page: pageNum, index: index};
                if (get(widgetState, 'selectedItem') && this.multiselect) {
                    if (!some(widgetState.selectedItem, obj)) {
                        widgetState.selectedItem.push(obj);
                    }
                } else {
                    widgetState.selectedItem = [obj];
                }
            }
        });
        if (this.getConfiguredState() !== 'none' && !statePersistenceTriggered) {
            if (unsupportedStatePersistenceTypes.indexOf(this.navigation) < 0) {
                this.statePersistence.removeWidgetState(this, 'selectedItem');
                this.statePersistence.setWidgetState(this, {'selectedItem': widgetState.selectedItem});
            } else {
                console.warn('Retain State handling on Widget ' + this.name + ' is not supported for current pagination type.');
            }
        }
    }

    /**
     * Selects the listItem and updates selecteditem property.
     * If the listItem is already a selected item then deselects the item.
     * @param {ListItemDirective} $listItem: Item to be selected of deselected.
     */
    private toggleListItemSelection($listItem: ListItemDirective, statePersistenceTriggered?) {
        // item is not allowed to get selected if it is disabled.
        if ($listItem && !$listItem.disableItem) {
            let item = $listItem.item;
            if (this.groupby && has(item, '_groupIndex')) {
                // If groupby is enabled, item contains _groupIndex property which should be excluded from selecteditem.
                item = clone(item);
                delete item._groupIndex;
            }
            if ($listItem.isActive) {
                this._items = pullAllWith(this._items, [item], isEqual);
                $listItem.isActive = false;
            } else {
                // if multiselect is false, clear the selectItem list before adding an item to the selectItem list.
                if (!this.multiselect) {
                    this.clearSelectedItems();
                }
                this._items.push(item);
                this.invokeEventCallback('select', {widget: $listItem, $data: item});
                $listItem.isActive = true;
            }
            this.updateSelectedItemsWidgets(statePersistenceTriggered);
        }
    }

    /**
     * Method is Invoked when the model for the List Widget is changed.
     * @param {QueryList<ListItemDirective>} listItems
     */
    private onListRender(listItems: QueryList<ListItemDirective>) {
        // Added render callback event. This method(onListRender) is calling multiple times so checking isDatachanged flag because this falg is changed whenever new data is rendered.
        if (this.isDataChanged) {
            // Whenever dataset is changed, trigger watchers to evaluate listitem bind expressions.
            $invokeWatchers(true);
            this.invokeEventCallback('render', {$data: this.fieldDefs});
        }
        if (this.isDataChanged && this.getConfiguredState() !== 'none' && listItems.length && this._selectedItemsExist) {
            const widgetState = this.statePersistence.getWidgetState(this);
            if (get(widgetState, 'selectedItem')) {
                this._selectedItemsExist = false;
                const selectedItemsLength = isArray(this.selecteditem) ? this.selecteditem.length : toNumber(!isEmpty(this.selecteditem));
                const currentPage = get(this.dataNavigator, 'dn.currentPage') || 1;
                widgetState.pagination = widgetState.pagination || 1;
                // to prevent item selection from being triggered more than once
                if (selectedItemsLength !== widgetState.selectedItem.length && widgetState.pagination === currentPage) {
                    widgetState.selectedItem.forEach((item) => {
                        if (item.page === currentPage) {
                            this.selectItem(item.index, true);
                        }
                    });
                }
            }
        }
        const selectedItems = isArray(this.selecteditem) ? this.selecteditem : [this.selecteditem];

        this.firstSelectedItem = this.lastSelectedItem = null;

        // don't select first item if multi-select is enabled and at least item is already selected in the list.
        // don't select first item if state information has selected items
        if (listItems.length && this.selectfirstitem && !(this._items.length && this.multiselect) && this._selectedItemsExist !== false) {
            const $firstItem: ListItemDirective = listItems.first;

            if (
                !$firstItem.disableItem &&
                this.isDataChanged &&
                // "infinite scroll" or "load on demand" is enabled and at least one item is selected then dont alter the selected list items.
                !(
                    (this.infScroll || this.onDemandLoad) &&
                    this._items.length
                )
            ) {
                this.clearSelectedItems();
                this.firstSelectedItem = this.lastSelectedItem = $firstItem;
                // selecting the first record
                this.selectItem(0);
            }
        } else {
            this.deselectListItems();
            selectedItems.forEach(selecteditem => {
                const listItem: ListItemDirective = this.getListItemByModel(selecteditem);
                if (listItem) {
                    listItem.isActive = true;
                    this.lastSelectedItem = listItem;
                    // focus the active element
                    listItem.nativeElement.focus();
                }
            });
        }

        if (this.fieldDefs.length && this.infScroll) {
            const smoothScrollEl = this.$element.closest('[wmsmoothscroll]');
            // In case of mobile app when modal exists, and list items height is greater than the modal content provide ccontainer a scrollable height
            const modalBody = this.$element.closest('.modal-body');
            const listHt = this.$element.find('ul').height();
            const modalHt = window.innerHeight - 140;
            if (isMobile() && modalBody.length && listHt > modalHt) {
                this.$element.css('height', modalHt + 'px');
            }
            this.paginationService.bindScrollEvt(this, '> ul', DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);

        }

        this.isDataChanged = false;
    }

    private setupHandlers() {
        this.listItems.changes.subscribe(listItems => {
            this.onListRender(listItems);
            this.cdRef.detectChanges();
        });
        // handle click event in capturing phase.
        this.listClickHandler = ($event) => {
            let target = $($event.target).closest('.app-list-item');
            // Recursively find the current list item
            while (target.get(0) && (target.closest('ul.app-livelist-container').get(0) !== $event.currentTarget)) {
                target = target.parent().closest('.app-list-item');
            }
            this.triggerListItemSelection(target, $event);
        };
        this.nativeElement.querySelector('ul.app-livelist-container').addEventListener('click', this.listClickHandler, true);
    }

    // Triggers on drag start while reordering.
    private onReorderStart(evt, ui) {
        ui.placeholder.height(ui.item.height());
        this.$ulEle.data('oldIndex', ui.item.index());
    }

    // Triggers during sorting
    private onSort(evt, ui) {
        // In case of infinite scroll, when the element doesn't have scroll enabled
        // on dragging the element to last item's position manually trigger loading of next items
        if (this.infScroll) {
            const lastItemOffset = this.$ulEle.find(`[listitemindex=${this.fieldDefs.length - 1}]`).offset();
            if (lastItemOffset && lastItemOffset.top < ui.offset.top) {
                this.paginationService.bindScrollEvt(this, '> ul', DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
                this.debouncedFetchNextDatasetOnScroll();
            }
        }
    }

    // Triggers after the sorting.
    private onUpdate(evt, ui, presentIndex?) {
        const data = this.fieldDefs;
        // If ui is not present then it is called from drag and drop using keyboard
        const newIndex = ui === undefined ? presentIndex : ui.item.index();
        const oldIndex = this.$ulEle.data('oldIndex');

        const minIndex = min([newIndex, oldIndex]);
        const maxIndex = max([newIndex, oldIndex]);

        const draggedItem = pullAt(data, oldIndex)[0];
        // Modify the data list only if we find a draggedItem
        if (draggedItem) {
            if (this.getConfiguredState() !== 'none') {
                this.statePersistence.removeWidgetState(this, 'selectedItem');
            }

            this.reorderProps.minIndex = min([minIndex, this.reorderProps.minIndex]);
            this.reorderProps.maxIndex = max([maxIndex, this.reorderProps.maxIndex]);

            data.splice(newIndex, 0, draggedItem);

            this.cdRef.markForCheck();
            this.cdRef.detectChanges();
            const $changedItem = {
                oldIndex: oldIndex,
                newIndex: newIndex,
                item: data[newIndex]
            };
            this.invokeEventCallback('reorder', {$event: evt, $data: data, $changedItem});
            this.$ulEle.removeData('oldIndex');
        }
    }

    // configures reordering the list items.
    private configureDnD() {
        let appendTo;
        const modalEl = $(document).find('.modal');
        if (this.getAttr('height')) { // when height is applied to the list, append should be the ul's parent as scroll is applied to the parent
            appendTo = 'parent';
        } else if (modalEl.length) { // In case of dialog, appendTo should be the modal ele
            appendTo = modalEl[modalEl.length - 1];
        } else { // As default append to should be body
            appendTo = 'body';
        }

        const options = {
            appendTo: appendTo,
        };

        const $el = $(this.nativeElement);
        this.$ulEle = $el.find('.app-livelist-container');

        configureDnD(this.$ulEle, options, this.onReorderStart.bind(this), this.onUpdate.bind(this), this.onSort.bind(this));

        this.$ulEle.droppable({'accept': '.app-list-item'});



    }

    // returns true if the selection limit is reached.
    private checkSelectionLimit(count: number) {
        return (!this.selectionlimit || count < this.selectionlimit);
    }

    // returns listitem reference by index value.
    private getListItemByIndex(index: number): ListItemDirective {
        return this.listItems.toArray()[index];
    }

    /**
     * return index of an (listItemDirective) in the listItem
     * @param {ListItemDirective} item
     * @returns {number}
     */
    private getListItemIndex(item: ListItemDirective) {
        return this.listItems.toArray().indexOf(item);
    }

    /**
     *  Returns ListItem Reference based on the input provided.
     * @param val: index | model of the list item.
     * @returns {ListItemDirective}
     */
    private getItemRefByIndexOrModel(val: any): ListItemDirective {
        let listItem: ListItemDirective;
        if (isNumber(val)) {
            listItem = this.getListItemByIndex(val);
        } else {
            listItem = this.getListItemByModel(val);
        }
        return listItem;
    }

    private beforePaginationChange($event, $index) {
        this.invokeEventCallback('paginationchange', {$event, $index});
    }

    trackByFn($index: number) {
        return $index; // Return a unique identifier for each item
    }

    // Invoke the datasource variable by default when pulltorefresh event is not specified.
    private subscribeToPullToRefresh() {
        this._listenerDestroyers.push(this.app.subscribe('pulltorefresh', () => {
            if (this.datasource && this.datasource.listRecords) {
                this.datasource.listRecords();
            }
        }));
    }

    private setUpCUDHandlers() {
        const $addItem = document.getElementsByClassName("add-list-item")[0];
        if ($addItem) {
            // Triggered on click of add action
            this.addItemClickHandler = evt => {
                this.create();
            };
            $addItem.addEventListener('click', this.addItemClickHandler);
        }
    }
}
