import { Component, Injector, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import { $appDigest, getClonedObject } from '@wm/utils';

import { styler } from '../../framework/styler';
import { BaseFormComponent } from '../base/base-form.component';
import { getControlValueAccessor, getEvaluatedData, invokeEventHandler } from '../../../utils/widget-utils';
import { getOrderedDataSet } from '../../../utils/form-utils';
import { registerProps } from './search.props';

declare const _;

const ALL_FIELDS: string = 'All Fields';

const WIDGET_CONFIG = {widgetType: 'wm-search', hostClass: 'app-search input-group'};

registerProps();
/**
 * The Search component
 * Represents search widget with dataset, displaylabel, datafield etc., properties.
 * Example of usage:
 * <example-url>http://localhost:4200/search</example-url>
 *
 */
@Component({
    selector: '[wmSearch]',
    templateUrl: './search.component.html',
    providers: [getControlValueAccessor(SearchComponent)]
})
export class SearchComponent extends BaseFormComponent implements OnInit {

    displaylabel;
    datafield;
    casesensitive;
    searchkey;
    imagewidth;
    orderby;
    displayimagesrc;

    /**
     * Private property to map the datavalue
     */
    private proxyDatavalue;
    private _datavalue;
    /**
     * The result of the search input when dropdown is open
     */
    result: any;
    /**
     * The current page of the result set
     */
    private page = 0;
    /**
     * Private property to map the formatted dataset based on the collection
     */
    private formattedDataSet;
    /**
     * Private property to map the dataSource observable to the typeahead
     */
    dataSource: Observable<any>;
    /**
     * Private property to map the queryModel value
     */
    queryModel: string;
    /**
     * Private property to get the complete model object of the selected item
     */
    private selectedItem;
    /**
     * Private property to map the itemsList prepared from the dataset
     */
    private itemsList: any;
    /**
     * Private property to flag the loading status of the items
     */
    private _loadingItems;
    private _dataset;
    /**
     * The dataset property to set the search results
     */
    set dataset(data) {
        this._dataset = data;
    }

    get dataset() {
        return this.itemsList;
    }

    get datavalue() {
        return this.proxyDatavalue;
    }

    /**
     * The default value to be assigned on the search input
     */
    set datavalue(newVal) {
        this._datavalue = newVal;
    }

    onDatasetChange(newVal?) {
        let dataSet;

        newVal = newVal || this._dataset;

        // get the variable-data w.r.t the variable type
        newVal = (newVal && newVal.data) || newVal;
        // set data-set
        dataSet = getClonedObject(newVal);
        // if data-set is an array, show the 'listOfObjects' mode
        if (_.isArray(dataSet)) {
            // Removing null values from dataSet.
            _.remove(dataSet, (o) => {
                return _.isUndefined(o) || _.isNull(o);
            });

            dataSet = getOrderedDataSet(dataSet, this.orderby);
            // check if dataSet contains list of objects, then switch to 'listOfObjects', else display 'default'
            if (_.isObject(dataSet[0])) {
                _.forEach(dataSet, (eachItem, index) => {
                    const itemValue = dataSet[index];
                    if (_.isObject(itemValue)) {
                        // convert display-label-value to string, as ui.typeahead expects only strings
                        itemValue.wmDisplayLabel = getEvaluatedData(eachItem, {displayexpression: this.displaylabel});
                        // to save all the image urls
                        itemValue.wmImgSrc = getEvaluatedData(eachItem, {displayexpression: this.displayimagesrc});
                        itemValue.wmImgWidth = this.imagewidth;
                    }
                });
            } else {
                // convert all the values in the array to strings
                _.forEach(dataSet, (val, index) => {
                    dataSet[index] = _.toString(val);
                });
            }

            // set the itemList. If page number is greater than 1, append the results.
            this.itemsList = this.page > 1 ? this.itemsList.concat(dataSet) : dataSet;

        } else if (_.isString(dataSet) && dataSet.trim()) {
            // make the string an array, for ex. => if dataSet is 1,2,3 then make it [1,2,3]
            this.dataset = _.split(dataSet, ',');
            return;
        } else if (_.isObject(dataSet)) {
            this.dataset = _.join(Object.keys(dataSet), ',');
            return;
        }
        this.formattedDataSet = this.page > 1 ? this.formattedDataSet.concat(dataSet) : dataSet;

        $appDigest();
        // update the queryModel, if the default value is given and formatted Dataset is defined.
        /*
        if (!isVariableUpdateRequired($is, element.scope(), true) || ($is.formattedDataSet.length && !$is.isDefaultValueExist && WM.isDefined($is.datavalue) && $is.datavalue !== '')) {
            updateQueryModel($is, element);
            $is.isDefaultValueExist = true;
        }
        */
    }

    onDataValueChange(newVal?) {
        let model;
        newVal = newVal || this._datavalue;
        if (newVal) {
            model = this.getDataObjbyDataField(newVal);
            if (!_.isEmpty(model)) {
                model = model[0];
                this.selectedItem = getClonedObject(model);
                this.proxyDatavalue = (this.datafield && this.datafield !== ALL_FIELDS) ? (this.selectedItem && _.get(this.selectedItem, this.datafield)) : this.selectedItem;
                this.queryModel = getEvaluatedData(model, {displayexpression: this.displaylabel});
            } else {
                this.selectedItem = this.proxyDatavalue = this.queryModel = undefined;
            }
        }
        this.invokeOnChange(this.datavalue);
        $appDigest();
    }

    get query() {
        return this.queryModel;
    }

    set query(newVal) {
        this.queryModel = newVal;
        $appDigest();
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this);
    }

    /**
     * Private method to get the the dataobj by the datafield
     */
    private getDataObjbyDataField(matchValue) {
        return _.filter(this.dataset, (item) => {
            if (item[this.datafield] === matchValue) {
                return true;
            }
        });
    }

    /**
     * Private method to get the unique objects by the data field
     */
    private getUniqObjsByDataField(data, dataField, displayField, isLocalSearch) {
        let uniqData;
        const isAllFields = dataField === ALL_FIELDS;

        uniqData = isAllFields ? _.uniqWith(data, _.isEqual) : _.uniqBy(data, dataField);

        if (!displayField && isLocalSearch) {
            return uniqData;
        }

        // return objects having non empty datafield and display field values.
        return _.filter(uniqData, (obj) => {
            if (isAllFields) {
                return _.trim(obj.wmDisplayLabel);
            }
            return !!_.trim(_.get(obj, dataField)) && _.trim(obj.wmDisplayLabel);
        });
    }

    /**
     * Private method to filter the search fields based on the search inputs, returns ScalableObservable instance with the data
     */
    private filterData(token: string): Observable<any> {
        const keys = _.split(this.searchkey, ',');
        /*push the wmDisplayLabel to match the display label formatted*/
        keys.push('wmDisplayLabel');
        const result = _.filter(this.dataset, (item: any) => {
            return keys.some((key) => {
                let a = _.get(item, key),
                    b = token;
                if (!this.casesensitive) {
                    a = _.toLower(_.toString(a));
                    b = _.toLower(_.toString(b));
                }
                return _.includes(a, b);
            });
        });

        this.updateResult(result);
        return Observable.of(this.getUniqObjsByDataField(result, this.datafield, this.displaylabel, true));
    }

    /**
     * Private method to update the result and change the datavalue if results are empty
     */
    private updateResult(matchedItems) {
        // on typing the value in input, make the datavalue undefined, if no matches found.
        if (!matchedItems || _.isEmpty(matchedItems)) {
            this.proxyDatavalue = undefined;
        }
        this.invokeOnChange(this.datavalue);
        this.result = (this.datafield === ALL_FIELDS || !this.datafield) ? matchedItems : _.map(matchedItems, this.datafield);
        $appDigest();
    }

    /**
     * Private method wrapper to map the selectedValue to onSelect, onSubmit Events
     */
    private onTypeAheadSelect($event: TypeaheadMatch | any) {
        this.invokeOnTouched();
        $event = $event || <TypeaheadMatch>{};

        let $item = getClonedObject($event.item);

        $item = this.selectedItem = $item || (this.proxyDatavalue === _.get(this.selectedItem, this.datafield) ? this.selectedItem : undefined);

        const $label = $item && getEvaluatedData($item, {displayexpression: this.displaylabel});

        if ($item && ($item.wmImgSrc || $item.wmDisplayLabel)) {
            delete $item.wmImgSrc;
            delete $item.wmImgWidth;
            delete $item.wmDisplayLabel;
        }

        // add the selected object to the event.data and send to the user
        $event.data = {'item': $item, 'model': $item, 'label': $label, 'query': $label};

        delete $event.item;
        // set selected item on widget's exposed property
        this.proxyDatavalue = (this.datafield && this.datafield !== ALL_FIELDS) ? ($item && _.get($item, this.datafield)) : $item;
        this.queryModel = $label;
        this.result = [];
        // call user 'onSubmit & onSelect' fn
        invokeEventHandler(this, 'select', {$event, newVal: this.proxyDatavalue});
        invokeEventHandler(this, 'submit', {$event});
        this.invokeOnChange(this.datavalue);
    }

    /**
     * Private method to change the loading status of the flag
     */
    private setLoadingItemsFlag(flag) {
        this._loadingItems = flag;
    }
    /**
     * Private method wrappper to the keyDown event
     */
    private executeKeyDownEvent = ($event) => {
        invokeEventHandler(this, 'keydown', {$event});
    }

    ngOnInit() {
        super.ngOnInit();
        this.dataSource = Observable.create((observer: any) => {
            observer.next(this.queryModel);
        }).mergeMap((token: string) => this.filterData(token));
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'scopedataset':
            case 'dataset':
                this.onDatasetChange(newVal);
                break;
            case 'scopedatavalue':
            case 'datavalue':
                this.onDataValueChange(newVal);
                break;
            case 'displaylabel':
            case 'displayimagesrc':
            case 'datafield':
                this.onDatasetChange();
                this.onDataValueChange();
                break;
        }
    }
}
