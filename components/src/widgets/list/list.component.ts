import { Component, Injector, ChangeDetectorRef,
    ContentChild, ElementRef, ViewChild, ViewChildren, QueryList, Attribute,
    TemplateRef, AfterViewInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './list.props';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { isDefined, isObject, $appDigest } from '@wm/utils';
import { NAVIGATION_TYPE } from '../../utils/widget-utils';
import { PaginationComponent } from '../pagination/pagination.component';
import { ListItemDirective } from './list-item.directive';

declare const _;
declare const $;

registerProps();

const DEFAULT_CLS = 'app-livelist app-panel';
const WIDGET_CONFIG = {widgetType: 'wm-list', hostClass: DEFAULT_CLS};

@Component({
    selector: 'div[wmList]',
    templateUrl: './list.component.html'
})
export class ListComponent extends BaseComponent implements AfterViewInit {

    // ToDo: itemsPerRow should be dynamically generated.
    private itemsPerRowClass: string = 'col-xs-12 col-sm-12 col-md-12 col-lg-12';
    private firstSelectedItem: ListItemDirective;
    private lastSelectedItem: ListItemDirective;

    @ContentChild('listTemplate') listTemplate: TemplateRef<ElementRef>;
    @ViewChild(PaginationComponent) dataNavigator;

    @ViewChildren(ListItemDirective) listItems: QueryList<ListItemDirective>;

    navControls;
    disableitem;
    navigation;
    navigationalign;
    navigatorMaxResultWatch;
    navigatorResultWatch;
    noDataFound;
    orderby;
    pagesize;
    dataset;
    multiselect;
    selectfirstitem;
    showNavigation;

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

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef,
                @Attribute('itemclass.bind') public binditemclass,
                @Attribute('disableitem.bind') public binddisableitem,
                @Attribute('dataset.bind') public binddataset) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this, APPLY_STYLES_TYPE.SHELL);
    }

    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    private listTrackByFn(index: number):number {
        return index;
    }

    private resetNavigation() {
        this.showNavigation = false;
        this.navControls    = undefined;
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
        }
    }

    /**
     * Update fieldDefs property, fieldDefs is the model of the List Component.
     * fieldDefs is an Array type.
     * @param newVal
     */
    private updateFieldDefs(newVal: Array<any>) {
        this.fieldDefs = newVal;
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
        this.dataNavigator.setBindDataSet(this.binddataset, this.parent);
    }

    private onDataSetChange(newVal) {
        if (this.navigation !== 'None' && !this.dataNavigatorWatched) {
            this.setupDataSource();
        } else {
            this.onDataChange(newVal);
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
            $listItem.isActive = isSelect ? false : true;
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

    /*================================  PUBLIC METHODS  ====================================*/

    onPropertyChange(key, newVal, oldVal?) {
        switch (key) {
            case  'dataset' :
                this.onDataSetChange(newVal.data || newVal);
                break;

            case 'navigation':
                this.onNavigationTypeChange(newVal);
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
        this.setupHandlers();
    }
}
