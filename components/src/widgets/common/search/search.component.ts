import { AfterViewInit, Attribute, Component, ElementRef, Injector, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { TypeaheadContainerComponent, TypeaheadDirective, TypeaheadMatch } from 'ngx-bootstrap';

import { addClass, isDefined } from '@wm/core';

import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { convertDataToObject, DataSetItem, extractDataAsArray, transformData} from '../../../utils/form-utils';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';

import { styler } from '../../framework/styler';

import { registerProps } from './search.props';
import { ALLFIELDS } from '../../../utils/data-utils';
import { DataProvider, IDataProvider, IDataProviderConfig } from './data-provider/data-provider';
import { ChipsComponent } from '../chips/chips.component';

declare const _;

const WIDGET_CONFIG = {widgetType: 'wm-search', hostClass: 'input-group'};

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

    public casesensitive: boolean;
    public searchkey: string;
    public queryModel: DataSetItem[] | string;
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

    public tabindex: number;
    public startIndex: number;
    public acceptsArray: boolean;
    public binddisplaylabel: string;
    public typeaheadContainer: TypeaheadContainerComponent;

    @ViewChild(TypeaheadDirective) typeahead: TypeaheadDirective;
    @ViewChild('ulElement') ulElement: ElementRef;
    @ViewChildren('liElements') liElements: QueryList<ElementRef>;

    private typeaheadScrollable: boolean = true;
    private allowonlyselect: boolean;
    private class: string;

    private parentRef: ChipsComponent; // used when search is inside chips.

    // Default check for container methods to access.
    get typeaheadContainerInstance() {
        return (this.typeaheadContainer as any).instance;
    }

    constructor(
        inj: Injector,
        @Attribute('datavalue.bind') public binddatavalue,
        @Attribute('dataset.bind') public binddataset
    ) {
        super(inj, WIDGET_CONFIG);

        addClass(this.nativeElement, 'app-search', true);

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

            if (_.isUndefined(query) || query === null || query === '') {
                this._modelByValue = '';
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

        this.dataset$.subscribe(() => {
            // set the next item index.
            this.startIndex = this.datasetItems.length;
            this.updateQueryModel(this.datavalue || this.toBeProcessedDatavalue);
        });

        this.dataProvider = new DataProvider();
    }

    // On click of the typeahead item, invoke the container's selectMatch and set the queryModel, datavalue.
    private selectMatch(match: TypeaheadMatch, $event: Event) {
        this.typeaheadContainerInstance.selectMatch(match, $event);
        this.typeaheadOnSelect(match, $event);
    }

    // triggered on select on option from the list. Set the queryModel, query and modelByKey from the matched item.
    protected typeaheadOnSelect(match: TypeaheadMatch, $event: Event): void {
        const item = match.item;
        this.queryModel = item;
        item.selected = true;
        this.query = item.label;

        // As item.key can vary from key in the datasetItems
        this._modelByKey = item.key;
        this._modelByValue = item.value;

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

    // Triggerred when typeahead option is selected.
    private onSelect($event: Event) {
        // when matches are available.
        if (this.typeaheadContainerInstance && this.typeaheadContainerInstance.liElements.length) {
            this.typeaheadContainerInstance.selectActiveMatch();
            this.typeaheadOnSelect(this.typeaheadContainerInstance._active, $event);
        } else if (this.allowonlyselect) {
            // matches are empty set the datavalue to undefined.
            this.queryModel = this.query;
            this._modelByValue = undefined;
        } else {
            // Used by chips, if allowonlyselect is false, set the datavalue to query.
            this.queryModel = this.query;
            this._modelByValue = this.query;

            // adds custom chip object to the chipsList.
            this.notifyParent($event);
        }
    }

    public getTransformedData(data: any, itemIndex?: number): DataSetItem[] {
        if (isDefined(itemIndex)) {
            itemIndex++;
        }

        return transformData(
            data,
            this.datafield,
            {
                displayField: this.displayfield || this.displaylabel,
                displayExpr: this.displayexpression,
                bindDisplayExpr: this.binddisplayexpression,
                bindDisplayImgSrc: this.binddisplayimagesrc,
                displayImgSrc: this.displayimagesrc
            },
            itemIndex
        );
    }

    // This method returns a promise that provides the filtered data from the datasource.
    public getDataSource(query: string, searchOnDataField?: boolean, nextItemIndex?: number): Promise<DataSetItem[]> {
        if (this.dataset) {
            this.formattedDataset = convertDataToObject(this.dataset);
        }

        // For default datavalue, search key as to be on datafield to get the default data from the filter call.
        const dataConfig: IDataProviderConfig = {
            dataset: this.formattedDataset,
            binddataset: this.binddataset,
            datasource: this.datasource,
            datafield: this.datafield,
            query: query,
            searchKey: searchOnDataField ? this.datafield : this.searchkey,
            casesensitive: this.casesensitive,
            orderby: this.orderby,
            limit: this.limit,
            pagesize: this.pagesize,
            page: this.page
        };

        return this.dataProvider.filter(dataConfig)
            .then((response: any) => {

                    response = response.data || response;

                    this._loadingItems = false;

                    if (this.dataProvider.hasMoreData) {
                        this.formattedDataset = this.formattedDataset.concat(response);
                    } else {
                        this.formattedDataset = response;
                    }

                    this.result = response;

                    this.noMoreData = this.isLastPage;

                    return this.getTransformedData(this.formattedDataset, nextItemIndex);
                }, (error) => {
                    this._loadingItems = false;
                    return [];
                }
            ).then(result => {
                // When no result is found, set the datavalue to empty.
                if (!result.length) {
                    this.datavalue = '';
                    this.queryModel = query;
                }
                return result;
            });
    }

    // This function returns an observable containing the search results.
    // if searchKey is defined, then variable call is made using the searchkey and other filterfields
    // else local data search is performed.
    public getDataSourceAsObservable(query: string): Observable<DataSetItem[]> {
        if (this.dataProvider.hasNoMoreData) {
            // converting array to observable using "observable.to".
            return Observable.of(this.getTransformedData(this.formattedDataset));
        }

        this._loadingItems = true;

        // converting promise to observable of datasetItem using "observable.from".
        return Observable.from(this.getDataSource(query));
    }


    public updateQueryModel(data: any) {
        this.queryModel = this.getTransformedData(extractDataAsArray(data));

        // Show the label value on input.
        this.query = this.queryModel.length ? this.queryModel[0].label : '';
    }


    // OptionsListTemplate listens to the scroll event and triggers this function.
    public onScroll($scrollEl: Element, evt: Event) {
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

    // highlight the characters in the dropdown matching the query.
    private hightlight(match: TypeaheadMatch, query: String) {
        (match as any).value = match.item.label;
        return this.typeaheadContainerInstance.hightlight(match, query);
    }

    // Triggers the method on the parent.
    private notifyParent($event) {
        if (this.parentRef) {
            this.parentRef.notifyEmptyValues($event);
        }
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

    public ngAfterViewInit() {
        super.ngAfterViewInit();

        styler(this.nativeElement as HTMLElement, this);

        this.typeaheadContainer = (this.typeahead as any)._typeahead;

        if (this.class === 'app-chip-input') {
            this.parentRef = this.viewParent;
        }

        // setting the ulElements, liElement on typeaheadContainer with custom options template, as the typeaheadContainer implements the key events and scroll.
        this.liElements.changes.subscribe((data) => {
            if (this.typeaheadContainerInstance) {
                this.typeaheadContainerInstance.liElements = data;
                this.typeaheadContainerInstance.ulElement = this.ulElement;
            }
        });
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (eventName === 'select' || eventName === 'submit') {
            return;
        }

        super.handleEvent(node, eventName, eventCallback, locals);
    }
}


