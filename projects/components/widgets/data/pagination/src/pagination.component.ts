import { Component, EventEmitter, Inject, Injector, Output, SkipSelf, AfterViewInit } from '@angular/core';

import { $appDigest, $watch, AppConstants, DataSource, debounce, isDefined, switchClass, triggerFn } from '@wm/core';
import { DEBOUNCE_TIMES, getOrderByExpr, provideAsWidgetRef, StylableComponent, styler, WidgetRef } from '@wm/components/base';
import { registerProps } from './pagination.props';

declare const _;

const DEFAULT_CLS = 'app-datanavigator clearfix';
const WIDGET_CONFIG = {widgetType: 'wm-pagination', hostClass: DEFAULT_CLS};

const sizeClasses = {
    'Pager': {
        'small': 'pager-sm',
        'large': 'pager-lg'
    },
    'Basic': {
        'small': 'pagination-sm',
        'large': 'pagination-lg'
    },
    'Classic': {
        'small': 'pagination-sm',
        'large': 'pagination-lg'
    }
};

const unsupportedStatePersistenceTypes = ['On-Demand', 'Scroll'];

@Component({
    selector: '[wmPagination]',
    templateUrl: './pagination.component.html',
    providers: [
        provideAsWidgetRef(PaginationComponent)
    ]
})
export class PaginationComponent extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();
    @Output() resultEmitter: EventEmitter<any> = new EventEmitter();
    @Output() maxResultsEmitter: EventEmitter<any> = new EventEmitter();

    datasource;
    maxResults;
    navigationsize;
    showrecordcount;

    navcontrols;
    navigation;

    boundarylinks;
    directionlinks;

    navigationClass;
    dn = {
        currentPage: 1
    };

    pageCount = 0;
    isDisableNext = true;
    isDisablePrevious = true;
    isDisableFirst = true;
    isDisableLast = true;
    isDisableCurrent;
    dataSize;
    prevshowrecordcount;
    isDisableCount;
    firstRow;
    result;
    __fullData;
    dataset;
    options;
    statehandler;
    filterFields;
    sortOptions;
    binddataset;
    pagination;

    private _debouncedApplyDataset = debounce(() => this.widget.dataset = this.dataset, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
    private _debouncedPageChanged = debounce(event => {
        const currentPage = event && event.page;
        // Do not call goToPage if page has not changed
        if (currentPage !== this.dn.currentPage) {
            const inst = (this as any).parent || this;
            this.dn.currentPage = currentPage;
            inst.invokeEventCallback('paginationchange', {$event: undefined, $index: this.dn.currentPage});
            this.goToPage();
        }
    }, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);

    constructor(inj: Injector, @SkipSelf() @Inject(WidgetRef) public parent) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    setResult(result) {
        // TODO: Emit event only if result is changed
        this.result = result;
        this.resultEmitter.emit(this.result);
    }

    // Update navigationClass based on navigation and navigationSize props
    private updateNavSize() {
        const sizeCls = sizeClasses[this.navcontrols];
        if (sizeCls && this.navigationsize) {
            this.navigationClass = sizeCls[this.navigationsize];
        } else {
            this.navigationClass = '';
        }
    }

    // Function to reset the paging values to default.
    resetPageNavigation() {
        this.pageCount = 0;
        this.dn.currentPage = 1;
        this.dataSize = 0;
    }

    /*Function to calculate the paging values.*/
    calculatePagingValues() {
        this.pageCount = (this.dataSize > this.maxResults) ? (Math.ceil(this.dataSize / this.maxResults)) : (this.dataSize < 0 ? 0 : 1);
        this.dn.currentPage = this.dn.currentPage || 1;
    }

    /*Function to set default values to the paging parameters*/
    setDefaultPagingValues(dataSize, maxResults, currentPage) {
        /*If neither 'dataSize' nor 'maxResults' is set, then set default values to the paging parameters.*/
        if (!dataSize && !maxResults) {
            this.pageCount = 1;
            this.dn.currentPage = 1;
            this.maxResults = dataSize;
            this.dataSize = dataSize;
        } else { /*Else, set the specified values and recalculate paging parameters.*/
            this.maxResults = maxResults || this.maxResults;
            this.dataSize = isDefined(dataSize) ? dataSize : this.dataSize;
            this.dn.currentPage = currentPage || this.dn.currentPage;
            this.calculatePagingValues();
        }
        this.maxResultsEmitter.emit(this.maxResults);
    }

    /*Function to check the dataSize and manipulate the navigator accordingly.*/
    checkDataSize(dataSize, numberOfElements?, size?) {
        /*If the dataSize is -1 or Integer.MAX_VALUE( which is 2147483647), then the total number of records is not known.
         * Hence,
         * 1. Hide the 'Total Record Count'.
         * 2. Disable the 'GoToLastPage' link as the page number of the last page is not known.*/
        if (dataSize === -1 || dataSize === AppConstants.INT_MAX_VALUE) {
            this.prevshowrecordcount = this.showrecordcount;
            this.isDisableLast = true;
            this.isDisableCount = true;
            this.showrecordcount = false;
            // If number of records in current page is less than the max records size, this is the last page. So disable next button.
            if (numberOfElements < size) {
                this.isDisableNext = true;
            }
        } else {
            this.isDisableCount = false;
            this.showrecordcount = this.prevshowrecordcount || this.showrecordcount;
        }
    }

    /*Function to disable navigation based on the current and total pages.*/
    disableNavigation() {
        const isCurrentPageFirst = (this.dn.currentPage === 1),
            isCurrentPageLast = (this.dn.currentPage === this.pageCount);
        this.isDisableFirst = this.isDisablePrevious = isCurrentPageFirst;
        this.isDisableNext = this.isDisableLast = isCurrentPageLast;
        this.isDisableCurrent = isCurrentPageFirst && isCurrentPageLast;
    }

    /*Function to check if the variable bound to the data-navigator has paging.*/
    isDataSourceHasPaging() {
        return this.datasource && this.datasource.execute(DataSource.Operation.IS_PAGEABLE);
    }

    // Set the result for client side pagination
    setNonPageableData(newVal) {
        let dataSize,
            maxResults,
            currentPage,
            startIndex;
        dataSize = _.isArray(newVal) ? newVal.length : (_.isEmpty(newVal) ? 0 : 1);
        maxResults = (this.options && this.options.maxResults) || dataSize;

        // For static variable, keep the current page. For other variables without pagination reset the page to 1
        if (this.datasource && this.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
            currentPage = 1;
        } else {
            currentPage = this.dn.currentPage || 1;
        }

        this.setDefaultPagingValues(dataSize, maxResults, currentPage);
        this.disableNavigation();

        startIndex = (this.dn.currentPage - 1) * this.maxResults;
        this.setResult(_.isArray(newVal) ? newVal.slice(startIndex, startIndex + this.maxResults) : newVal);
    }

    /*Function to set the values needed for pagination*/
    private setPagingValues(newVal) {
        let dataSize,
            maxResults,
            currentPage,
            dataSource;
        let variableOptions: any = {};
        // Store the data in __fullData. This is used for client side searching witvah out modifying the actual dataset.
        this.__fullData = newVal;
        /*Check for sanity*/
        if (this.binddataset) {
            dataSource = this.datasource || {};
            variableOptions = dataSource._options || {};
            /*Check for number of elements in the data set*/
            if (newVal) {
                if (this.isDataSourceHasPaging()) {
                    this.pagination = this.datasource.execute(DataSource.Operation.GET_PAGING_OPTIONS) || {};
                    // If "filterFields" and "sortOptions" have been set, then set them so that the filters can be retained while fetching data upon page navigation.
                    this.filterFields = variableOptions.filterFields || {};
                    this.sortOptions = variableOptions.orderBy ||
                        (_.isArray(this.pagination.sort) ? getOrderByExpr(this.pagination.sort) : '');
                    dataSize = this.pagination.totalElements;
                    maxResults = this.pagination.size;
                    if (this.pagination.numberOfElements > 0) {
                        if (isDefined(this.pagination.number)) { // number is page number received from backend
                            this.dn.currentPage = this.pagination.number + 1;
                        }
                        currentPage = this.dn.currentPage || 1;
                    } else {
                        currentPage = 1;
                    }
                    /* Sending pageCount undefined to calculate it again for query.*/
                    this.setDefaultPagingValues(dataSize, maxResults, currentPage);
                    this.disableNavigation();
                    this.checkDataSize(dataSize, this.pagination.numberOfElements, this.pagination.size);
                    this.setResult(newVal);
                } else if (!_.isString(newVal)) {
                    this.setNonPageableData(newVal);
                }
            } else {
                this.setResult(newVal);
                this.resetPageNavigation();
            }
        } else {
            if (newVal && !_.isString(newVal)) {
                this.setNonPageableData(newVal);
            }
        }
    }

    /*Function to check if the current page is the first page*/
    isFirstPage() {
        return (this.dn.currentPage === 1 || !this.dn.currentPage);
    }

    /*Function to check if the current page is the last page*/
    isLastPage() {
        return (this.dn.currentPage === this.pageCount);
    }

    /*Function to navigate to the last page*/
    goToLastPage(isRefresh, event, callback) {
        if (!this.isLastPage()) {
            this.dn.currentPage = this.pageCount;
            this.goToPage(event, callback);
        } else if (isRefresh) {
            this.goToPage(event, callback);
        }
    }

    /*Function to navigate to the first page*/
    goToFirstPage(isRefresh, event, callback) {
        if (!this.isFirstPage()) {
            this.dn.currentPage = 1;
            this.goToPage(event, callback);
        } else if (isRefresh) {
            this.goToPage(event, callback);
        }
    }

    /*Function to navigate to the current page*/
    goToPage(event?, callback?) {
        this.firstRow = (this.dn.currentPage - 1) * this.maxResults;
        this.getPageData(event, callback);
        const mode = this.parent.statePersistence.computeMode(this.statehandler);
        if (mode && mode.toLowerCase() !== 'none' && (this.parent.widgetType === 'wm-table' || this.parent.widgetType === 'wm-list')) {
            this.parent._selectedItemsExist = true;
            if (this.isFirstPage()) {
                this.parent.statePersistence.removeWidgetState(this.parent, 'pagination');
            } else {
                if (unsupportedStatePersistenceTypes.indexOf(this.parent.navigation) < 0) {
                    this.parent.statePersistence.setWidgetState(this.parent, {pagination: this.dn.currentPage});
                } else if (this.parent.widgetType === 'wm-list') {
                    console.warn('Retain State handling on Widget ' + this.parent.name + ' is not supported for current pagination type.');
                }
            }
        }
    }

    /*Function to be invoked after the data of the page has been fetched.*/
    onPageDataReady(event, data, callback) {
        this.disableNavigation();
        this.invokeSetRecord(event, data);
        triggerFn(callback);
    }

    /*Function to get data for the current page*/
    getPageData(event, callback) {
        let data,
            startIndex;

        if (this.isDataSourceHasPaging()) {
            this.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                'page': this.dn.currentPage,
                'filterFields': this.filterFields,
                'orderBy': this.sortOptions,
                'matchMode': 'anywhereignorecase'
            }).then(response => {
                this.onPageDataReady(event, response && response.data, callback);
                $appDigest();
            }, error => {
                // If error is undefined, do not show any message as this may be discarded request
                if (error) {
                    // TODO: Handle Error
                    // wmToaster.show('error', 'ERROR', 'Unable to get data of page -' + this.dn.currentPage + ':' + error);
                }
            });
        } else {
            startIndex = (this.dn.currentPage - 1) * this.maxResults;
            data = _.isArray(this.__fullData) ? this.__fullData.slice(startIndex, startIndex + this.maxResults) : this.__fullData;
            this.setResult(data);
            this.onPageDataReady(event, data, callback);
        }
    }

    invokeSetRecord(event, data) {
        // Trigger the event handler if exists.
        const pageInfo = {
            currentPage: this.dn.currentPage,
            size: this.maxResults,
            totalElements: this.dataSize,
            totalPages: this.pageCount
        };
        if (this.parent) {
            this.parent.invokeEventCallback('setrecord', {$event: event, $data: data, $index: this.dn.currentPage, pageInfo, data});
        } else {
            this.invokeEventCallback('setrecord', {$event: event, $data: data, $index: this.dn.currentPage, pageInfo, data});
        }
    }

    /*Function to validate the page input.
     In case of invalid input, navigate to the appropriate page; also return false.
     In case of valid input, return true.*/
    validateCurrentPage(event, callback?) {
        /*If the value entered is greater than the last page number or invalid value, then highlighting the field showing error.*/
        if ( event && (isNaN(this.dn.currentPage) || this.dn.currentPage <= 0 || (this.pageCount && (this.dn.currentPage > this.pageCount || _.isNull(this.dn.currentPage))))) {
            $(event.target).closest('a').addClass('ng-invalid');
            return false;
        }
        return true;
    }

    onModelChange(event) {
        if (!this.validateCurrentPage(event)) {
            return;
        }
        this.goToPage(event);
    }

    onKeyDown(event) {
        const targetEle = $(event.target).closest('a');
        if (event.code === 'KeyE') {
            targetEle.addClass('ng-invalid');
            return false;
        }
        targetEle.removeClass('ng-invalid');
        return true;
    }

    pageChanged(event: any) {
       this._debouncedPageChanged(event);
    }

    /*Function to navigate to the respective pages.*/
    navigatePage(index, event, isRefresh, callback) {
        this.invokeEventCallback('paginationchange', {$event: undefined, $index: this.dn.currentPage});

        // Convert the current page to a valid page number.
        this.dn.currentPage = +this.dn.currentPage;

        switch (index) {
            case 'first':
                this.goToFirstPage(isRefresh, event, callback);
                return;
            case 'prev':
                /*Return if already on the first page.*/
                if (this.isFirstPage() || !this.validateCurrentPage(event, callback)) {
                    return;
                }
                /*Decrement the current page by 1.*/
                this.dn.currentPage -= 1;
                break;
            case 'next':
                /*Return if already on the last page.*/
                if (this.isLastPage() || !this.validateCurrentPage(event, callback)) {
                    return;
                }
                /*Increment the current page by 1.*/
                this.dn.currentPage += 1;
                break;
            case 'last':
                this.goToLastPage(isRefresh, event, callback);
                return;
            default:
                break;
        }

        /*Navigate to the current page.*/
        this.goToPage(event, callback);
    }

    setBindDataSet(binddataset, parent, dataSource, dataset?, binddatasource?, datasetBoundExpr?, statehandler?) {
        const parts = binddataset.split('.');
        let bindPagingOptions;
        this.statehandler = statehandler;
        if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
            bindPagingOptions = `${parts[0]}.${parts[1]}.pagination`;
        }
        if (!binddatasource && dataset && !datasetBoundExpr) {
            this.dataset = dataset;
            this._debouncedApplyDataset();
            return;
        }
        this.binddataset = binddataset;
        setTimeout(() => {
            // watching for dataset changes even when dataset is bound to "item." (i.e. by checking for datasetBoundExpr)
            // item context is passed as dataSource here
            this.registerDestroyListener(
                $watch(
                    binddataset,
                    parent,
                    datasetBoundExpr ? dataSource : {},
                    nv => this.widget.dataset = nv
                )
            );

            // Register a watch on paging options. Call dataset property change handler even if paging options changes to reflect pagination state
            if (!bindPagingOptions) {
                return;
            }
            this.registerDestroyListener(
                $watch(
                    bindPagingOptions,
                    parent,
                    {},
                    () => this._debouncedApplyDataset()
                )
            );
        });
        // apply datasource only when dataset is not bound to "item.FIELD"
        if (!datasetBoundExpr) {
            this.datasource = dataSource;
        }
    }

    // Set the datasource of pagination from the parent widget
    setDataSource(dataSource) {
        this.datasource = dataSource;
    }

    onPropertyChange(key: string, nv, ov) {
        if (key === 'dataset') {
            let data;
            if (this.parent && this.parent.onDataNavigatorDataSetChange) {
                data = this.parent.onDataNavigatorDataSetChange(nv);
            } else {
                data = nv;
            }
            this.setPagingValues(data);
        } else if (key === 'navigation') {
            if (nv === 'Advanced') { // Support for older projects where navigation type was advanced instead of clasic
                this.navigation = 'Classic';
            }
            this.updateNavSize();
            this.navcontrols = nv;
        } else if (key === 'navigationsize') {
            this.updateNavSize();
        } else if (key === 'navigationalign') {
            switchClass(this.nativeElement, `text-${nv}`, `text-${ov}`);
        } else if (key === 'maxResults') {
            this.setPagingValues(this.dataset);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterViewInit() {
        const paginationElem =  this.nativeElement as HTMLElement;
        paginationElem.onclick = (event) => {
            event.stopPropagation();
        };
    }
}
