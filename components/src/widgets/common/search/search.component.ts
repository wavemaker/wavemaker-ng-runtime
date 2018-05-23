import { AfterViewInit, Attribute, Component, Directive, ElementRef, Injector, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { DataSource, findValueOf, isPageable} from '@wm/core';
import { CONSTANTS } from '@wm/variables';

import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { convertDataToObject, DataSetItem, transformData } from '../../../utils/form-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';

import { registerProps } from './search.props';

declare const _;

const ALL_FIELDS: string = 'All Fields';

const WIDGET_CONFIG = {widgetType: 'wm-search', hostClass: 'app-search input-group'};

registerProps();

@Component({
    selector: '[wmSearch]',
    templateUrl: './search.component.html',
    providers: [
        provideAsNgValueAccessor(SearchComponent),
        provideAsWidgetRef(SearchComponent)
    ]
})

export class SearchComponent extends DatasetAwareFormComponent implements OnInit, AfterViewInit {

    casesensitive;
    imagewidth;
    searchkey;

    query: string;
    dataSource: Observable<any>;

    private formattedDataSet;
    private pagesize: any;
    private limit: any;
    private datasource;
    private oldQuery;
    private lastPage: boolean;
    private page = 1;

    private showsearchicon;

    protected variableDataSource;
    protected localDataSource;

    private queryModel: DataSetItem[];
    private _defaultQuery;
    private isPaginatedData: boolean;
    private itemIndex;
    private minLength: number;
    private _loadingItems: boolean;

    constructor(inj: Injector, @Attribute('datavalue.bind') private binddatavalue, @Attribute('dataset.bind') private binddataset) {
        super(inj, WIDGET_CONFIG);

        /**
         * Listens for the change in the ngModel on every search and retreives the data as observable.
         * This observable data is passed to the typeahead.
         * @type {Observable<any>}
         */
        this.dataSource = Observable.create((observer: any) => {
            // Runs on every search
            observer.next(this.query);
            this.oldQuery = this.query;

        }).mergeMap((token: string) => (this.getDataSourceAsObservable(token)));

        /**
         * When default datavalue is not found within the dataset, a filter call is made to get the record using fetchDefaultModel.
         * after getting the response, set the queryModel and query.
         */
        this.datavalue$.subscribe((val) => {
            if (!_.isUndefined(val) && _.isUndefined(this.proxyModel)) {
                // make call.
                this.fetchDefaultModel().then(response => {
                    const dataSet = convertDataToObject(this.dataset);
                    this.itemIndex = dataSet.length;
                    if (!_.isArray(response)) {
                        response = [response];
                    }
                    // Todo: [bandhavya] verify after this change.
                    this.queryModel = transformData(response, this.datafield, this.displaylabel, this.displayexpression, this.displayimagesrc, this.itemIndex);

                    // Show the label value on input.
                    this.query = this.queryModel[0].label;
                });
            }
        });

        this._defaultQuery = true;
    }

    ngOnInit() {
        super.ngOnInit();
        styler(this.nativeElement.children[0] as HTMLElement, this);
    }

    get showFooter() {
        return !this._loadingItems && this.isPaginatedData && this.lastPage;
    }

    // OptionsListTemplate listens to the scroll event and triggers this function.
    public onScroll ($scrollEl, evt: Event) {
        const totalHeight = $scrollEl.scrollHeight,
            clientHeight = $scrollEl.clientHeight;

        // If scroll is at the bottom and no request is in progress and next page records are available, fetch next page items.
        if (!this._loadingItems && !this.lastPage && (totalHeight * 0.9 < $scrollEl.scrollTop + clientHeight)) {
            this.triggerSearch(true);
        }
    }

    private triggerSearch(incrementPage?) {
        // Increase the page number and trigger force query update
        this.page = incrementPage ? this.page + 1 : this.page;

        // Todo:[bandhavya] .next trigger manually to fetch the results.
        // this.query = this.nativeElement.querySelector('input').value;
    }

    // This function returns an observable containing the search results.
    // if searchKey is defined, then variable call is made using the searchkey and other filterfields
    // else local data search is performed.
    getDataSourceAsObservable(token: string): Observable<any> {
        if (!this.dataset || (_.isArray(this.dataset) && !this.dataset.length)) {
            return;
        }
        this._loadingItems = true;

        const dataSet = convertDataToObject(this.dataset);

        const dataConfig = {
            dataset: dataSet,
            datasource: this.datasource,
            datafield: this.datafield,
            queryText: token || this.query,
            searchKey: this.searchkey,
            casesensitive: this.casesensitive,
            defaultQuery: this._defaultQuery
        };

        return Observable.from(new Promise((resolve, reject) => {
            if (this.searchkey) {
                _.assignIn(dataConfig, {
                    orderby: this.orderby,
                    limit: this.limit,
                    pagesize: this.pagesize,
                    page: this.page
                });

                this.variableDataSource = new VariableDataSource(dataConfig);

                this.variableDataSource.filter().then(response => {
                    this.handleQuerySuccess(response).then((result) => {
                        this._loadingItems = false;
                        resolve(result);
                    });
                }).catch((err) => {
                    // setting loadingItems to false when some error occurs, so that loading icon is hidden
                    this._loadingItems = false;
                });
            } else {
                this.localDataSource = new LocalDataSource(dataConfig);

                return this.localDataSource.filter().then(response => {
                    if (!_.isArray(response)) {
                        response = [response];
                    }
                    const result = transformData(response, this.datafield, this.displaylabel, this.displayexpression, this.displayimagesrc);
                    resolve(result);
                }).then(() => this._loadingItems = false);
            }
        }));
    }

    // set the minLength, showsearchicon depending on type.
    set type(val) {
        if (val === 'autocomplete') {
            this.minLength = 0;
        } else {
            this.minLength = _.isUndefined(this.minLength) ? this.minLength : 1;
        }
        this.showsearchicon = _.isUndefined(this.showsearchicon) ? this.showsearchicon : val === 'search';
    }

    // defaultQuery is set only when default datavalue is available, reset to false when onchange is triggerred.
    private onInputChange() {
        if (this._defaultQuery) {
            this._defaultQuery = false;
        }
    }

    private fetchVariableData(queryText) {
        return this.getDataSourceAsObservable(queryText).toPromise();
    }

    // Makes call to fetch the default data only when _defaultQuery is true.
    private fetchDefaultModel() {
        return new Promise((resolve, reject) => {
            if (this.datafield === ALL_FIELDS) {
                // Todo convert to datasetItem
                resolve(this.datavalue);
            } else {
                // Null values in query params returns all records. So datavalue other than null values are considered.
                if (this._defaultQuery && !_.isUndefined(this.datavalue) && !_.isNull(this.datavalue) && this.datavalue !== '') {
                    this.fetchVariableData(this.datavalue).then((response) => {
                        resolve(response);
                    });
                }
            }
        });
    }

    // Todo: [bandhavya] this flag is required ?
    // function isVariableUpdateRequired($is, scope, calledFromSetDataSet) {}

    // Todo: [bandhavya] full-screen mode for mobile.

    // Check if the page retrieved currently is the last page. If last page, don't send any more request
    private isLastPage(page, dataSize, maxResults, currentResults?): boolean {
        // if last page info is not returned by backend and current results is less than max results, this is the last page
        if (dataSize === CONSTANTS.INT_MAX_VALUE) {
            return currentResults !== 0 && currentResults < maxResults;
        }
        const pageCount = ((dataSize > maxResults) ? (Math.ceil(dataSize / maxResults)) : (dataSize < 0 ? 0 : 1));
        return page === pageCount;
    }

    // this function transform the response data in case it is not an array
    private getTransformedData(variable, data) {
        const operationResult = variable.operation + 'Result', // when output is only string it is available as oprationNameResult
            tempResponse    = data[operationResult],
            tempObj         = {};
        // in case data received is value as string then add that string value to object and convert object into array
        if (tempResponse) {
            _.set(tempObj, operationResult, tempResponse);
            data = [tempObj]; // convert data into an array having tempObj
        } else {
            // Todo [bandhavya] check if required.
            // in case data received is already an object then convert it into an array
            data = convertDataToObject(data);
        }

        return data;
    }

    /**
     * this function processes the response depending on pageOptions, isPageable and prepares the formattedDataset.
     */
    private handleQuerySuccess = (response) => {
        let data = isPageable(response) ? response.content : response,
            index,
            restExpr,
            formattedData;
        const expressionArray = _.split(this.binddataset, '.'),
            dataExpression = _.slice(expressionArray, _.indexOf(expressionArray, 'dataSet') + 1).join('.'),
            $I = '[$i]';

        return new Promise((resolve, reject) => {
            const pageOptions = response.pageOptions;
            if (pageOptions) {
                this.page = pageOptions.currentPage;
                this.lastPage = this.isLastPage(this.page, pageOptions.dataSize, pageOptions.maxResults);
                this.isPaginatedData = true;
            } else if (_.isObject(response) && isPageable(response)) {
                this.page = response.number + 1;
                this.lastPage = this.isLastPage(this.page, response.totalElements, response.size, response.numberOfElements);
                this.isPaginatedData = true;
                /*TODO: [bandhavya] This workaround is because backend is not giving the last page in distinct api. Remove after issue is fixed in backend*/
                if (this.page > 1 && !this.lastPage && _.isEmpty(response.content) && response.totalElements === CONSTANTS.INT_MAX_VALUE) {
                    this.lastPage = true;
                    resolve(this.formattedDataSet);
                    return;
                }
            }
            // if data expression exists, extract the data from the expression path
            if (dataExpression) {
                index = dataExpression.lastIndexOf($I);
                restExpr = dataExpression.substr(index + 5);

                if (_.isArray(data)) {
                    formattedData = data.map((datum) => {
                        return findValueOf(datum, restExpr);
                    });
                } else if (_.isObject(data)) {
                    formattedData = _.get(data, dataExpression);
                }

                data = formattedData || data;
            }
            if (!_.isArray(data)) {
                data = this.getTransformedData(this.datasource, data);
            }
            // in case of no data received, resolve the promise with empty array
            if (!data.length) {
                resolve([]);
            } else {
                this.formattedDataSet = this.page > 1 ? this.formattedDataSet.concat(data) : data;

                resolve(transformData(this.formattedDataSet, this.datafield, this.displaylabel, this.displayexpression, this.displayimagesrc));
            }
        });
    }

    private handleQueryError() {
        // setting loadingItems to false when some error occurs, so that loading icon is hidden
        this._loadingItems = false;
    }

    // triggered on select on option from the list. Set the queryModel, query and proxyModel from the matched item.
    typeaheadOnSelect($event, match: TypeaheadMatch): void {
        const item = match.item;
        this.queryModel = item;
        item.selected = true;
        this.query = item.label;
        this.proxyModel = item.key;

        this.invokeOnTouched();
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
        this.oldQuery = this.query;
    }

    // Todo: Close the full screen mode in mobile view of auto complete
    closeSearch(): void {
        this.page = 1;
    }


    // Todo: this functions clears the input value
    private clearText() {
    }

    // Todo: Clear the search and trigger the search with empty value
    clearSearch(): void {
        this.page = 1;
    }
}

export class LocalDataSource {
    private dataset: any[];
    private queryText: string;
    private searchKey: string;
    private casesensitive: boolean;

    constructor(dataConfig) {
        this.dataset = dataConfig.dataset;
        this.queryText = dataConfig.queryText;
        this.searchKey = dataConfig.searchKey;
        this.casesensitive = dataConfig.casesensitive;
    }

    // LocalData filtering is done based on the searchkey.
    public filter() {
            const entries = this.dataset;
            const casesensitive = this.casesensitive;
            let queryText = this.queryText;

            return new Promise((resolve, reject) => {
                if (this.searchKey) {
                    const keys = _.split(this.searchKey, ',');
                    /*push the wmDisplayLabel to match the display label formatted*/
                    // Todo: why wmDisplayLabel is the key.
                    keys.push('label');
                    resolve(_.filter(this.dataset, (item: any) => {
                        return keys.some((key) => {
                            let a = _.get(item, key),
                                b = queryText;
                            if (!casesensitive) {
                                a = _.toLower(_.toString(a));
                                b = _.toLower(_.toString(b));
                            }
                            return _.includes(a, b);
                        });
                    }));
                } else {
                    // local search on data with array of objects.
                    if (_.isArray(entries) && _.isObject(entries[0])) {
                        resolve(_.filter(entries, entry => {
                            return (_.includes(_.toLower(_.values(entry).join(' ')), _.toLower(queryText)));
                        }));
                    } else {
                        resolve(_.filter(entries, entry => {
                            if (!casesensitive) {
                                entry = _.toLower(entry);
                                queryText = _.toLower(queryText);
                            }
                            return _.includes(entry, queryText);
                        }));
                    }
                }
            });
    }
}

// This class contains filter method which makes call to search records for live or service variable.
export class VariableDataSource {
    datasource;
    private datafield: any[];
    private queryText: string;
    private searchkey: string;
    private casesensitive: boolean;
    private defaultQuery: boolean;
    private orderby: any;
    private limit: any;
    private pagesize;
    private page;

    constructor(dataConfig) {
        this.defaultQuery = dataConfig.defaultQuery;
        this.datafield = dataConfig.datafield;
        this.queryText = dataConfig.queryText;
        this.searchkey = dataConfig.searchKey;
        this.casesensitive = dataConfig.casesensitive;
        this.orderby = dataConfig.orderby;
        this.limit = dataConfig.limit;
        this.pagesize = dataConfig.pagesize;
        this.datasource = dataConfig.datasource;
        this.page = dataConfig.page;
    }

    public filter() {
        return this.datasource.execute(DataSource.Operation.SEARCH_RECORDS, {
            searchKeys: this.defaultQuery ? _.split(this.datafield, ',') : _.split(this.searchkey, ','),
            searchValue: this.queryText,
            orderBy: this.orderby ? _.replace(this.orderby, /:/g, ' ') : '',
            pagesize: this.limit || this.pagesize,
            page: this.page
        });
    }
}


