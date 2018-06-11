import { Component, EventEmitter, Injector, Output, SkipSelf, Inject } from '@angular/core';

import { $watch, DataSource, isDefined, isPageable, switchClass, triggerFn, $appDigest } from '@wm/core';

import { registerProps } from './pagination.props';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { getOrderByExpr, getWatchIdentifier, provideAsWidgetRef } from '../../../utils/widget-utils';
import { WidgetRef } from '../../framework/types';

declare const _;

registerProps();

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

/**
 * The pagination component
 * Pagination component. Can be used with data table and list
 * Example of usage:
 * <example-url>http://localhost:4200/pagination</example-url>
 *
 */
@Component({
    selector: '[wmPagination]',
    templateUrl: './pagination.component.html',
    providers: [
        provideAsWidgetRef(PaginationComponent)
    ]
})
export class PaginationComponent extends StylableComponent {

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

    appLocale = {
        'LABEL_FIRST': 'First',
        'LABEL_PREVIOUS': 'Previous',
        'LABEL_NEXT': 'Next',
        'LABEL_LAST': 'Last',
        'LABEL_TOTAL_RECORDS': 'Total records'
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
    pagingOptions;
    filterFields;
    sortOptions;
    binddataset;

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
        if (dataSize === -1 || dataSize === 2147483647) {
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
        return this.datasource.execute(DataSource.Operation.IS_PAGEABLE);
    }

    // Set the result for client side pagination
    setNonPageableData(newVal) {
        let dataSize,
            maxResults,
            currentPage,
            startIndex;
        dataSize = _.isArray(newVal) ? newVal.length : (newVal.data ? newVal.data.length : _.isEmpty(newVal) ? 0 : 1);
        maxResults = (this.pagingOptions && this.pagingOptions.maxResults) || dataSize;

        // For static variable, keep the current page. For other variables without pagination reset the page to 1
        if (this.datasource.execute(DataSource.Operation.IS_API_AWARE)) {
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
                    /*If "filterFields" and "sortOptions" have been set, then set them so that the filters can be retained while fetching data upon page navigation.*/
                    this.filterFields = variableOptions.filterFields || {};
                    this.sortOptions = variableOptions.orderBy || (_.isArray(newVal.sort) ? getOrderByExpr(newVal.sort) : '');
                    if (_.isObject(newVal) && isPageable(newVal)) {
                        dataSize = newVal.totalElements;
                        maxResults = newVal.size;
                        if (newVal.numberOfElements > 0) {
                            if (isDefined(newVal.number)) { // number is page number received from backend
                                this.dn.currentPage = newVal.number + 1;
                            }
                            currentPage = this.dn.currentPage || 1;
                        } else {
                            currentPage = 1;
                        }
                        /* Sending pageCount undefined to calculate it again for query.*/
                        this.setDefaultPagingValues(dataSize, maxResults, currentPage);
                        this.disableNavigation();
                        this.checkDataSize(dataSize, newVal.numberOfElements, newVal.size);
                    }
                    /*Re-compute the paging values in the following cases.
                    Data corresponding to the table associated with the live-variable changes.*/
                    if (newVal.pagingOptions) {
                        dataSize = newVal.pagingOptions.dataSize;

                        maxResults = newVal.pagingOptions.maxResults;
                        currentPage = newVal.pagingOptions.currentPage;
                        this.setDefaultPagingValues(dataSize, maxResults, currentPage);
                        this.disableNavigation();
                        this.checkDataSize(dataSize);
                    }
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
                'matchMode': 'anywhere'
            }).then(response => {
                this.onPageDataReady(event, response, callback);
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
        if (this.parent) {
            this.parent.invokeEventCallback('setrecord', {$event: event, $data: data, $index: this.dn.currentPage});
        } else {
            this.invokeEventCallback('setrecord', {$event: event, $data: data, $index: this.dn.currentPage});
        }
    }

    /*Function to validate the page input.
     In case of invalid input, navigate to the appropriate page; also return false.
     In case of valid input, return true.*/
    validateCurrentPage(event, callback?) {
        /*If the value entered is not a valid number, then navigate to the first page.*/
        if (isNaN(this.dn.currentPage)) {
            this.goToFirstPage(undefined, event, callback);
            return false;
        }
        /*If this value entered is less than 0, then navigate to the first page.*/
        if (this.dn.currentPage < 0) {
            this.goToFirstPage(undefined, event, callback);
            return false;
        }
        /*If the value entered is greater than the last page number, then navigate to the last page.*/
        if (this.pageCount && (this.dn.currentPage > this.pageCount)) {
            this.goToLastPage(undefined, event, callback);
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

    pageChanged(event: any) {
        this.dn.currentPage = event && event.page;
        this.goToPage();
        this.invokeEventCallback('paginationchange', {$event: undefined, $index: this.dn.currentPage});
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

    setBindDataSet(binddataset, parent, dataSource) {
        this.binddataset = binddataset;
        setTimeout(() => {
            this.registerDestroyListener($watch(binddataset, parent, {}, nv => this.widget.dataset = nv, getWatchIdentifier(this.widgetId, 'dataset')));
        });
        this.datasource = dataSource;
    }

    onPropertyChange(key: string, nv, ov) {
        switch (key) {
            case 'dataset':
                let data;
                if (this.parent && this.parent.onDataNavigatorDataSetChange) {
                    data = this.parent.onDataNavigatorDataSetChange(nv);
                } else {
                    data = nv;
                }
                this.setPagingValues(data);
                break;
            case 'navigation':
                if (nv === 'Advanced') { // Support for older projects where navigation type was advanced instead of clasic
                    this.navigation = 'Classic';
                }
                this.updateNavSize();
                this.navcontrols = nv;
                break;
            case 'navigationsize':
                this.updateNavSize();
                break;
            case 'navigationalign':
                switchClass(this.nativeElement, `text-${nv}`, `text-${ov}`);
                break;
            case 'maxResults':
                this.setPagingValues(this.dataset);
                break;

        }
    }
}
