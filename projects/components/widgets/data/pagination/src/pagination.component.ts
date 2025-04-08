import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Component, EventEmitter, Inject, Injector, Output, SkipSelf, AfterViewInit, Optional} from '@angular/core';

import {
    $appDigest,
    $watch,
    AppConstants,
    DataSource,
    debounce,
    isDefined,
    switchClass,
    triggerFn
} from '@wm/core';
import { DEBOUNCE_TIMES, getOrderByExpr, provideAsWidgetRef, StylableComponent, styler, WidgetRef, unsupportedStatePersistenceTypes} from '@wm/components/base';
import { registerProps } from './pagination.props';
import {forEach, get, isArray, isEmpty, isNull, isString} from "lodash-es";
import { PaginationModule } from 'ngx-bootstrap/pagination';

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
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationModule],
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
    logicalOp;

    private _debouncedApplyDataset = debounce(() => this.widget.dataset = this.dataset, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);
    private _debouncedPageChanged = debounce(event => {
        const currentPage = event && event.page;
        // Do not call goToPage if page has not changed
        if (currentPage !== this.dn.currentPage) {
            const inst = (this as any).parent || this;
            this.dn.currentPage = currentPage;
            inst.invokeEventCallback('paginationchange', {$event: undefined, $index: this.dn.currentPage});
            this.goToPage();
            if (this.navigation === 'Basic') {
                this._setAriaForBasicNavigation();
            }
        }
    }, DEBOUNCE_TIMES.PAGINATION_DEBOUNCE_TIME);

    private _setAriaForBasicNavigation() {
        forEach(this.nativeElement.getElementsByTagName('a'), (item) => {
            item.setAttribute('href', 'javascript:void(0);');
            const childNode = item.querySelector('span');
            if (childNode?.dataset.isacitvepage === "true") {
                item.setAttribute('aria-current', 'true');
            }
            if(childNode?.dataset.isdisabled === "true") {
                item.setAttribute('aria-disabled', 'true');
            } else {
                item.removeAttribute('aria-disabled');
            }
        });
    }

    constructor(inj: Injector, @SkipSelf() @Inject(WidgetRef) public parent, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
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
        if (!this.pagination?.next) {
            this.isDisableFirst = this.isDisablePrevious = isCurrentPageFirst;
            this.isDisableNext = this.isDisableLast = isCurrentPageLast;
        } else {
            // WMS-18867: In case of server side pagination, for pager type pagination depend on prev and next flags which are set by developer
            this.isDisableFirst = this.isDisablePrevious = !this.pagination.prev;
            this.isDisableNext = this.isDisableLast = !this.pagination.next;
        }
        this.isDisableCurrent = isCurrentPageFirst && isCurrentPageLast;
        // In case of client side pagination, when load more reaches last page hide the on-demand grid ele
        if (this.dataset && this.dataset.length && this.isDisableNext && this.parent.onDemandLoad && this.parent.widgetType === 'wm-table') {
            this.parent.callDataGridMethod('hideLoadingIndicator', this.isDisableNext, this.parent.infScroll);
        }
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
        dataSize = isArray(newVal) ? newVal.length : (isEmpty(newVal) ? 0 : 1);
        maxResults = (this.options && this.options.maxResults) || dataSize;

        // For static variable, keep the current page. For other variables without pagination reset the page to 1
        // Fix for [WMS-23263]: gridOptions.isNextPageData flag is false when dataset is changed from script, so setting current page to 1
        if (this.datasource && (this.datasource.execute(DataSource.Operation.IS_API_AWARE) || (this.parent.widgetType === 'wm-table' && (this.parent.gridOptions.isNavTypeScrollOrOndemand() && (get(this.parent, 'gridOptions.lastActionPerformed') === this.parent.gridOptions.ACTIONS.DATASET_UPDATE || !get(this.parent, 'gridOptions.isNextPageData')))))) {
            currentPage = 1;
        } else {
            currentPage = this.dn.currentPage || 1;
        }

        this.setDefaultPagingValues(dataSize, maxResults, currentPage);
        this.disableNavigation();

        startIndex = (this.dn.currentPage - 1) * this.maxResults;
        this.setResult(isArray(newVal) ? newVal.slice(startIndex, startIndex + this.maxResults) : newVal);
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
                    this.logicalOp = variableOptions.logicalOp || '';
                    this.sortOptions = variableOptions.orderBy ||
                        (isArray(this.pagination.sort) ? getOrderByExpr(this.pagination.sort) : '');
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
                } else if (!isString(newVal)) {
                    this.setNonPageableData(newVal);
                }
            } else {
                this.setResult(newVal);
                this.resetPageNavigation();
            }
            if (this.navigation === 'Basic') {
                this._setAriaForBasicNavigation();
            }
        } else {
            if (newVal && !isString(newVal)) {
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
        const mode = this.parent.statePersistence.computeMode(this.statehandler);
        if (mode && mode.toLowerCase() !== 'none' && (this.parent.widgetType === 'wm-table' || this.parent.widgetType === 'wm-list')) {
            this.parent._selectedItemsExist = true;
            if (this.isFirstPage()) {
                this.parent.statePersistence.removeWidgetState(this.parent, 'pagination');
            } else {
                if (unsupportedStatePersistenceTypes.indexOf(this.parent.navigation) < 0) {
                    this.parent.statePersistence.setWidgetState(this.parent, {pagination: this.dn.currentPage});
                } else if (this.parent.widgetType === 'wm-list' ||this.parent.widgetType === 'wm-table' ) {
                    console.warn('Retain State handling on Widget ' + this.parent.name + ' is not supported for current pagination type.');
                }
            }
            this.parent.currentpage = this.dn.currentPage;
            this.parent.nativeElement?.setAttribute('currentpage', this.dn.currentPage);
        }
        // call getPageData after checking state config so that Static Variables can use it
        this.getPageData(event, callback);
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
            /**
             * In table component, in case of on demand and scroll pagination
             * When there is a change in data item which is not in current page
             * Fetch the items of the page where the change is made
             * */
            let pageIndex = this.dn.currentPage;
            if (this.isEditNotInCurrentPage() && this.parent.gridOptions.lastActionPerformed !== 'delete') {
                pageIndex = this.parent.actionRowPage;
            }
            this.datasource.execute(DataSource.Operation.LIST_RECORDS, {
                'page': pageIndex,
                'filterFields': this.filterFields,
                'orderBy': this.sortOptions,
                'logicalOp': this.logicalOp,
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
            if (this.isEditNotInCurrentPage()) {
                startIndex = (this.parent.actionRowPage - 1) * this.maxResults;
            } else {
                startIndex = (this.dn.currentPage - 1) * this.maxResults;
            }
            data = isArray(this.__fullData) ? this.__fullData.slice(startIndex, startIndex + this.maxResults) : this.__fullData;
            this.setResult(data);
            this.onPageDataReady(event, data, callback);
        }
    }

    /*
    Function to check if the edit action is performed on the previous page data of the table
    */
    isEditNotInCurrentPage() {
        const pageIndex = this.dn.currentPage;
        return this.parent.widgetType === 'wm-table' && pageIndex === this.parent.currentPage &&
            this.parent.actionRowPage && this.parent.actionRowPage < pageIndex;
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
        if (event && (isNaN(this.dn.currentPage) || this.dn.currentPage <= 0 || (this.pageCount && (this.dn.currentPage > this.pageCount || isNull(this.dn.currentPage))))) {
            if (this.dn.currentPage <= 0) {
                this.dn.currentPage = 1;
            } else if (this.dn.currentPage > this.pageCount) {
                this.dn.currentPage = this.pageCount;
            }
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
        // when navigated to next page turn on the isDataLoading flag to show the loading indicator
        if (isDefined(this.parent.isDataLoading) && !this.isDisableNext) {
            this.parent.isDataLoading = true;
            // In case of infinite scroll calling the showLoadingIndicator method to update the loading message immediately when navigated to next page
            if (this.parent.infScroll) {
                this.parent.variableInflight = true;
                this.parent.callDataGridMethod('showLoadingIndicator', this.parent.loadingdatamsg, true);
            }
        }
        // reset the last action performed to "scroll" and isDatasetUpdated to false
        if (this.parent.widgetType === 'wm-table' && this.parent.gridOptions.isNavTypeScrollOrOndemand()) {
            this.parent.gridOptions.setLastActionPerformed(this.parent.gridOptions.ACTIONS.DEFAULT);
            this.parent.gridOptions.setIsDatasetUpdated(false);
        }
        this.invokeEventCallback('paginationchange', {$event: undefined, $index: this.dn.currentPage});

        // Convert the current page to a valid page number.
        this.dn.currentPage = +this.dn.currentPage;

        switch (index) {
            case 'first':
                this.goToFirstPage(isRefresh, event, callback);
                return;
            case 'prev':
                /*Return if already on the first page.*/
                if (!this.pagination?.next && (this.isFirstPage() || !this.validateCurrentPage(event, callback))) {
                    return;
                } else if (this.pagination?.next) { // WMS-18867: For server side pagination, skipping the regular flow and enabling isNext flag in pagination metadata
                    this.datasource.pagination.isNext = false;
                    this.datasource.pagination.isPrev = true;
                }
                /*Decrement the current page by 1.*/
                this.dn.currentPage -= 1;
                break;
            case 'next':
                /*Return if already on the last page.*/
                if (!this.pagination?.next && (this.isLastPage() || !this.validateCurrentPage(event, callback))) {
                    return;
                } else if (this.pagination?.next) { // WMS-18867: For server side pagination, skipping the regular flow and enabling isPrev flag in pagination metadata
                    this.datasource.pagination.isNext = true;
                    this.datasource.pagination.isPrev = false;
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
            // [Todo-CSP]: check if same expr fn is generated by parent widget (list, table)
            this.registerDestroyListener(
                $watch(
                    binddataset,
                    parent,
                    datasetBoundExpr ? dataSource : {},
                    nv =>  {
                        if (nv) {
                            this.dataset = nv;
                            this._debouncedApplyDataset();
                        } else {
                           // WMS-19285: Setting dataset on proxy only to handle propertychange handler call for undefined cases
                            this.widget.dataset = nv;
                        }
                    }
                )
            );

            // Register a watch on paging options. Call dataset property change handler even if paging options changes to reflect pagination state
            if (!bindPagingOptions) {
                return;
            }
            //[Todo-CSP]: either generate watch expr fn or register an event from the datasource itself
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
            // Set last action performed to "dataset_update" whenever dataset is changed in table component
            if (this.parent.widgetType === 'wm-table') {
                this.parent._triggeredByUser = false;
            }
            // When the dataset is not in current page, but in previous ones directly set the result without setting page values
            if (this.isEditNotInCurrentPage()) {
                this.setResult(data);
            } else {
                this.setPagingValues(data);
            }
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
