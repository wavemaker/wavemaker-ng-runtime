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

    @ContentChild('listTemplate') listTemplate: TemplateRef<ElementRef>;
    @ViewChild(PaginationComponent) dataNavigator;

    @ViewChildren(ListItemDirective) listItems: QueryList<ListItemDirective>;

    navControls;
    navigation;
    navigationalign;
    navigatorMaxResultWatch;
    navigatorResultWatch;
    noDataFound;
    orderby;
    pagesize;
    dataset;
    multiselect;
    showNavigation;

    fieldDefs: Array<any> = [];
    selectedItems: Array<any> = [];
    dataNavigatorWatched: boolean = false;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef,
                @Attribute('itemclass.bind') public binditemclass,
                @Attribute('disableitem.bind') public binddisableitem,
                @Attribute('dataset.bind') public binddataset) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this, APPLY_STYLES_TYPE.SHELL);
    }

    listTrackByFn(index) {
        return index;
    }

    resetNavigation() {
        this.showNavigation = false;
        this.navControls    = undefined;
    }

    enableBasicNavigation() {
        this.navControls    = NAVIGATION_TYPE.BASIC;
        this.showNavigation = true;
    }

    enableInlineNavigation() {
        this.navControls = NAVIGATION_TYPE.INLINE;
    }

    enableClassicNavigation() {
        this.navControls    = NAVIGATION_TYPE.CLASSIC;
        this.showNavigation = true;
    }

    enablePagerNavigation() {
        this.navControls    = NAVIGATION_TYPE.PAGER;
        this.showNavigation = true;
    }

    setNavigationTypeNone() {
        this.navControls = NAVIGATION_TYPE.NONE;
        this.showNavigation = false;
    }

    onNavigationTypeChange(type) {
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

    updateFieldDefs(newVal: Array<any>) {
        this.fieldDefs = newVal;
        this.listItems.setDirty();
    }

    onDataChange(newVal) {
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

    setupDataSource() {
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

    onDataSetChange(newVal) {
        if (this.navigation !== 'None' && !this.dataNavigatorWatched) {
            this.setupDataSource();
        } else {
            this.onDataChange(newVal);
        }
    }

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

    clearItems() {
        this.listItems.forEach(item => item.isActive = false);
    }

    setItems(listItem: ListItemDirective) {
        const item = listItem.item;
        if (!this.multiselect) {
            this.selectedItems.length = 0;
            this.selectedItems.push(item);
            listItem.isActive = true;
        }
    }

    setupHandlers() {
        this.listItems.changes.subscribe( listItems => {
            setTimeout(() => {
                this.clearItems();
                listItems.forEach((listItem) => {
                    if (_.isEqual(listItem.item, this.selectedItems[0])) {
                        listItem.isActive = true;
                        return;
                    }
                });
            });
        });
    }

    ngAfterViewInit() {
        this.setupHandlers();
    }
}
