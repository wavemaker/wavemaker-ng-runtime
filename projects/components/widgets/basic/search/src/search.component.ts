import { AfterViewInit, Attribute, Component, ElementRef, Injector, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { Observable, from, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { TypeaheadContainerComponent, TypeaheadDirective, TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { addClass, adjustContainerPosition, DataSource, isDefined, isMobile, toBoolean } from '@wm/core';
import { ALLFIELDS, convertDataToObject, DataSetItem, extractDataAsArray, getUniqObjsByDataField, provideAs, provideAsWidgetRef, styler, transformFormData } from '@wm/components/base';
import { DatasetAwareFormComponent } from '@wm/components/input';

import { registerProps } from './search.props';
import { DataProvider, IDataProvider, IDataProviderConfig } from './data-provider/data-provider';

declare const _;

const WIDGET_CONFIG = { widgetType: 'wm-search', hostClass: 'input-group' };

@Component({
    selector: '[wmSearch]',
    templateUrl: './search.component.html',
    providers: [
        provideAs(SearchComponent, NG_VALUE_ACCESSOR, true),
        provideAs(SearchComponent, NG_VALIDATORS, true),
        provideAsWidgetRef(SearchComponent)
    ]
})
export class SearchComponent extends DatasetAwareFormComponent implements OnInit, AfterViewInit {
    static initializeProps = registerProps();
    public casesensitive: boolean;
    public searchkey: string;
    public queryModel: Array<DataSetItem> | string;
    public query = '';
    public limit: any;
    public showsearchicon: boolean;
    public minchars: number;
    public type: string;
    public navsearchbar: any;
    public debouncetime: number;

    private typeaheadDataSource: Observable<any>;
    private pagesize: any;
    private page = 1;
    public _loadingItems: boolean;
    private dataProvider: IDataProvider;
    private result: Array<any>; // contains the search result i.e. matches
    private formattedDataset: any;
    private isformfield: boolean;
    private $typeaheadEvent: Event;

    public tabindex: number;
    public startIndex: number;
    public binddisplaylabel: string;
    public typeaheadContainer: TypeaheadContainerComponent;

    @ViewChild(TypeaheadDirective) typeahead: TypeaheadDirective;
    @ViewChild('ulElement') ulElement: ElementRef;
    @ViewChildren('liElements') liElements: QueryList<ElementRef>;

    private allowonlyselect: boolean;
    private class: string;

    private lastSelectedIndex: number;
    private dataoptions: any;
    public dropdownEl: any;
    private _lastQuery: string;
    private _lastResult: any;
    private _isOpen: boolean; // set to true when dropdown is open
    private showClosebtn: boolean;
    private _unsubscribeDv: boolean;
    private _datasource: any;
    private isScrolled: boolean;
    private parentEl: any;
    private position: string;
    private elIndex: number;
    private listenQuery: boolean;
    private _domUpdated: boolean;
    private searchon: string;
    public matchmode: string;

    // getter setter is added to pass the datasource to searchcomponent.
    get datasource() {
        return this._datasource;
    }

    set datasource(nv) {
        this._datasource = nv;
        const data = this.datavalue || this.toBeProcessedDatavalue;
        this.updateByDatavalue(data);
    }

    constructor(
        inj: Injector,
        @Attribute('datavalue.bind') public binddatavalue,
        @Attribute('dataset.bind') public binddataset
    ) {
        super(inj, WIDGET_CONFIG);
        // this flag will not allow the empty datafield values.
        this.allowempty = false;

        addClass(this.nativeElement, 'app-search', true);

        /**
         * Listens for the change in the ngModel on every search and retrieves the data as observable.
         * This observable data is passed to the typeahead.
         * @type {Observable<any>}
         */
        this.typeaheadDataSource = Observable
            .create((observer: any) => {
                // Runs on every search
                if (this.listenQuery) {
                    this._defaultQueryInvoked = false;
                    this._loadingItems = true;
                    observer.next(this.query);
                }
                // on keydown, while scrolling the dropdown items, when last item is reached next call is triggered
                // unless the call is resolved, we are able to scroll next to first item and soon
                // This shows flickering from first item to next new items appended.
                // By setting container to undefined, key events changes will be stopped while loading items
                if (this.lastSelectedIndex) {
                    this.typeahead._container = undefined;
                }
            }).pipe(
                mergeMap((token: string) => this.getDataSourceAsObservable(token))
            );

        this.dataProvider = new DataProvider();

        /**
         * When default datavalue is not found within the dataset, a filter call is made to get the record using fetchDefaultModel.
         * after getting the response, set the queryModel and query.
         */
        const datavalueSubscription = this.datavalue$.subscribe((val: Array<string> | string) => {

            const query = (_.isArray(val) ? val[0] : val) as string;

            if (query === null || query === '') {
                this._modelByValue = '';
                // reset the query.
                this.query = this.queryModel = '';
                // on clear or reset filter, empty the lastResults to fetch new records.
                this._lastResult = undefined;
                return;
            }

            if (!this._unsubscribeDv) {
                this._defaultQueryInvoked = false;
                // if prev datavalue is not equal to current datavalue then clear the modelByKey and queryModel
                if (!_.isObject(val) && (this as any).prevDatavalue !== val) {
                    this._modelByKey = undefined;
                    this.query = this.queryModel = '';
                }
                // if the datafield is ALLFILEDS do not fetch the records
                // update the query model with the values we have
                this.updateByDatavalue(val);
            }
        });
        this.registerDestroyListener(() => datavalueSubscription.unsubscribe());

        const datasetSubscription = this.dataset$.subscribe(() => {
            // set the next item index.
            this.startIndex = this.datasetItems.length;
            this._lastResult = undefined;
            const defaultValue = this.datavalue || this.toBeProcessedDatavalue;
            // invoking updateByDataset only when datavalue is present, as entered value i.e. query is setting back to ''
            if (isDefined(defaultValue)) {
                this.updateByDataset(defaultValue);
            }
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());
    }

    // on clear, trigger search with page size 1
    private clearSearch($event, loadOnClear) {
        this.query = '';
        this.onInputChange($event);
        this.dataProvider.isLastPage = false;
        this.listenQuery = false;
        if (loadOnClear) {
            this.listenQuery = true;
            this._unsubscribeDv = false;
            this.loadMoreData();
        }
        this.invokeEventCallback('clearsearch');
    }

    // function to  clear the input value
    public clearText() {
        this.$element.find('input').val('');
        this.showClosebtn = false;
    }

    // Close the full screen mode in mobile view of auto complete
    private closeSearch() {
        this._loadingItems = false;
        this.page = 1;
        // after closing the search, insert the element at its previous position (elIndex)
        this.insertAtIndex(this.elIndex);
        this.elIndex = undefined;
        this.parentEl = undefined;
        this.$element.removeClass('full-screen');
        if (this._domUpdated) {
            this._domUpdated = false;
        }
        this.listenQuery = false;
        this._unsubscribeDv = true;
        this.typeahead.hide();
    }

    private renderMobileAutoComplete() {
        // Get the parent element of the search element which can be next or prev element, if both are empty then get the parent of element.
        if (!isDefined(this.elIndex)) {
            this.parentEl = this.$element.parent();
            this.elIndex = this.parentEl.children().index(this.$element);
        }
        if (!this.$element.hasClass('full-screen')) {
            // this flag is set to notify that the typeahead-container dom has changed its position
            this._domUpdated = true;
            // Add full screen class on focus of the input element.
            this.$element.addClass('full-screen');

            // Add position to set the height to auto
            if (this.position === 'inline') {
                this.$element.addClass(this.position);
            }
        }
        // focus is lost when element is changed to full-screen, keydown to select next items will not work
        // Hence explicitly focusing the input
        if (this.$element.hasClass('full-screen')) {
            this.$element.find('.app-search-input').focus();
        }
    }

    private getDataSourceAsObservable(query: string): Observable<any> {
        // show dropdown only when there is change in query. This should not apply when dataoptions with filterFields are updated.
        // when lastResult is not available i.e. still the first call is pending and second query is invoked then do not return.
        if (this._lastQuery === query && !_.get(this.dataoptions, 'filterFields') && isDefined(this._lastResult)) {
            this._loadingItems = false;
            return of(this._lastResult);
        }
        this._lastQuery = this.query;
        return from(this.getDataSource(query));
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (!_.includes(['blur', 'focus', 'select', 'submit', 'change'], eventName)) {
            super.handleEvent(node, eventName, eventCallback, locals);
        }
    }

    // highlight the characters in the dropdown matching the query.
    private highlight(match: TypeaheadMatch, query: string) {
        if (this.typeaheadContainer) {
            // highlight of chars will work only when label are strings.
            (match as any).value = match.item.label.toString();
            return this.typeaheadContainer.highlight(match, query);
        }
    }

    // inserts the element at the index position
    private insertAtIndex(i) {
        if (i === 0) {
            this.parentEl.prepend(this.$element);
        } else {
            const $elAtIndex = this.parentEl.children().eq(i);
            if ($elAtIndex.length) {
                this.$element.insertBefore(this.parentEl.children().eq(i));
            } else {
                this.$element.insertAfter(this.parentEl.children().eq(i - 1));
            }
        }
    }

    // Check if the widget is of type autocomplete in mobile view/ app
    public isMobileAutoComplete() {
        return this.type === 'autocomplete' && isMobile();
    }

    private loadMoreData(incrementPage?: boolean) {
        if (this.dataProvider.isLastPage) {
            return;
        }
        // Increase the page number and trigger force query update
        this.page = incrementPage ? this.page + 1 : this.page;

        this.isScrolled = true;
        this._loadingItems = true;

        // when invoking new set of results, reset the lastQuery.
        if (incrementPage) {
            this._lastQuery = undefined;
        }

        // trigger the typeahead change manually to fetch the next set of results.
        this.typeahead.onInput({
            target: {
                value: _.trim(this.query) || '0' // dummy data to notify the observables
            }
        });
    }

    // on focusout, subscribe to the datavalue changes again
    private onFocusOut() {
        this._unsubscribeDv = false;
        this._loadingItems = false;
        // reset the page value on focusout.
        this.page = 1;
        // if domUpdated is true then do not hide the dropdown in the fullscreen
        if (!this._domUpdated && this._isOpen) {
            this.listenQuery = false;

            // hide the typeahead only after the item is selected from dropdown.
            setTimeout(() => {
                if ((this.typeahead as any)._typeahead.isShown) {
                    this.typeahead.hide();
                }
            }, 200);
        }
        this._isOpen = false;
        // on outside click, typeahead is hidden. To avoid this, when fullscreen is set, overridding isFocused flag on the typeahead container
        if (this._domUpdated && this.typeahead && (this.typeahead as any)._container) {
            (this.typeahead as any)._container.isFocused = true;
        }
    }

    private onInputChange($event) {
        // reset all the previous page details in order to fetch new set of result.
        this.result = [];
        this.page = 1;
        this.listenQuery = this.isUpdateOnKeyPress();
        this._modelByValue = undefined;

        // when input is cleared, reset the datavalue
        if (this.query === '') {
            this.queryModel = '';
            this._modelByValue = '';
            this.invokeOnChange(this._modelByValue, {}, true);

            // trigger onSubmit only when the search input is cleared off and do not trigger when tab is pressed.
            if ($event && $event.which !== 9) {
                this.invokeEventCallback('submit', { $event });
            }
        } else {
            // invoking change event on every input value change.
            this.invokeEventCallback('change', {
                $event: $event,
                newVal: this._modelByValue || this.query,
                oldVal: (this as any).prevDatavalue
            });
        }
        this.showClosebtn = (this.query !== '');
    }

    // Triggered for enter event
    private handleEnterEvent($event) {
        // submit event triggered when there is no search results
        if (!this.typeahead._container) {
            this.onSearchSelect($event);
        }
    }
    // Triggerred when typeahead option is selected.
    private onSearchSelect($event: Event) {
        // searchOn is set as onBtnClick, then invoke the search api call manually.
        if (!this.isUpdateOnKeyPress()) {
            this.listenQuery = true;
            // trigger the typeahead change manually to fetch the next set of results.
            this.typeahead.onInput({
                target: {
                    value: this.query // dummy data to notify the observables
                }
            });
            return;
        }
        // when matches are available.
        if (this.typeaheadContainer && this.liElements.length) {
            this.typeaheadContainer.selectActiveMatch();
        } else {
            this.queryModel = this.query;
            this.invokeEventCallback('submit', { $event });
        }
    }

    private invokeOnBeforeServiceCall(inputData) {
        this.invokeEventCallback('beforeservicecall', { inputData });
    }

    private onDropdownOpen() {
        // setting the ulElements, liElement on typeaheadContainer.
        // as we are using customOption template, liElements are not available on typeaheadContainer so append them explicitly.
        const fn = _.debounce(() => {
            this._isOpen = true;
            this.typeaheadContainer = this.typeahead._container || (this.typeahead as any)._typeahead.instance;
            (this.typeaheadContainer as any).liElements = this.liElements;
            (this.typeaheadContainer as any).ulElement = this.ulElement;
            adjustContainerPosition($('typeahead-container'), this.nativeElement, (this.typeahead as any)._typeahead, $('typeahead-container .dropdown-menu'));

        });

        fn();

        // open full-screen search view
        if (this.isMobileAutoComplete()) {
            if (!this.$element.hasClass('full-screen')) {
                this.renderMobileAutoComplete();
            }
            const dropdownEl = this.dropdownEl.closest('typeahead-container');

            dropdownEl.insertAfter(this.$element.find('input:first'));
            const screenHeight = this.$element.closest('.app-content').height();
            dropdownEl.css({ position: 'relative', top: 0, height: screenHeight + 'px' });
            this.showClosebtn = this.query && this.query !== '';

            if (!this.dataProvider.isLastPage) {
                this.triggerSearch();
            }
        }
    }

    private selectNext() {
        const matches = this.typeaheadContainer.matches;

        if (!matches) {
            return;
        }
        const index = matches.indexOf(this.typeaheadContainer.active);

        // on keydown, if scroll is at the bottom and next page records are available, fetch next page items.
        if (!this._loadingItems && !this.dataProvider.isLastPage && index + 1 > matches.length - 1) {
            // index is saved in order to select the lastSelected item in the dropdown after fetching next page items.
            this.lastSelectedIndex = index;
            this.loadMoreData(true);
        }
    }

    private setLastActiveMatchAsSelected() {
        if (this.lastSelectedIndex) {
            (this.typeaheadContainer as any)._active = this.typeaheadContainer.matches[this.lastSelectedIndex];
            this.typeaheadContainer.nextActiveMatch();
            this.lastSelectedIndex = undefined;
        }
    }

    private triggerSearch() {
        if (this.dataProvider.isLastPage || !this.$element.hasClass('full-screen')) {
            return;
        }
        const typeAheadDropDown = this.dropdownEl;
        const $lastItem = typeAheadDropDown.find('li').last();

        // Check if last item is not below the full screen
        if ($lastItem.length && typeAheadDropDown.length && (typeAheadDropDown.height() + typeAheadDropDown.position().top > $lastItem.height() + $lastItem.position().top)) {
            this.loadMoreData(true);
        }
    }

    private isUpdateOnKeyPress() {
        return this.searchon === 'typing';
    }

    private debounceDefaultQuery(data) {
        this._defaultQueryInvoked = true;
        this.getDataSource(data, true).then((response) => {
            if (response.length) {
                this.queryModel = response;
                this._lastQuery = this.query = this.queryModel[0].label || '';
                this._modelByValue = this.queryModel[0].value;
                this._modelByKey = this.queryModel[0].key;
            } else {
                this._modelByValue = undefined;
                this.queryModel = undefined;
                this.query = '';
            }
        });
    }

    private updateByDatavalue(data) {
        this.updateByDataset(data);
        this.updateByDataSource(data);
    }

    private updateByDataSource(data) {
        // value is present but the corresponding key is not found then fetch next set
        // modelByKey will be set only when datavalue is available inside the localData otherwise make a N/w call.
        if (isDefined(data) && !_.isObject(data) && this.datasource && !isDefined(this._modelByKey) && this.datafield !== ALLFIELDS) {
            // Avoid making default query if queryModel already exists.
            if (isDefined(this.queryModel) && !_.isEmpty(this.queryModel)) {
                this.updateDatavalueFromQueryModel();
                return;
            }

            // Make default query call only when datasource supports CRUD (live variable).
            if (!this._defaultQueryInvoked && this.datasource.execute(DataSource.Operation.SUPPORTS_CRUD)) {
                this.debounceDefaultQuery(data);
            }
        }
    }

    // updates the model value using queryModel
    private updateDatavalueFromQueryModel() {
        if (isDefined(this.queryModel)) {
            this._modelByValue = _.isArray(this.queryModel) ? (this.queryModel[0] as DataSetItem).value : this.queryModel;
            this._modelByKey = _.isArray(this.queryModel) ? (this.queryModel[0] as DataSetItem).key : this.queryModel;
            this.toBeProcessedDatavalue = undefined;
        }
    }

    private updateByDataset(data: any) {
        // default query is already invoked then do not make other default query call.
        // For local search i.e. searchkey is undefined, do not return, verify the datavalue against the datasetItems .
        if (this._defaultQueryInvoked && this.searchkey) {
            return;
        }
        const selectedItem = _.find(this.datasetItems, (item) => {
            return (_.isObject(item.value) ? _.isEqual(item.value, data) : (_.toString(item.value)).toLowerCase() === (_.toString(data)).toLowerCase());
        });

        // set the default only when it is available in dataset.
        if (selectedItem) {
            this.queryModel = [selectedItem];
        } else if (this.datafield === ALLFIELDS && _.isObject(data)) {
            this.queryModel = this.getTransformedData(extractDataAsArray(data));
        } else {
            // resetting the queryModel only when prevDatavalue is equal to data
            if ((this as any).prevDatavalue !== data) {
                this.queryModel = undefined;
                this.query = '';
                return;
            }
        }
        this.updateDatavalueFromQueryModel();

        // Show the label value on input.
        this._lastQuery = this.query = isDefined(this.queryModel) && this.queryModel.length ? _.get(this.queryModel[0], 'label') : '';
    }

    // If we have last search results then open dropdown on focus
    private handleFocus($event) {
        if (this.type === 'search' && this.query === this._lastQuery && this._lastResult) {
            (this.typeahead as any).keyUpEventEmitter.emit(this.query);
        }
    }

    // This method returns a promise that provides the filtered data from the datasource.
    public getDataSource(query: Array<string> | string, searchOnDataField?: boolean, nextItemIndex?: number): Promise<DataSetItem[]> {
        // For default query, searchOnDataField is set to true, then do not make a n/w call when datafield is ALLFIELDS
        if (searchOnDataField && this.datafield === ALLFIELDS) {
            this._loadingItems = false;
            return Promise.resolve([]);
        }

        // For default datavalue, search key as to be on datafield to get the default data from the filter call.
        const dataConfig: IDataProviderConfig = {
            dataset: this.dataset ? convertDataToObject(this.dataset) : undefined,
            binddataset: this.binddataset,
            datasource: this.datasource,
            datafield: this.datafield,
            hasData: this.dataset && this.dataset.length,
            query: query,
            isLocalFilter: !this.searchkey,
            searchKey: searchOnDataField ? this.datafield : this.searchkey,
            // default search call match mode should be startignorecase
            matchMode: searchOnDataField ? 'startignorecase' : this.matchmode,
            casesensitive: this.casesensitive,
            isformfield: this.isformfield,
            orderby: this.orderby,
            limit: this.limit,
            pagesize: this.pagesize,
            page: this.page,
            onBeforeservicecall: this.invokeOnBeforeServiceCall.bind(this)
        };

        if (this.dataoptions) {
            dataConfig.dataoptions = this.dataoptions;
            dataConfig.viewParent = this.viewParent;
        }

        this._loadingItems = true;

        return this.dataProvider.filter(dataConfig)
            .then((response: any) => {
                // response from dataProvider returns always data object.
                response = response.data || response;

                // for service variable, updating the dataset only if it is not defined or empty
                if ((!isDefined(this.dataset) || !this.dataset.length) && this.dataProvider.updateDataset) {
                    this.dataset = response;
                }

                if (this.dataProvider.hasMoreData) {
                    this.formattedDataset = this.formattedDataset.concat(response);
                } else {
                    this.formattedDataset = response;
                }

                // explicitly setting the optionslimit as the matches more than 20 will be ignored if optionslimit is not specified.
                if (this.formattedDataset.length > 20 && !isDefined(this.limit)) {
                    this.typeahead.typeaheadOptionsLimit = this.formattedDataset.length;
                }

                // In mobile, trigger the search by default until the results have height upto page height. Other results can be fetched by scrolling
                if (this._isOpen && this.isMobileAutoComplete() && !this.dataProvider.isLastPage) {
                    this.triggerSearch();
                }

                const transformedData = this.getTransformedData(this.formattedDataset, nextItemIndex);

                // result contains the datafield values.
                this.result = _.map(transformedData, 'value');
                return transformedData;
            }, (error) => {
                this._loadingItems = false;
                return [];
            }
            ).then(result => {
                if (this.isScrolled) {
                    (_.debounce(() => {
                        this.setLastActiveMatchAsSelected();
                    }, 30))();
                    this.isScrolled = false;
                }
                // When no result is found, set the datavalue to undefined.
                if (!result.length) {
                    this._modelByValue = undefined;
                    this.queryModel = (query as string);
                }
                // on focusout i.e. on other widget focus, if n/w is pending loading icon is shown, when data is available then dropdown is shown again.
                // on unsubscribing do not show the results.
                if (this._unsubscribeDv) {
                    result = [];
                }
                this._loadingItems = false;
                this._lastResult = result;
                return result;
            });
    }

    // this method returns the parent context i.e. Page context and not parent component's context.
    private getContext(context) {
        if (context && _.get(context, 'widget')) {
            return this.getContext(context.viewParent);
        }
        return context;
    }

    public getTransformedData(data: any, itemIndex?: number, iscustom?: boolean): DataSetItem[] {
        if (isDefined(itemIndex)) {
            itemIndex++;
        }

        const transformedData = transformFormData(
            this.getContext(this.viewParent),
            data,
            this.datafield,
            {
                displayField: this.displaylabel || this.displayfield,
                displayExpr: iscustom ? '' : this.displayexpression,
                bindDisplayExpr: iscustom ? '' : this.binddisplaylabel,
                bindDisplayImgSrc: this.binddisplayimagesrc,
                displayImgSrc: this.displayimagesrc
            },
            itemIndex
        );
        return getUniqObjsByDataField(transformedData, this.datafield, this.displayfield || this.displaylabel, toBoolean(this.allowempty));
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

    public ngOnInit() {
        super.ngOnInit();

        if (!isDefined(this.minchars)) {
            // for autocomplete set the minchars to 0
            if (this.type === 'autocomplete') {
                this.minchars = 0;
            } else {
                this.minchars = 1;
            }
        }

        this.listenQuery = this.isUpdateOnKeyPress();

        // by default for autocomplete do not show the search icon
        // by default show the searchicon for type = search
        this.showsearchicon = isDefined(this.showsearchicon) ? this.showsearchicon : (this.type === 'search');
    }

    public ngAfterViewInit() {
        super.ngAfterViewInit();

        styler(this.nativeElement as HTMLElement, this);
    }

    // triggered on select on option from the list. Set the queryModel, query and modelByKey from the matched item.
    public typeaheadOnSelect(match: TypeaheadMatch, $event: Event): void {
        const item = match.item;
        this.queryModel = item;
        item.selected = true;
        this.query = item.label;
        $event = $event || this.$typeaheadEvent;

        // As item.key can vary from key in the datasetItems
        this._modelByKey = item.key;
        this._modelByValue = item.value;

        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue, $event || {});
        // updating the variable bound to default value as invokeOnChange is not updating the variable.
        if (this.datavalue !== (this as any).prevDatavalue) {
            this.updateBoundVariable(this.datavalue);
        }
        if (this.$element.hasClass('full-screen')) {
            this.closeSearch();
        }
        this.invokeEventCallback('select', { $event, selectedValue: this.datavalue });
        this.invokeEventCallback('submit', { $event });

        this.updatePrevDatavalue(this.datavalue);
    }

    onPropertyChange(key: string, nv: any, ov: any) {
        if (key === 'tabindex') {
            return;
        }

        // Backward compatability from 10.3.1 to 10.3.2
        // 10.3.1 we had displaylabel as modal value
        // From 10.3.2 onwords we will be having displayexpresion as modal value
        if (this.type === 'autocomplete' && key === 'displaylabel' && this.displaylabel && (!this.displayexpression || (this.displayexpression && !this.datasource)))  {
            this.displayexpression = this.displaylabel;
            this.displaylabel = undefined;
        }

        // when dataoptions are provided and there is no displaylabel given then displaylabel is set as the relatedfield
        if (key === 'displaylabel' && this.dataoptions && this.binddisplaylabel === null) {
            this.query = _.get(this._modelByValue, nv) || this._modelByValue;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
