import { AfterViewInit, Attribute, ChangeDetectorRef, Component, ContentChild, ElementRef, Injector, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { $appDigest, App, DataSource, getClonedObject, isDataSourceEqual, isDefined, isNumber, isObject, noop, switchClass } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { ToDatePipe } from '../../../pipes/custom-pipes';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './list.props';
import { NAVIGATION_TYPE, provideAsWidgetRef } from '../../../utils/widget-utils';
import { PaginationComponent } from '../pagination/pagination.component';
import { ListItemDirective } from './list-item.directive';
import { configureDnD, getOrderedDataset, groupData, handleHeaderClick, toggleAllHeaders } from '../../../utils/form-utils';
import { WidgetRef } from '../../framework/types';

declare const _;
declare const $;

registerProps();

const DEFAULT_CLS = 'app-livelist app-panel';
const WIDGET_CONFIG = {widgetType: 'wm-list', hostClass: DEFAULT_CLS};

@Component({
    selector: 'div[wmList]',
    templateUrl: './list.component.html',
    providers: [
        provideAsWidgetRef(ListComponent)
    ]
})
export class ListComponent extends StylableComponent implements OnInit, AfterViewInit {

    @ContentChild('listTemplate') listTemplate: TemplateRef<ElementRef>;

    @ViewChild(PaginationComponent) dataNavigator;
    @ViewChildren(ListItemDirective) listItems: QueryList<ListItemDirective>;

    private itemsPerRowClass: string;
    private firstSelectedItem: ListItemDirective;
    private lastSelectedItem: ListItemDirective;
    private navigatorMaxResultWatch: Subscription;
    private navigatorResultWatch: Subscription;
    private navControls: string;
    private onDemandLoad: boolean;
    private _items: Array<any>;
    private dataNavigatorWatched: boolean;
    private datasource: any;
    private showNavigation: boolean;
    private noDataFound: boolean;
    private debouncedFetchNextDatasetOnScroll: Function;
    private reorderProps: any;
    private app: any;

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

    private match: string;
    private dateformat: string;
    private groupedData: any;
    private cdRef: ChangeDetectorRef;
    private promiseResolverFn: Function;
    private propsInitPromise: Promise<any>;
    private $ulEle: any;

    public get selecteditem() {
        if (this.multiselect) {
            return getClonedObject(this._items);
        }
        if (_.isEmpty(this._items)) {
            return {};
        }
        return getClonedObject(this._items[0]);
    }

    public set selecteditem(items) {
        this._items.length = 0;
        this.deselectListItems();

        if (_.isArray(items)) {
            items.forEach(item => this.selectItemByModel(item));
        } else {
            this.selectItemByModel(items);
        }
        $appDigest();
    }

    constructor(
        inj: Injector,
        cdRef: ChangeDetectorRef,
        datePipe: ToDatePipe,
        app: App,
        @Attribute('itemclass.bind') binditemclass: string,
        @Attribute('disableitem.bind') binddisableitem: string,
        @Attribute('dataset.bind') binddataset: string,
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
        this.datePipe = datePipe;

        this.binditemclass = binditemclass;
        this.binddisableitem = binddisableitem;
        this.binddataset = binddataset;
        this.mouseEnterCB = mouseEnterCB;
        this.mouseLeaveCB = mouseLeaveCB;

        this.app = app;
        this.variableInflight = false;

        this.noDataFound = !binddataset;

        // Show loading status based on the variable life cycle
        this.app.subscribe('toggle-variable-state', this.handleLoading.bind(this));
    }

    handleLoading(data) {
        const dataSource = this.datasource;
        if (dataSource && dataSource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(data.variable, dataSource)) {
            this.variableInflight = data.active;
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
            this.groupedData = groupData(this, this.fieldDefs, this.groupby, this.match, this.orderby, this.dateformat, this.datePipe);
        }

        if (!this.fieldDefs.length) {
            this.noDataFound = true;
            this.selecteditem = undefined;
        }
        $appDigest();
        this.listItems.setDirty();
    }

    private onDataChange(newVal) {
        if (newVal) {

            this.noDataFound = false;

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
        this.navigatorResultWatch = dataNavigator.resultEmitter.subscribe((newVal: any) => this.onDataChange(newVal), true);
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
        this.dataNavigator.setBindDataSet(this.binddataset, this.viewParent, this.datasource);
    }

    private onDataSetChange(newVal) {
        if (!this.dataNavigatorWatched) {
            if (this.navigation !== 'None' && this.datasource) {
                this.setupDataSource();
            } else {
                this.onDataChange(newVal);
            }
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
            if (_.isEqual(listItem.item, listModel)) {
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
            const item = $listItem.item;
            if (!this.multiselect) {
                this.clearSelectedItems();
            }
            if ($listItem.isActive) {
                this._items = _.pullAllWith(this._items, [item], _.isEqual);
                $listItem.isActive = false;
            } else {
                this._items.push(item);
                $listItem.isActive = true;
            }
            this.updateSelectedItemsWidgets();
        }
    }

    /**
     * Select an ListItem whose model is matched.
     * It also updates the selected item of the list
     * @param listModel: Model to be searched over the ListItems.
     */
    private selectItemByModel(listModel) {
        const $listItem = <ListItemDirective>this.getListItemByModel(listModel);
        if ($listItem) {
            $listItem.isActive = false;
            this.toggleListItemSelection($listItem);
        }
    }

    /**
     * Method is Invoked when the model for the List Widget is changed.
     * @param {QueryList<ListItemDirective>} listItems
     */
    private onListRender(listItems: QueryList<ListItemDirective>) {
        const selectedItems = _.isArray(this.selecteditem) ? this.selecteditem : [this.selecteditem];

        this.firstSelectedItem = this.lastSelectedItem = null;

        // selectfirst item when the pagination in the first page.
        if (listItems.length && this.selectfirstitem && !(_.get(this, ['dataNavigator', 'dn', 'currentPage']) !== 1 && this.multiselect)) {
            const $firstItem: ListItemDirective = listItems.first;
            if (!$firstItem.disableItem) {
                this.clearSelectedItems();
                this.firstSelectedItem = this.lastSelectedItem = $firstItem;
                this.toggleListItemSelection($firstItem);
            }
        } else {
            this.deselectListItems();
            selectedItems.forEach(selecteditem => {
                const listItem: ListItemDirective = this.getListItemByModel(selecteditem);
                if (listItem) {
                    listItem.isActive = true;
                }
            });
        }

        if (this.fieldDefs.length && this.infScroll) {
            this.bindScrollEvt();
        }
    }

    private setupHandlers() {
        this.listItems.changes.subscribe( listItems => {
            this.onListRender(listItems);
            this.cdRef.detectChanges();
        });
        // handle click event in capturing phase.
        this.nativeElement.querySelector('ul.app-livelist-container').addEventListener('click', ($event) => {
            const target = $($event.target).closest('.app-list-item');
            if (target[0]) {
                const listItemContext = target.data('listItemContext');
                this.onItemClick($event, listItemContext);
            }
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
    private getQueryListItemByIndex(index: number): ListItemDirective {
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
        const listItems: QueryList<ListItemDirective> = this.listItems;

        let presentIndex: number = this.getListItemIndex(this.lastSelectedItem);

        if (this.multiselect) {
            const firstIndex: number = this.getListItemIndex(this.firstSelectedItem);
            const selectCount: number = _.isArray(this.selecteditem) ? this.selecteditem.length : (_.isObject(this.selecteditem) ? 1 : 0);
            if (action === 'selectPrev') {
                if (presentIndex > 0) {
                    if ((presentIndex <= firstIndex) && this.checkSelectionLimit(selectCount)) {
                        this.lastSelectedItem = this.getQueryListItemByIndex( presentIndex - 1);
                        this.toggleListItemSelection(this.lastSelectedItem);
                    } else if (presentIndex > firstIndex) {
                        this.toggleListItemSelection(this.getQueryListItemByIndex(presentIndex));
                        this.lastSelectedItem = this.getQueryListItemByIndex(presentIndex - 1);
                    } else {
                        this.invokeEventCallback('selectionlimitexceed', {$event});
                    }
                }
            } else if (action === 'selectNext') {
                if (presentIndex < listItems.length - 1) {
                    if ((presentIndex >= firstIndex) && this.checkSelectionLimit(selectCount)) {
                        this.lastSelectedItem = this.getQueryListItemByIndex(presentIndex + 1);
                        this.toggleListItemSelection(this.lastSelectedItem);
                    } else if (presentIndex < firstIndex) {
                        this.toggleListItemSelection(this.getQueryListItemByIndex(presentIndex));
                        this.lastSelectedItem = this.getQueryListItemByIndex(presentIndex + 1);
                    } else {
                        this.invokeEventCallback('selectionlimitexceed', {$event});
                    }
                }
            }
        }
        if (action === 'focusPrev') {
            if (presentIndex !== 0) {
                this.lastSelectedItem = this.getQueryListItemByIndex(presentIndex - 1);
                this.lastSelectedItem.nativeElement.focus();
            }
        } else if (action === 'focusNext') {
            if (presentIndex !== listItems.length - 1) {
                this.lastSelectedItem = this.getQueryListItemByIndex(presentIndex + 1);
                this.lastSelectedItem.nativeElement.focus();
            }
        } else if (action === 'select') {
            if (presentIndex === -1) {
                const $li = $($event.target).closest('li.app-list-item');
                const $ul = $li.closest('ul.app-livelist-container');
                presentIndex = $ul.find('li.app-list-item').index($li);
            }
            this.onItemClick($event, this.getQueryListItemByIndex(presentIndex));
        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'dataset') {
            if (!nv) {
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

            // TODO: Handle multiselect for mobile applications
            if ((evt.ctrlKey || evt.metaKey) && this.multiselect) {
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
            listItem = this.getQueryListItemByIndex(val);
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
        if (listItem && !listItem.isActive) {
            this.toggleListItemSelection(listItem);
        }
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (_.includes(['click', 'tap', 'dblclick', 'doubletap'], eventName)) {
            this.eventManager.addEventListener(
                this.nativeElement,
                eventName,
                (evt) => {
                    const target = $(evt.target).closest('.app-list-item');
                    if (target.length) {
                        const listItemContext: ListItemDirective = target.data('listItemContext');
                        if (!listItemContext.disableItem) {
                            this.invokeEventCallback(eventName, {$event: evt, item: listItemContext.item});
                        }
                    }
                }
            );
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.handleHeaderClick = noop;
        this._items = [];
        this.fieldDefs = [];
        this.debouncedFetchNextDatasetOnScroll = _.debounce(this.fetchNextDatasetOnScroll, 50);
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
        styler(this.nativeElement.querySelector('ul.app-livelist-container') as HTMLElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
}

