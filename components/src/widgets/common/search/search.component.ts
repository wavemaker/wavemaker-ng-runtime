import { Attribute, Component, Injector, OnInit, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import { TypeaheadDirective, TypeaheadMatch } from 'ngx-bootstrap';

import { isDefined } from '@wm/core';

import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { convertDataToObject, DataSetItem, transformData } from '../../../utils/form-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { registerProps } from './search.props';
import { ALLFIELDS } from '../../../utils/data-utils';
import { DataProvider, IDataProvider, IDataProviderConfig } from './data-provider/data-provider';

declare const _;

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
export class SearchComponent extends DatasetAwareFormComponent implements OnInit {

    public casesensitive: boolean;
    public searchkey: string;
    public queryModel: DataSetItem[];
    public query: string;
    public limit: any;
    public showsearchicon: boolean;
    public minlength: number;
    public type: string;

    private typeaheadDataSource: Observable<any>;
    private pagesize: any;
    private datasource: any;
    private page = 1;
    private _loadingItems: boolean;
    private dataProvider: IDataProvider;
    private result: Array<any>; // contains the search result i.e. matches
    private noMoreData: boolean;
    private isLastPage: boolean;
    private formattedDataset: any;

    @ViewChild(TypeaheadDirective) typeahead: TypeaheadDirective;

    constructor(
        inj: Injector,
        @Attribute('datavalue.bind') private binddatavalue,
        @Attribute('dataset.bind') private binddataset
    ) {
        super(inj, WIDGET_CONFIG);

        /**
         * Listens for the change in the ngModel on every search and retrieves the data as observable.
         * This observable data is passed to the typeahead.
         * @type {Observable<any>}
         */
        this.typeaheadDataSource = Observable
            .create((observer: any) => {
                // Runs on every search
                observer.next(this.query);
            })
            .mergeMap((token: string) => this.getDataSourceAsObservable(token));

        /**
         * When default datavalue is not found within the dataset, a filter call is made to get the record using fetchDefaultModel.
         * after getting the response, set the queryModel and query.
         */
        this.datavalue$.subscribe((val: Array<string> | string) => {

            const query = (_.isArray(val) ? val[0] : val) as string;

            if (_.isUndefined(query) || query === null) {
                return;
            }

            // if the datafield is ALLFILEDS do not fetch the records
            // update the query model with the values we have
            if (this.datafield === ALLFIELDS) {
                this.updateQueryModel(val);
                return;
            }

            // value is present but the corresponding key is not found then fetch next set
            // modelByKey will be set only when datavalue is available inside the localData otherwise make a N/w call.
            if (!this.modelByKey) {
                this.query = query;
            } else {
                this.updateQueryModel(val);
            }
        });

        this.dataProvider = new DataProvider();
    }

    // triggered on select on option from the list. Set the queryModel, query and modelByKey from the matched item.
    protected typeaheadOnSelect($event, match: TypeaheadMatch): void {
        const item = match.item;
        this.queryModel = item;
        item.selected = true;
        this.query = item.label;

        // As item.key can vary from key in the datasetItems
        this.datavalue = item.value;

        this.invokeOnTouched();
        this.invokeEventCallback('select', {$event, selectedValue: this.datavalue});
        this.invokeEventCallback('submit', {$event});

        this.updatePrevDatavalue(this.datavalue);
    }

    private onInputChange() {
        // reset all the previous page detailss in order to fetch new set of result.
        this.dataProvider.hasNoMoreData = false;
        this.result = [];
        this.page = 1;
    }

    protected getTransformedData(data): DataSetItem[] {
        return transformData(
            data,
            this.datafield,
            {
                displayField: this.displayfield || this.displaylabel,
                displayExpr: this.displayexpression,
                bindDisplayExpr: this.binddisplayexpression,
                bindDisplayImgSrc: this.binddisplayimagesrc,
                displayImgSrc: this.displayimagesrc
            }
        );
    }

    // This function returns an observable containing the search results.
    // if searchKey is defined, then variable call is made using the searchkey and other filterfields
    // else local data search is performed.
    protected getDataSourceAsObservable(query: string): Observable<DataSetItem[]> {
        if (this.dataset) {
            this.formattedDataset = convertDataToObject(this.dataset);
        }

        const dataConfig: IDataProviderConfig = {
            dataset: this.formattedDataset,
            binddataset: this.binddataset,
            datasource: this.datasource,
            datafield: this.datafield,
            query: query,
            searchKey: this.searchkey,
            casesensitive: this.casesensitive,
            orderby: this.orderby,
            limit: this.limit,
            pagesize: this.pagesize,
            page: this.page
        };

        if (this.dataProvider.hasNoMoreData) {
            // converting array to observable using "observable.to".
            return Observable.of(this.getTransformedData(this.result));
        }

        this._loadingItems = true;

        // converting promise to observable of datasetItem using "observable.from".
        return Observable.from(
            this.dataProvider.filter(dataConfig)
                .then((response: any) => {

                    response = response.data || response;

                    this._loadingItems = false;

                    // Todo: concat the dataset with the response.
                    if (this.dataProvider.hasMoreData) {
                        this.formattedDataset = this.formattedDataset.concat(response);
                    } else {
                        this.formattedDataset = response;
                    }

                    this.result = this.formattedDataset;

                    this.noMoreData = this.isLastPage;

                    return this.getTransformedData(this.result);
                }, (error) => {
                    this._loadingItems = false;
                    return [];
                }
            )
        );
    }

    private updateQueryModel(data, startIndex?) {
        // Todo: [bandhavya] verify after this change.
        if (!_.isArray(data)) {
            data = [data];
        }
        this.queryModel = transformData(
            data,
            this.datafield,
            {
                displayField: this.displayfield || this.displaylabel,
                displayExpr: this.displayexpression,
                bindDisplayExpr: this.binddisplayexpression,
                bindDisplayImgSrc: this.binddisplayimagesrc,
                displayImgSrc: this.displayimagesrc
            },
            startIndex
        );

        // Show the label value on input.
        this.query = this.queryModel[0].label;
    }


    // OptionsListTemplate listens to the scroll event and triggers this function.
    public onScroll($scrollEl, evt: Event) {
        const totalHeight = $scrollEl.scrollHeight,
            clientHeight = $scrollEl.clientHeight;

        // If scroll is at the bottom and no request is in progress and next page records are available, fetch next page items.
        if (!this._loadingItems && !this.dataProvider.isLastPage && ($scrollEl.scrollTop + clientHeight >= totalHeight)) {
            this.loadMoreData(true);
        }
    }

    private loadMoreData(incrementPage?: boolean) {
        if (this.dataProvider.isLastPage) {
            return;
        }
        // Increase the page number and trigger force query update
        this.page = incrementPage ? this.page + 1 : this.page;

        // trigger the typeahead change manually to fetch the next set of results.
        this.typeahead.onInput({
            target: {
                value: '0' // dummy data to notify the observables
            }
        });
    }

    public ngOnInit() {
        super.ngOnInit();

        // for autocomplete set the minlength to 0
        if (this.type === 'autocomplete') {
            this.minlength = 0;
        } else {
            this.minlength = isDefined(this.minlength) ? this.minlength : 1;
        }

        // by default for autocomplete do not show the search icon
        // by default show the searchicon for type = search
        this.showsearchicon = isDefined(this.showsearchicon) ? this.showsearchicon : (this.type === 'search');
    }
}


