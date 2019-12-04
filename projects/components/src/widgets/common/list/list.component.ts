import { AfterViewInit, Attribute, ChangeDetectorRef, Component, ContentChild, ContentChildren, ElementRef, Injector, NgZone, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';

import { Subscription } from 'rxjs';

import { $appDigest,  $invokeWatchers, App, AppDefaults, DataSource, getClonedObject, isDataSourceEqual, isDefined, isMobile, isMobileApp, isNumber, isObject, noop, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './list.props';
import { NAVIGATION_TYPE, provideAsWidgetRef } from '../../../utils/widget-utils';
import { PaginationComponent } from '../pagination/pagination.component';
import { ListItemDirective } from './list-item.directive';
import { ListAnimator } from './list.animator';
import { configureDnD, getOrderedDataset, groupData, handleHeaderClick, toggleAllHeaders } from '../../../utils/form-utils';
import { WidgetRef } from '../../framework/types';
import { ButtonComponent } from '../button/button.component';
import { DEBOUNCE_TIMES } from '../../framework/constants';

declare const _;
declare const $;

const DEFAULT_CLS = 'app-livelist app-panel';
const WIDGET_CONFIG = {widgetType: 'wm-list', hostClass: DEFAULT_CLS};

@Component({
    selector: 'div[wmList]',
    templateUrl: './list.component.html',
    providers: [
        provideAsWidgetRef(ListComponent)
    ]
})
export class ListComponent extends StylableComponent implements OnInit, AfterViewInit, OnDestroy {
    static initializeProps = registerProps();

    @ContentChild('listTemplate') listTemplate: TemplateRef<ElementRef>;

    @ContentChild('listLeftActionTemplate') listLeftActionTemplate:  TemplateRef<ElementRef>;
    @ContentChild('listRightActionTemplate') listRightActionTemplate:  TemplateRef<ElementRef>;
    @ContentChildren(ButtonComponent) btnComponents;

    @ViewChild(PaginationComponent) dataNavigator;
    @ViewChildren(ListItemDirective) listItems: QueryList<ListItemDirective>;

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
    public noDataFound: boolean;
    private debouncedFetchNextDatasetOnScroll: Function;
    private reorderProps: any;
    private app: any;
    private appDefaults: any;
    private ngZone: NgZone;

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

    public handleHeaderClick: Function;
    public toggleAllHeaders: void;
    public groupby: string;
    public collapsible: string;
    public datePipe: ToDatePipe;
    public binditemclass: string;
    public binddisableitem: string;
    public binddataset: string;
    private binddatasource: string;
    public mouseEnterCB: string;
    public mouseLeaveCB: string;

    private match: string;
    private dateformat: string;
    private groupedData: any;
    private cdRef: ChangeDetectorRef;
    private promiseResolverFn: Function;
    private propsInitPromise: Promise<any>;
    private $ulEle: any;
    private _listAnimator: ListAnimator;
    public pulltorefresh: boolean;
    private cancelSubscription: Function;

    public title: string;
    public subheading: string;
    public iconclass: string;
    public listclass: any;
    private isDataChanged: boolean;

    public get selecteditem() {
        if (this.multiselect) {
            return getClonedObject(this._items);
        }
        if (_.isEmpty(this._items)) {
            return {};
        }
        return getClonedObject(this._items[0]);
    }

    /**
     * Returns list of widgets present on list item by considering name and index of the widget.
     * If we did'nt pass index, it returns array of all the widgets which are matching to widget name
     * @param widgteName: Name of the widget
     * @param index: Index of the widget
     */
    public getWidgets(widgteName: string, index: number) {
        let $target;
        const retVal = [];

        if (!widgteName) {
            return;
        }

        if (!isDefined(index)) {
            _.forEach(this.listItems.toArray(), (el) => {
                $target = _.get(el.currentItemWidgets, widgteName);
                if ($target) {
                    retVal.push($target);
                }
            });

            return retVal;
        }
        index = +index || 0;

        $target = _.get(this.listItems.toArray(), index);

        if ($target) {
            return [_.get($target.currentItemWidgets, widgteName)];
        }
    }

    // returns listitem reference by index value. This refers to the same method getListItemByIndex.
    public getItem(index: number) {
        return this.getListItemByIndex(index);
    }

    // return index of listItem(listItemDirective). This refers to the same method getListItemIndex.
    public getIndex(item: ListItemDirective) {
        return this.getListItemIndex(item);
    }

    public set selecteditem(items) {
        this._items.length = 0;
        this.deselectListItems();

        if (_.isArray(items)) {
            items.forEach(item => this.selectItem(item));
        } else {
            this.selectItem(items);
        }
        $appDigest();
    }

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
    ) {
        let resolveFn: Function = noop;
        const propsInitPromise = new Promise(res => resolveFn = res);
        super(inj, WIDGET_CONFIG, propsInitPromise);
        this.propsInitPromise = propsInitPromise;
        this.promiseResolverFn = resolveFn;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
        this.cdRef = cdRef;
        this.ngZone = ngZone;
        this.datePipe = datePipe;

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

        // Show loading status based on the variable life cycle
        this.app.subscribe('toggle-variable-state', this.handleLoading.bind(this));
    }

    handleLoading(data) {
        const dataSource = this.datasource;
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.ngZone.run(() => {
                this.variableInflight = data.active;
            });
        }
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

    /* this function sets the itemclass depending on itemsperrow.
     * if itemsperrow is 2 for large device, then itemclass is 'col-xs-1 col-sm-1 col-lg-2'
     * if itemsperrow is 'lg-3' then itemclass is 'col-lg-3'
     */
    private setListClass() {
        let temp = '';
        if (this.itemsperrow) {
            if (isNaN(parseInt(this.itemsperrow, 10))) {
                // handling itemsperrow containing string of classes
                _.split(this.itemsperrow, ' ').forEach((cls: string) => {
                    const keys = _.split(cls, '-');
                    cls = `${keys[0]}-${(12 / parseInt(keys[1], 10))}`;
                    temp += ` col-${cls}`;
                });
                this.itemsPerRowClass = temp.trim();
            } else {
                // handling itemsperrow having integer value.
                this.itemsPerRowClass = `col-xs-${(12 / parseInt(this.itemsperrow, 10))}`;
            }
        } else { // If itemsperrow is not specified make it full width
            this.itemsPerRowClass = 'col-xs-12';
        }
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

    private fetchNextDatasetOnScroll() {
        this.dataNavigator.navigatePage('next');
    }

    private setIscrollHandlers(el) {
        let lastScrollTop = 0;
        const wrapper = _.get(el.iscroll, 'wrapper');
        const self = el.iscroll;

        el.iscroll.on('scrollEnd', () => {
            const clientHeight = wrapper.clientHeight,
                totalHeight = wrapper.scrollHeight,
                scrollTop = Math.abs(el.iscroll.y);

            if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                this.debouncedFetchNextDatasetOnScroll();
                if (self.indicatorRefresh) {
                    self.indicatorRefresh();
                }
            }

            lastScrollTop = scrollTop;
        });
    }

    // Applying iscroll event to invoke the next calls for infinte scroll.
    private bindIScrollEvt() {
        const $scrollParent = this.$element.closest('[wmsmoothscroll="true"]');

        const iScroll = _.get($scrollParent[0], 'iscroll');

        // when iscroll is not initialised the notify the smoothscroll and subscribe to the iscroll update
        if (!iScroll) {
            const iScrollSubscription = this.app.subscribe('iscroll-update', (_el) => {
                if (!_.isEmpty(_el) && _el.isSameNode($scrollParent[0])) {
                    this.setIscrollHandlers($scrollParent[0]);
                    iScrollSubscription();
                }
            });
            this.app.notify('no-iscroll', $scrollParent[0]);
            return;
        }
        this.setIscrollHandlers($scrollParent[0]);
    }

    private bindScrollEvt() {
        const $el = this.$element;
        const $ul = $el.find('> ul');
        const $firstChild = $ul.children().first();
        const self = this;

        let $scrollParent;
        let scrollNode;
        let lastScrollTop = 0;

        if (!$firstChild.length) {
            return;
        }

        $scrollParent = $firstChild.scrollParent(false);

        if ($scrollParent[0] === document) {
            scrollNode = document.body;
        } else {
            scrollNode = $scrollParent[0];
        }

        // has scroll
        if (scrollNode.scrollHeight > scrollNode.clientHeight) {
            $scrollParent
                .each((index: number, node: HTMLElement | Document) =>  {
                    // scrollTop property is 0 or undefined for body in IE, safari.
                    lastScrollTop = node === document ? (node.body.scrollTop || $(window).scrollTop()) : (node as HTMLElement).scrollTop;
                })
                .off('scroll.scroll_evt')
                .on('scroll.scroll_evt', function (evt) {
                    let target = evt.target;
                    let clientHeight;
                    let totalHeight;
                    let scrollTop;
                    // scrollingElement is undefined for IE, safari. use body as target Element
                    target =  target === document ? (target.scrollingElement || document.body) : target;

                    clientHeight = target.clientHeight;
                    totalHeight = target.scrollHeight;
                    scrollTop = target === document.body ? $(window).scrollTop() : target.scrollTop;

                    if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                        $(this).off('scroll.scroll_evt');
                        self.debouncedFetchNextDatasetOnScroll();
                    }

                    lastScrollTop = scrollTop;
                });
            $ul.off('wheel.scroll_evt');
        } else {
            // if there is no scrollable element register wheel event on ul element
            $ul.on('wheel.scroll_evt', e => {
                if (e.originalEvent.deltaY > 0) {
                    $ul.off('wheel.scroll_evt');
                    this.debouncedFetchNextDatasetOnScroll();
                }
            });
        }
    }

    /**
     * Update fieldDefs property, fieldDefs is the model of the List Component.
     * fieldDefs is an Array type.
     * @param newVal
     */
    private updateFieldDefs(newVal: Array<any>) {
        if (this.infScroll || this.onDemandLoad) {

            if (!isDefined(this.fieldDefs) || this.dataNavigator.isFirstPage()) {
                this.fieldDefs = [];
            }
            this.fieldDefs = [...this.fieldDefs, ...newVal];
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
        if (!_.isEmpty(newVal)) {

            this.noDataFound = false;
            this.isDataChanged = true;

            if (this.datasource && this.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
                // clone the the data in case of live and service variables to prevent the two-way binding for these variables.
                newVal = _.cloneDeep(newVal);
            }

            if (isObject(newVal) && !_.isArray(newVal)) {
                newVal = _.isEmpty(newVal) ? [] : [newVal];
            }

            if (_.isString(newVal)) {
                newVal = newVal.split(',');
            }

            if (_.isArray(newVal)) {
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
            maxResults: this.pagesize || 5
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

        dataNavigator.maxResults = this.pagesize || 5;
        this.removePropertyBinding('dataset');
        this.dataNavigator.setBindDataSet(this.binddataset, this.viewParent, this.datasource, this.dataset, this.binddatasource);
    }

    private onDataSetChange(newVal) {
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
            if (this.groupby && !_.has(listModel, '_groupIndex')) {
                // If groupby is enabled, item contains _groupIndex property which should be excluded while comparing model.
                itemObj = _.clone(itemObj);
                delete itemObj._groupIndex;
            }
            if (_.isEqual(itemObj, listModel)) {
                return true;
            }
        }) || null;
    }

    private updateSelectedItemsWidgets() {
        if (this.multiselect) {
            (this.selectedItemWidgets as Array<WidgetRef>).length = 0;
        }
        this.listItems.forEach((item: ListItemDirective) => {
            if (item.isActive) {
                if (this.multiselect) {
                    (this.selectedItemWidgets as Array<WidgetRef>).push(item.currentItemWidgets);
                } else {
                    this.selectedItemWidgets = item.currentItemWidgets;
                }
            }
        });
    }

    /**
     * Selects the listItem and updates selecteditem property.
     * If the listItem is already a selected item then deselects the item.
     * @param {ListItemDirective} $listItem: Item to be selected of deselected.
     */
    private toggleListItemSelection($listItem: ListItemDirective) {
        // item is not allowed to get selected if it is disabled.
        if ($listItem && !$listItem.disableItem) {
            let item = $listItem.item;
            if (this.groupby && _.has(item, '_groupIndex')) {
                // If groupby is enabled, item contains _groupIndex property which should be excluded from selecteditem.
                item = _.clone(item);
                delete item._groupIndex;
            }
            if ($listItem.isActive) {
                this._items = _.pullAllWith(this._items, [item], _.isEqual);
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
            this.updateSelectedItemsWidgets();
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
        const selectedItems = _.isArray(this.selecteditem) ? this.selecteditem : [this.selecteditem];

        this.firstSelectedItem = this.lastSelectedItem = null;

        // don't select first item if multi-select is enabled and at least item is already selected in the list.
        if (listItems.length && this.selectfirstitem && !( this._items.length && this.multiselect)) {
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
            // if smoothscroll is set to false, then native scroll has to be applied
            // otherwise smoothscroll events will be binded.
            if (isMobileApp() && smoothScrollEl.length && smoothScrollEl.attr('wmsmoothscroll') === 'true') {
                this.bindIScrollEvt();
            } else {
                this.bindScrollEvt();
            }
        }

        this.isDataChanged = false;
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

    private setupHandlers() {
        this.listItems.changes.subscribe( listItems => {
            this.onListRender(listItems);
            this.cdRef.detectChanges();
        });
        // handle click event in capturing phase.
        this.nativeElement.querySelector('ul.app-livelist-container').addEventListener('click', ($event) => {
            let target = $($event.target).closest('.app-list-item');
            // Recursively find the current list item
            while (target.get(0) && (target.closest('ul.app-livelist-container').get(0) !== $event.currentTarget)) {
                target = target.parent().closest('.app-list-item');
            }
            this.triggerListItemSelection(target, $event);
        }, true);
    }

    // Triggers on drag start while reordering.
    private onReorderStart(evt, ui) {
        ui.placeholder.height(ui.item.height());
        this.$ulEle.data('oldIndex', ui.item.index());
    }

    // Triggers after the sorting.
    private onUpdate(evt, ui) {
        const data = this.fieldDefs;
        const newIndex = ui.item.index();
        const oldIndex = this.$ulEle.data('oldIndex');

        const minIndex = _.min([newIndex, oldIndex]);
        const maxIndex = _.max([newIndex, oldIndex]);

        const draggedItem = _.pullAt(data, oldIndex)[0];

        this.reorderProps.minIndex = _.min([minIndex, this.reorderProps.minIndex]);
        this.reorderProps.maxIndex = _.max([maxIndex, this.reorderProps.maxIndex]);

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

    // configures reordering the list items.
    private configureDnD() {
        const options = {
            appendTo: 'body',
        };

        const $el = $(this.nativeElement);
        this.$ulEle = $el.find('.app-livelist-container');

        configureDnD(this.$ulEle, options, this.onReorderStart.bind(this), this.onUpdate.bind(this));

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

    // this method is called form other data widgets like table.
    public execute(operation, options) {
        if ([DataSource.Operation.IS_API_AWARE, DataSource.Operation.IS_PAGEABLE, DataSource.Operation.SUPPORTS_SERVER_FILTER].includes(operation)) {
            return false;
        }
        return this.datasource.execute(operation, options);
    }

    public handleKeyDown($event, action: string) {
        $event.stopPropagation();
        const listItems: QueryList<ListItemDirective> = this.listItems;

        let presentIndex: number = this.getListItemIndex(this.lastSelectedItem);

        if (this.multiselect) {
            const firstIndex: number = this.getListItemIndex(this.firstSelectedItem);
            const selectCount: number = _.isArray(this.selecteditem) ? this.selecteditem.length : (_.isObject(this.selecteditem) ? 1 : 0);
            if (action === 'selectPrev') {
                if (presentIndex > 0) {
                    if ((presentIndex <= firstIndex) && this.checkSelectionLimit(selectCount)) {
                        this.lastSelectedItem = this.getListItemByIndex( presentIndex - 1);
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
            presentIndex = presentIndex <= 0 ? 0 : (presentIndex - 1);
            this.lastSelectedItem = this.getListItemByIndex(presentIndex);
            this.lastSelectedItem.nativeElement.focus();
        } else if (action === 'focusNext') {
            presentIndex = presentIndex < (listItems.length - 1) ? (presentIndex + 1) : (listItems.length - 1);
            this.lastSelectedItem = this.getListItemByIndex(presentIndex);
            this.lastSelectedItem.nativeElement.focus();
        } else if (action === 'select') {
            // if the enter click is pressed on the item which is not the last selected item, the find the item from which the event is originated.
            if (presentIndex === -1 || !$($event.target).closest(this.lastSelectedItem.nativeElement)) {
                const $li = $($event.target).closest('li.app-list-item');
                const $ul = $li.closest('ul.app-livelist-container');
                presentIndex = $ul.find('li.app-list-item').index($li);
            }
            this.onItemClick($event, this.getListItemByIndex(presentIndex));
        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'dataset') {
            if (!nv && this.binddatasource && !this.datasource) {
                return;
            }
            this.onDataSetChange(nv);
        } else if (key === 'datasource') {
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
            this.setListClass();
        } else if (key === 'tabindex') {
            return;
        } else if (key === 'pulltorefresh' && nv) {
            this.app.notify('pullToRefresh:enable');
            this.subscribeToPullToRefresh();
        } else if (key === 'paginationclass') {
            if (this.dataNavigator) {
                // Adding setTimeout because in pagination component updateNavSize method is overriding navigationclass
                setTimeout( () => this.dataNavigator.navigationClass = nv);
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    public onItemClick(evt: any, $listItem: ListItemDirective) {
        let selectCount: number;

        if (!$listItem.disableItem) {
            this.firstSelectedItem = this.firstSelectedItem || $listItem;
            // Setting selectCount value based number of items selected.
            selectCount = _.isArray(this.selecteditem) ? this.selecteditem.length : (_.isObject(this.selecteditem) ? 1 : 0);

            // Handling multiselect for mobile applications
            if (this.multiselect && isMobileApp()) {
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
                }  else {
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
    public clear () {
        this.updateFieldDefs([]);
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

    /**
     * deselects item in the list.
     * @param val: index | model of the list item.
     */
    public deselectItem (val: any) {
        const listItem = this.getItemRefByIndexOrModel(val);
        if (listItem && listItem.isActive) {
            this.toggleListItemSelection(listItem);
        }
    }

    /**
     * selects item in the list.
     * @param val: index | model of the list item.
     */
    public selectItem(val) {
        const listItem = this.getItemRefByIndexOrModel(val);
        if (!listItem) {
            return;
        }
        if (!listItem.isActive) {
            this.toggleListItemSelection(listItem);
        }
        // focus the element.
        listItem.nativeElement.focus();
    }

    private beforePaginationChange($event, $index) {
        this.invokeEventCallback('paginationchange', {$event, $index});
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        // tap and doubleTap events are not getting propagated.So, using mouse events instead.
        const touchToMouse = {
            tap: 'click',
            doubletap: 'dblclick'
        };
        if (_.includes(['click', 'tap', 'dblclick', 'doubletap'], eventName)) {
            this.eventManager.addEventListener(
                this.nativeElement,
                touchToMouse[eventName] || eventName,
                (evt) => {
                    const target = $(evt.target).closest('.app-list-item');
                    if (target.length) {
                        const listItemContext: ListItemDirective = target.data('listItemContext');
                        if (!listItemContext.disableItem) {
                            this.invokeEventCallback(eventName, {widget: listItemContext, $event: evt, item: listItemContext.item});
                        }
                    }
                }
            );
        }
    }

    // Invoke the datasource variable by default when pulltorefresh event is not specified.
    private subscribeToPullToRefresh() {
        this.cancelSubscription = this.app.subscribe('pulltorefresh', () => {
            if (this.datasource && this.datasource.listRecords) {
                this.datasource.listRecords();
            }
        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.handleHeaderClick = noop;
        this._items = [];
        this.fieldDefs = [];
        // When pagination is infinite scroll dataset is applying after debounce time(250ms) so making next call after previous data has rendered
        this.debouncedFetchNextDatasetOnScroll = _.debounce(this.fetchNextDatasetOnScroll, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
        this.reorderProps = {
            minIndex: null,
            maxIndex: null
        };
    }

    ngAfterViewInit() {
        this.promiseResolverFn();
        this.propsInitPromise.then(() => {
            super.ngAfterViewInit();
            this.selectedItemWidgets = this.multiselect ? [] : {};
            if (this.enablereorder && !this.groupby) {
                this.configureDnD();
            }
            if (this.groupby && this.collapsible) {
                this.handleHeaderClick = handleHeaderClick;
                this.toggleAllHeaders = toggleAllHeaders.bind(undefined, this);
            }
            this.setListClass();
        });
        this.setupHandlers();
        const $ul = this.nativeElement.querySelector('ul.app-livelist-container');
        styler($ul as HTMLElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);

        if (isMobileApp() && $ul.querySelector('.app-list-item-action-panel')) {
            this._listAnimator = new ListAnimator(this);
        }
    }

    ngOnDestroy() {
        if (this._listAnimator && this._listAnimator.$btnSubscription) {
            this._listAnimator.$btnSubscription.unsubscribe();
        }
        if (this.cancelSubscription) {
            this.cancelSubscription();
        }
    }
}
