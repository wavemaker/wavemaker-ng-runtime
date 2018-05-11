import { AfterViewInit, Attribute, Component, ContentChild, ElementRef, forwardRef, Injector, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';

import { $appDigest, isDefined, isObject } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './list.props';
import { NAVIGATION_TYPE } from '../../../utils/widget-utils';
import { PaginationComponent } from '../pagination/pagination.component';
import { ListItemDirective } from './list-item.directive';
import { getOrderedDataSet } from '../../../utils/form-utils';

declare const _;
declare const $;

registerProps();

const DEFAULT_CLS = 'app-livelist app-panel';
const WIDGET_CONFIG = {widgetType: 'wm-list', hostClass: DEFAULT_CLS};

@Component({
    selector: 'div[wmList]',
    templateUrl: './list.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => ListComponent)}
    ]
})
export class ListComponent extends StylableComponent implements AfterViewInit {

    // ToDo: itemsPerRow should be dynamically generated.
    private itemsPerRowClass: string = 'col-xs-12 col-sm-12 col-md-12 col-lg-12';
    private firstSelectedItem: ListItemDirective;
    private lastSelectedItem: ListItemDirective;

    @ContentChild('listTemplate') listTemplate: TemplateRef<ElementRef>;
    @ViewChild(PaginationComponent) dataNavigator;

    @ViewChildren(ListItemDirective) listItems: QueryList<ListItemDirective>;

    navControls;
    datasource;
    disableitem;
    navigation;
    navigationalign;
    navigatorMaxResultWatch;
    navigatorResultWatch;
    noDataFound;
    pagesize;
    dataset;
    multiselect;
    selectfirstitem;
    showNavigation;
    reorderProps: {
        minIndex: number,
        maxIndex: number
    } = {minIndex: null, maxIndex: null};

    orderby: string;
    loadingicon: string = 'fa fa-circle-o-notch';
    paginationclass: string;
    ondemandmessage: string = 'Load More';
    loadingdatamsg: string = 'Loading...';

    infScroll: boolean;
    onDemandLoad: boolean;
    enablereorder: boolean = false;
    variableInflight: boolean = false;


    fieldDefs: Array<any> = [];
    _items: Array<any> = [];
    dataNavigatorWatched: boolean = false;

    get selecteditem() {
        if (this.multiselect) {
            return this._items;
        }
        if (_.isEmpty(this._items)) {
            return {};
        }
        return this._items[0];
    }

    set selecteditem(items) {
        this._items.length = 0;
        if (_.isArray(items)) {
            _.forEach(items, (item) => {
                this.selectItem(item);
            });
        } else {
            this.selectItem(items);
        }
        $appDigest();
    }

    constructor(
        inj: Injector,
        @Attribute('itemclass.bind') public binditemclass,
        @Attribute('disableitem.bind') public binddisableitem,
        @Attribute('dataset.bind') public binddataset
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
    }

    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    private listTrackByFn(index: number): number {
        return index;
    }

    private resetNavigation() {
        this.showNavigation = false;
        this.navControls    = undefined;
        this.infScroll      = false;
        this.onDemandLoad   = false;
    }

    private enableBasicNavigation() {
        this.navControls    = NAVIGATION_TYPE.BASIC;
        this.showNavigation = true;
    }

    private enableInlineNavigation() {
        this.navControls = NAVIGATION_TYPE.INLINE;
    }

    private enableClassicNavigation() {
        this.navControls    = NAVIGATION_TYPE.CLASSIC;
        this.showNavigation = true;
    }

    private enablePagerNavigation() {
        this.navControls    = NAVIGATION_TYPE.PAGER;
        this.showNavigation = true;
    }

    private setNavigationTypeNone() {
        this.navControls = NAVIGATION_TYPE.NONE;
        this.showNavigation = false;
    }
    enableInfiniteScroll() {
        this.infScroll = true;
    }

    enableOnDemandLoad() {
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

    private _fetchNextOnScroll() {
        setTimeout(() => {
            this.dataNavigator.navigatePage('next');
        });
    }

    private bindScrollEvt() {
        const $el = $(this.nativeElement),
            $ul = $el.find('> ul'),
            $firstChild = $ul.children().first(),
            $c = this;

        let $scrollParent,
            scrollNode,
            lastScrollTop  = 0;

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
                .each(function () {
                    // scrollTop property is 0 or undefined for body in IE, safari.
                    lastScrollTop = this === document ? (this.body.scrollTop || $(window).scrollTop()) : this.scrollTop;
                })
                .off('scroll.scroll_evt')
                .on('scroll.scroll_evt', function (evt) {
                    let target = evt.target,
                        clientHeight,
                        totalHeight,
                        scrollTop;
                    // scrollingElement is undefined for IE, safari. use body as target Element
                    target =  target === document ? (target.scrollingElement || document.body) : target;

                    clientHeight = target.clientHeight;
                    totalHeight  = target.scrollHeight;
                    scrollTop    = target === document.body ? $(window).scrollTop() : target.scrollTop;

                    if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                        $(this).off('scroll.scroll_evt');
                        $c._fetchNextOnScroll();
                    }

                    lastScrollTop = scrollTop;
                });
            $ul.off('wheel.scroll_evt');
        } else {
            // if there is no scrollable element register wheel event on ul element
            $ul.on('wheel.scroll_evt', function (e) {
                if (e.originalEvent.deltaY > 0) {
                    $ul.off('wheel.scroll_evt');
                    $c._fetchNextOnScroll();
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
            if (!isDefined(this.fieldDefs)) {
                this.fieldDefs = [];
            }

            if (this.dataNavigator.isFirstPage()) {
                this.fieldDefs.length = 0;
            }

            _.forEach(newVal, (item) => {
                this.fieldDefs.push(item);
            });

            setTimeout(() => {
                // Functionality of On-Demand and Scroll will be same except we don't attach scroll events
                if (this.fieldDefs.length && !this.onDemandLoad) {
                    this.bindScrollEvt();
                }
            }, 100);
        } else {
            this.fieldDefs = newVal;
        }
        if (this.orderby) {
            this.fieldDefs = getOrderedDataSet(this.fieldDefs, this.orderby);
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

            if (newVal.data) {
                newVal = newVal.data;
            }

            if (isObject(newVal) && !_.isArray(newVal)) {
                newVal = _.isEmpty(newVal) ? [] : [newVal];
            }
            if (_.isString(newVal)) {
                newVal = newVal.split(',');
            }

            if (_.isArray(newVal)) {
                this.updateFieldDefs(newVal);
            }
        } else {
            this.updateFieldDefs([]);
        }
    }

    /**
     * Updates the dataSource when pagination is enabled for the Component.
     */
    private setupDataSource() {
        const dataNavigator = this.dataNavigator;

        dataNavigator.pagingOptions = {
            maxResults: this.pagesize || 5
        };

        this.dataNavigatorWatched = true;

        if (this.navigatorResultWatch) {
            this.navigatorResultWatch.unsubscribe();
        }
        /*Register a watch on the "result" property of the "dataNavigator" so that the paginated data is displayed in the live-list.*/
        this.navigatorResultWatch = dataNavigator.resultEmitter.subscribe((val) => {
            /* Check for sanity. */
            if (isDefined(val)) {
                this.onDataChange(val);
            } else {
                this.onDataChange(undefined);
            }
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
        this.dataNavigator.setBindDataSet(this.binddataset, this.pageComponent, this.datasource);
    }

    private onDataSetChange(newVal) {
        if (!this.dataNavigatorWatched) {
            if (this.navigation !== 'None') {
                this.setupDataSource();
            } else {
                this.onDataChange(newVal);
            }
        }
    }

    /**
     * All the ListItem's Active state is set to false.
     */
    private deselectListItems() {
        this.listItems.forEach(item => item.isActive = false);
    }

    /**
     * Deselect all the ListItems and clear the selecteditem(InOutBound Property model)
     */
    private clearItems() {
        this.deselectListItems();
        this._items.length = 0;
    }

    /**
     * Selects an item and updates selecteditem property.
     * If the item is already a selected selected item then deselects the item.
     * @param {ListItemDirective} $listItem
     */
    setItem($listItem: ListItemDirective) {
        const item = $listItem.item;
        if ($listItem.isActive) {
            this._items = _.pullAllWith(this._items, [item], _.isEqual);
            $listItem.isActive = false;
        } else {
            this._items.push(item);
            $listItem.isActive = true;
        }
    }

    /**
     * Gets the List item by checking the equality of the model of the ListItem.
     * @param listItems: array of ListItems.
     * @param listModel: model to be searched for
     * @returns ListItem if the model is matched else return null.
     */
    private getListItem(listItems, listModel) {
        return listItems.find((listItem) => {
            if (_.isEqual(listItem.item, listModel)) {
                return listItem;
            }
        }) || null;
    }

    /**
     * Selects or Deselects a List Item.
     * @param {ListItemDirective} $listItem: Item to be selected of deselected.
     * @param {boolean} isSelect: true to select an item or false to deselect.
     */
    private toggleListItem($listItem: ListItemDirective, isSelect: boolean) {
        if($listItem && !$listItem.disableItem) {
            if (!this.multiselect) {
                this.clearItems();
            }
            $listItem.isActive = !isSelect;
            this.setItem($listItem);
        }
    }

    /**
     * Select or Deselect an ListItem whose model is matched .
     * @param listModel: Model to be searched over the ListItems.
     */
    private selectItem(listModel) {
        const $listItem = <ListItemDirective>this.getListItem(this.listItems, listModel);
        this.toggleListItem($listItem, true);
    }

    /**
     * Method is Invoked when the model for the List Widget is changed.
     * @param {QueryList<ListItemDirective>} listItems
     */
    private onlistRender(listItems: QueryList<ListItemDirective>) {
        const selectedItems = _.isArray(this.selecteditem)? this.selecteditem : [this.selecteditem];

        this.firstSelectedItem = this.lastSelectedItem = null;

        if(this.selectfirstitem && !(_.get(this, ['dataNavigator', 'dn', 'currentPage']) !== 1 && this.multiselect)) {
            const $firstItem: ListItemDirective = listItems.first;
            if(!$firstItem.disableItem) {
                this.clearItems();
                this.firstSelectedItem = this.lastSelectedItem = $firstItem;
                this.setItem($firstItem);
            }
        } else {
            this.deselectListItems();
            selectedItems.forEach((selecteditem) => {
                let listItem: ListItemDirective = this.getListItem(listItems, selecteditem);
                if(listItem) {
                    listItem.isActive = true;
                }
            });
        }
    }

    private setupHandlers() {
        this.listItems.changes.subscribe( listItems => {
            this.onlistRender(listItems);
            $appDigest();
        });
    }

    private configureDnD() {
        const $el = $(this.nativeElement),
            $ulEle = $el.find('.app-livelist-container'),
            $is = this;
        $ulEle.sortable({
            'appendTo'    : 'body',
            'containment' : $ulEle,
            'delay'       : 100,
            'opacity'     : 0.8,
            'helper'      : 'clone',
            'zIndex'      : 1050,
            'tolerance'   : 'pointer',
            'start'       : function (evt, ui) {
                ui.placeholder.height(ui.item.height());
                $(this).data('oldIndex', ui.item.index());
            },
            'update'      : function (evt, ui) {
                let changedItem,
                    newIndex,
                    oldIndex,
                    draggedItem,
                    $dragEl,
                    minIndex,
                    maxIndex,
                    data;

                data        = $is.fieldDefs;
                $dragEl     = $(this);
                newIndex    = ui.item.index();
                oldIndex    = $dragEl.data('oldIndex');

                minIndex    = _.min([newIndex, oldIndex]);
                maxIndex    = _.max([newIndex, oldIndex]);
                $is.reorderProps.minIndex = _.min([minIndex, $is.reorderProps.minIndex]);
                $is.reorderProps.maxIndex = _.max([maxIndex, $is.reorderProps.maxIndex]);

                draggedItem = _.pullAt(data, oldIndex)[0];
                data.splice(newIndex, 0, draggedItem);
                // cancel the sort even. as the data model is changed Angular will render the list.
                $ulEle.sortable("cancel");
                changedItem = {
                    oldIndex: oldIndex,
                    newIndex: newIndex,
                    item: data[newIndex]
                };
                $dragEl.removeData('oldIndex');
                setTimeout(() => {
                    $is.listItems.setDirty();
                });
                $appDigest();
            }
        });
        $el.find('.app-livelist-container').droppable({'accept': '.app-list-item'});
    }

    /*================================  PUBLIC METHODS  ====================================*/

    onPropertyChange(key, newVal, oldVal?) {
        switch (key) {
            case  'dataset' :
                if (!this.datasource || !newVal) {
                    return;
                }
                this.onDataSetChange(newVal.data || newVal);
                break;
            case 'datasource':
                if (this.dataset) {
                    this.onDataSetChange(this.dataset.data || this.dataset);
                }
                break;
            case 'navigation':
                this.onNavigationTypeChange(newVal);
                if (this.dataNavigator) {
                    this.dataNavigator.navigationClass = this.paginationclass;
                }
                break;
        }
        $appDigest();
    }

    onItemClick(evt: any, $listItem: ListItemDirective) {
        if (!$listItem.disableItem) {
            if ((evt.ctrlKey || evt.metaKey) && this.multiselect) {
                this.firstSelectedItem = this.lastSelectedItem = $listItem;
                this.setItem($listItem);
            } else if (evt.shiftKey && this.multiselect && this.firstSelectedItem) {
                let first = $listItem.context.index,
                    last = this.firstSelectedItem.context.index;

                // if first is greater than last, then swap values
                if (first > last) {
                    last = [first, first = last][0];
                }
                this.clearItems();
                this.listItems.forEach(($liItem: ListItemDirective) => {
                    const index = $liItem.context.index;
                    if (index >= first && index <= last) {
                        this.setItem($liItem);
                    }
                });

                this.lastSelectedItem = $listItem;
            } else {
                this.firstSelectedItem = this.lastSelectedItem = $listItem;
                this.clearItems();
                this.setItem($listItem);
            }
        }
        $appDigest();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.setupHandlers();
        if (this.enablereorder) {
           this.configureDnD();
        }
    }
}
