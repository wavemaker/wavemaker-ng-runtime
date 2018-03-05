import { Component, Output, EventEmitter, ElementRef, Injector, ChangeDetectorRef, OnInit } from '@angular/core';
import { BaseComponent } from '../../widgets/base/base.component';
import { styler } from '../../utils/styler';
import { isDefined, isPageable, triggerFn } from '@utils/utils';
import { registerProps } from './pagination.props';
import { switchClass } from '@utils/dom';

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
    templateUrl: './pagination.component.html'
})
export class PaginationComponent extends BaseComponent implements OnInit {

    @Output() resultEmitter: EventEmitter<any> = new EventEmitter();
    @Output() maxResultsEmitter: EventEmitter<any> = new EventEmitter();

    maxResults;
    navigationsize;
    showrecordcount;

    public navcontrols = 'Basic';
    navigation;

    navigationalign;
    maxsize;
    boundarylinks;
    forceellipses;
    directionlinks;


    public navigationClass;
    public dn = {
        currentPage: 1
    };

    public appLocale = {
        'LABEL_FIRST': 'First',
        'LABEL_PREVIOUS': 'Previous',
        'LABEL_NEXT': 'Next',
        'LABEL_LAST': 'Last',
        'LABEL_TOTAL_RECORDS': 'Total records'
    };

    public pageCount = 0;
    public isDisableNext = true;
    public isDisablePrevious = true;
    public isDisableFirst = true;
    public isDisableLast = true;
    public dataSize;
    public prevshowrecordcount;
    public isDisableCount;
    public firstRow;
    public result;
    public __fullData;

    private _dataset;

    get dataset() {
        return this._dataset;
    }

    set dataset(val) {
        this._dataset = val;
        this.setPagingValues(val);
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

    /*Function to reset the paging values to default.*/
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
        // this.maxResultsEmitter.emit(this.maxResults);
    }

    /*Function to check the dataSize and manipulate the navigator accordingly.*/
    checkDataSize(dataSize, numberOfElements, size) {
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
    disableNavigation = function () {
        const isCurrentPageFirst = (this.dn.currentPage === 1),
            isCurrentPageLast = (this.dn.currentPage === this.pageCount);
        this.isDisableFirst = this.isDisablePrevious = isCurrentPageFirst;
        this.isDisableNext = this.isDisableLast = isCurrentPageLast;
        this.isDisableCurrent = isCurrentPageFirst && isCurrentPageLast;
    };

    /*Function to check if the variable bound to the data-navigator has paging.*/
    isVariableHasPaging = function () {
        const dataSet = this.dataset;

        return (_.isObject(dataSet) && isPageable(dataSet));
    };

    // Set the result for client side pagination
    setNonPageableData(newVal) {
        let dataSize,
            maxResults,
            currentPage,
            startIndex;
        dataSize = _.isArray(newVal) ? newVal.length : (newVal.data ? newVal.data.length : _.isEmpty(newVal) ? 0 : 1);
        maxResults = this.maxResults || dataSize;
        // For static variable, keep the current page. For other variables without pagination reset the page to 1
        currentPage = this.dn.currentPage || 1;

        this.setDefaultPagingValues(dataSize, maxResults, currentPage);
        this.disableNavigation();

        startIndex = (this.dn.currentPage - 1) * this.maxResults;
        this.result = _.isArray(newVal) ? newVal.slice(startIndex, startIndex + this.maxResults) : newVal;
        this.resultEmitter.emit(this.result);
    }

    /*Function to set the values needed for pagination*/
    setPagingValues = function (newVal) {
        // Store the data in __fullData. This is used for client side searching witvah out modifying the actual dataset.
        this.__fullData = newVal;
        /*Set the default value of the 'result' property to the newVal so that the widgets bound to the data-navigator can have the dataSet set properly.*/
        // this.result = newVal;
        // this.resultEmitter.emit(newVal);
        /*Check for sanity*/

        if (newVal && !_.isString(newVal)) {
            this.setNonPageableData(newVal);
        }
    };

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
    goToFirstPage = function (isRefresh, event, callback) {
        if (!this.isFirstPage()) {
            this.dn.currentPage = 1;
            this.goToPage(event, callback);
        } else if (isRefresh) {
            this.goToPage(event, callback);
        }
    };

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
        startIndex = (this.dn.currentPage - 1) * this.maxResults;
        data = _.isArray(this.__fullData) ? this.__fullData.slice(startIndex, startIndex + this.maxResults) : this.__fullData;
        this.result = data;
        this.resultEmitter.emit(data);
        this.onPageDataReady(event, data, callback);
    }

    invokeSetRecord(event, data) {
        /*Trigger the event handler if exists.
         * Check in the dataNavigator scope and also in the parent (i.e., grid/live-list) scope.*/
        // this.onSetrecord({$event: event, $scope: this, $data: data, $index: this.dn.currentPage});
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
        // var callbackFn = $scope.$parent._onPaginationchange || $scope.$parent.onPaginationchange || $scope.onPaginationchange;
        this.dn.currentPage = event && event.page;
        this.goToPage();
        // callbackFn({$event: undefined, $scope: this, $index: $scope.dn.currentPage});
    }

    /*Function to navigate to the respective pages.*/
    navigatePage(index, event, isRefresh, callback) {
        // var callbackFn = $scope.$parent._onPaginationchange || $scope.$parent.onPaginationchange || $scope.onPaginationchange;
        // callbackFn({$event: undefined, $scope: this, $index: $scope.dn.currentPage});

        /*Convert the current page to a valid page number.*/
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

    onPropertyChange(key: string, nv, ov) {
        switch (key) {
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
                switchClass(this.$element, `text-${nv}`, `text-${ov}`);
                break;
            case 'maxsize':
            case 'maxResults':
                this.setPagingValues(this.dataset);
                break;

        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
