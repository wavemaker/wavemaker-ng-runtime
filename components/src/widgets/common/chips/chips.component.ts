import { AfterViewInit, Attribute, Component, Injector, OnInit, ViewChild } from '@angular/core';

import { $appDigest, $unwatch, $watch, debounce, isAppleProduct, isDefined, toBoolean } from '@wm/core';

import { registerProps } from './chips.props';
import { styler } from '../../framework/styler';
import { SearchComponent } from '../search/search.component';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { configureDnD, DataSetItem, getUniqObjsByDataField } from '../../../utils/form-utils';
import { ALLFIELDS } from '../../../utils/data-utils';
import { IWidgetConfig } from '../../framework/types';
import { getConditionalClasses, provideAsNgValueAccessor, provideAsWidgetRef} from '../../../utils/widget-utils';

declare const _;

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-chips',
    hostClass: 'app-chips nav nav-pills list-inline'
};

registerProps();

@Component({
    selector: '[wmChips]',
    templateUrl: './chips.component.html',
    providers: [
        provideAsNgValueAccessor(ChipsComponent),
        provideAsWidgetRef(ChipsComponent)
    ]
})
export class ChipsComponent extends DatasetAwareFormComponent implements OnInit, AfterViewInit {

    public allowonlyselect: boolean;
    public enablereorder: boolean;
    public maxsize: number;

    private chipsList: Array<any> = [];
    private readonly maxSizeReached = 'Max size reached';
    private saturate: boolean;
    private nextItemIndex: number;
    private getTransformedData: (data, itemIndex?) => DataSetItem[];
    private inputposition: string;
    private showsearchicon: boolean;

    @ViewChild(SearchComponent) searchComponent: SearchComponent;
    private _datasource: any;
    private _unsubscribeDv: boolean = false;
    private searchkey: string;
    private _debounceUpdateQueryModel: any;
    private limit: number;
    private _classExpr: any;

    // getter setter is added to pass the datasource to searchcomponent.
    get datasource () {
        return this._datasource;
    }

    set datasource(nv) {
        this._datasource = nv;
        this.searchComponent.datasource = nv;
        this._debounceUpdateQueryModel(this.datavalue || this.toBeProcessedDatavalue);
    }

    constructor(
        inj: Injector,
        @Attribute('displayfield.bind') private bindDisplayField,
        @Attribute('displayexpression.bind') private bindDisplayExpr,
        @Attribute('displayimagesrc.bind') private bindDisplayImgSrc,
        @Attribute('datafield.bind') private bindDataField,
        @Attribute('dataset.bind') private bindDataSet,
        @Attribute('chipclass.bind') private bindChipclass
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        // set the showsearchicon as false by default.
        if (!isDefined(this.showsearchicon)) {
            this.showsearchicon = false;
        }

        this.multiple = true;
        this.nextItemIndex = 0; // default chip index

        this._debounceUpdateQueryModel = debounce((val) => {
            this.updateQueryModel(val).then(() => {
                if (this.bindChipclass) {
                    _.forEach(this.chipsList, (item, index) => {
                        this.registerChipItemClass(item, index);
                    });
                }
            });
        }, 150);

        const datasetSubscription = this.dataset$.subscribe(() => {
            this.searchComponent.dataset = this.dataset;
            this.nextItemIndex = this.datasetItems.length;
            this._debounceUpdateQueryModel(this.datavalue || this.toBeProcessedDatavalue);
        });
        this.registerDestroyListener(() => datasetSubscription.unsubscribe());

        const datavalueSubscription = this.datavalue$.subscribe((val: Array<string> | string) => {
            // update queryModel only when parentRef is available.
            if (!this._unsubscribeDv) {
                this.chipsList = [];
                // if the datafield is ALLFILEDS do not fetch the records
                // update the query model with the values we have
                this._debounceUpdateQueryModel(val);
            }
        });
        this.registerDestroyListener(() => datavalueSubscription.unsubscribe());
    }

    ngOnInit() {
        super.ngOnInit();

        this.searchComponent.multiple = true;
        this.searchComponent.binddisplayimagesrc = this.bindDisplayImgSrc;
        this.searchComponent.displayimagesrc = this.displayimagesrc;
        this.searchComponent.binddisplaylabel = this.bindDisplayExpr;
        this.searchComponent.displaylabel = this.displayfield;
        this.searchComponent.datafield = this.bindDataField || this.datafield;
        this.searchComponent.binddataset = this.bindDataSet;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.limit = this.limit;

        this.getTransformedData = (val, isCustom) => {
            return this.searchComponent.getTransformedData([val], this.nextItemIndex++, isCustom);
        };
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.enablereorder) {
            this.configureDnD();
        }
    }

    /**
     * This method returns the evaluated class expression.
     * @param $index index of the chip
     * @param item chip object containing the key, value, label
     * @returns {any} evaluated class expression value
     */
    private registerChipItemClass(item, $index) {
        if (this.bindChipclass) {
            const watchName = `${this.widgetId}_chipItemClass_${$index}`;
            $unwatch(watchName);
            this.registerDestroyListener($watch(this.bindChipclass, this.viewParent, {item, $index}, (nv, ov) => {
                this.applyItemClass(getConditionalClasses(nv, ov), $index);
            }, watchName));
        }
    }

    private applyItemClass(val, index) {
        const chipItem = this.nativeElement.querySelectorAll('.chip-item').item(index);
        $(chipItem).removeClass(val.toRemove).addClass(val.toAdd);
    }

    private removeDuplicates() {
        this.chipsList = getUniqObjsByDataField(this.chipsList, this.datafield, this.displayfield || this.displaylabel);
    }

    // This method updates the queryModel.
    // default call to get the default data can be done only when defaultQuery is true.
    private updateQueryModel(data: any): Promise<void> {
        const promises = [];
        if (!data || !this.datasetItems.length) {
            this.chipsList = [];
            return Promise.resolve();
        }

        // clone the data as the updations on data will change the datavalue.
        let dataValue = _.clone(data);
        const prevChipsList = this.chipsList;
        this.chipsList = [];

        // update the model when model has items more than maxsize
        if (this.maxsize && dataValue.length > this.maxsize) {
            this._modelByValue = dataValue = _.slice(dataValue, 0, this.maxsize);
            data = dataValue;
        }

        const searchQuery: Array<string> = [];

        /**
         * For each value in datavalue,
         * 1. check whether value is in datasetItems, if item is found, addd to the chipsList.
         * 2. else make a default query to the filter and get the record.
         * 3. In step 2, if datavalue is not ALLFIELDS, then make a query. Extract the chipsList from the query response.
         * 4. If there is no response for the value and allowonlyselect is true, remove the value from the datavalue. So that datavalue just contains the valid values.
         * 5. In step 2, if datavalue is ALLFIELDS and value is object, then just prepare the datasetItem from the value.
         * 6. If value is not object and allowonlyselect is false, then create a customModel and replace this value with customModel and prepare datasetItem from this value
         */
        dataValue.forEach((val: any, i: number) => {
            const itemFound = _.find(this.datasetItems, item => {
                return _.isObject(item.value) ? _.isEqual(item.value, val) : _.toString(item.value) === _.toString(val);
            });

            if (itemFound) {
                this.chipsList.push(itemFound);
            } else if (this.datafield !== ALLFIELDS) {
                searchQuery.push(val);
            } else if (this.datafield === ALLFIELDS) {
                let dataObj, isCustom = false;
                if (!_.isObject(val)) {
                    dataObj = this.createCustomDataModel(val);
                    isCustom = true;
                    if (dataObj) {
                        data.splice(i, 1, dataObj);
                    }
                } else {
                    // if custom chips is already generated, val will be object as {'dataField_val': 'entered_val'}
                    // Hence check this val in previous chipList and assign the iscustom flag
                    const prevChipObj = prevChipsList.find(obj => {
                        return _.isEqual(obj.value, val);
                    });
                    if (prevChipObj) {
                        isCustom = prevChipObj.iscustom;
                    }
                }
                dataObj = dataObj || val;

                const transformedData = this.getTransformedData(dataObj, isCustom);
                const chipObj = transformedData[0];
                if (isCustom) {
                    (chipObj as any).iscustom = isCustom;
                }
                this.chipsList.push(chipObj);
            }
        });

        // make default query with all the values and if response for the value is not in datavalue then add a custom chip object.
        if (searchQuery.length) {
            promises.push(this.getDefaultModel(searchQuery, this.nextItemIndex)
                .then(response => {
                    this.chipsList = this.chipsList.concat(response || []);
                    dataValue.forEach((val: any, i: number) => {
                        const isExists = _.find(this.chipsList, (obj) => {
                            return obj.value.toString() === val.toString();
                        });

                        if (!isExists) {
                            if (this.allowonlyselect) {
                                const index = data.indexOf(val);
                                if (index > -1) {
                                    data.splice(index, 1);
                                }
                                return;
                            }
                            const transformedData = this.getTransformedData(val, true);
                            const chipObj = transformedData[0];
                            (chipObj as any).iscustom = true;
                            this.chipsList.push(chipObj);
                        }
                    });
                }));
        }

        // default chip data is adding focus on to the search input. Hence this flag helps not to focus.
        this.resetSearchModel(true);

        return Promise.all(promises).then(() => {
            this._modelByValue = data;
            this.removeDuplicates();
            this.updateMaxSize();
            $appDigest();
        });
    }

    private resetSearchModel(hasFocus?: boolean) {
        this.searchComponent.query = '';
        this.searchComponent.queryModel = '';
        this.searchComponent._modelByValue = undefined;

        this._unsubscribeDv = false;

        // if hasFocus is false then focus the search input.
        if (!hasFocus) {
            this.focusSearchBox();
        }
    }

    // Triggerred when typeahead option is selected by enter keypress.
    private onSelect($event: Event) {
        // when matches are available, select the active match.
        if (this.searchComponent.typeaheadContainer && this.searchComponent.liElements.length) {
            this.searchComponent.typeaheadContainer.selectActiveMatch();
        } else if (!isDefined(this.searchComponent._modelByValue)) {
            if (this.allowonlyselect) {
                // matches are empty set the datavalue to undefined and set the query.
                this.searchComponent.queryModel = this.searchComponent.query = '';
                this.searchComponent._modelByValue = undefined;
            } else if (this.searchComponent.query !== '' && isDefined(this.searchComponent.query)) {
                // Used by chips, if allowonlyselect is false, set the datavalue to query.
                this.searchComponent.queryModel = this.searchComponent.query;
                this.searchComponent._modelByValue = this.searchComponent.query;

                // adds custom chip object to the chipsList.
                this.addItem($event);
            }
        }
    }

    // Add the newItem to the list
    private addItem($event: Event, widget?: SearchComponent) {
        const searchComponent = widget;
        let allowAdd;
        let chipObj;

        if (searchComponent && isDefined(searchComponent.queryModel)) {
            if (!searchComponent.query || !_.trim(searchComponent.query)) {
                return;
            }
            chipObj = searchComponent.queryModel;
        } else {
            if (this.allowonlyselect) {
                return;
            }
            let dataObj;
            if (this.datafield === ALLFIELDS) {
                if (!_.isObject(this.searchComponent.query) && _.trim(this.searchComponent.query)) {
                    dataObj = this.createCustomDataModel(this.searchComponent.query);

                    // return if the custom chip is empty
                    if (!dataObj) {
                        this.resetSearchModel();
                        return;
                    }
                }
            }

            const data = dataObj || _.trim(this.searchComponent.query);
            if (data) {
                const transformedData = this.getTransformedData(data, true);
                chipObj = transformedData[0];
                chipObj.iscustom = true;
            }
        }

        if (!isDefined(chipObj) || chipObj === '') {
            return;
        }

        allowAdd = this.invokeEventCallback('beforeadd', {$event, newItem: chipObj});

        if (isDefined(allowAdd) && !toBoolean(allowAdd)) {
            return;
        }

        if (this.isDuplicate(chipObj)) {
            this.resetSearchModel();
            return;
        }
        this.registerChipItemClass(chipObj, this.chipsList.length);
        this.chipsList.push(chipObj);

        if (!this.datavalue) {
            this._modelByValue = [chipObj.value];
        } else {
            this._modelByValue = [...this._modelByValue, chipObj.value];
        }

        this._unsubscribeDv = true;
        this.invokeOnTouched();
        this.invokeOnChange(this._modelByValue, $event || {}, true);

        this.invokeEventCallback('add', {$event, $item: chipObj});

        this.updateMaxSize();

        // reset input box when item is added.
        this.resetSearchModel();

        // stop the event to not to call the submit event on enter press.
        if ($event && (($event as any).key === 'Enter' || ($event as any).keyCode === 13)) {
            this.stopEvent($event);
        }
    }

    // Prepare datavalue object from a string(junk) value when datafield is allFields.
    private createCustomDataModel(val: string) {
        const key = this.displayfield || (this.datafield !== ALLFIELDS ? this.datafield : undefined);

        if (key) {
            const customObj = {};
            customObj[key] = val;
            return customObj;
        }
    }

    // Check if newItem already exists
    private isDuplicate(item: DataSetItem) {
        if (this.datafield === ALLFIELDS) {
            return _.findIndex(this.chipsList, {value: item.value}) > -1;
        }
        return _.findIndex(this.chipsList, {key: item.key}) > -1;
    }

    // Check if max size is reached
    private updateMaxSize() {
        this.saturate = this.maxsize > 0 && this.chipsList.length === this.maxsize;
    }

    // Makes call to searchComponent to filter the dataSource based on the query.
    protected getDefaultModel(query: Array<string> | string, index?: number) {
        this.nextItemIndex++;
        return this.searchComponent.getDataSource(query, true, index)
            .then((response) => {
                return _.filter(query, queryVal => {
                    _.find(response, {value: queryVal});
                });
            });
    }

    private handleChipClick($event: Event, chip: DataSetItem) {
        if (this.readonly) {
            return;
        }
        ($event.currentTarget as any).focus();
        this.invokeEventCallback('chipclick', {$event, $item: chip});
    }

    private handleChipFocus($event: Event, chip: DataSetItem) {
        if (this.readonly) {
            return;
        }
        (chip as any).active = true;
        this.invokeEventCallback('chipselect', {$event, $item: chip});
    }

    // To avoid form submit on pressing enter key
    private stopEvent($event: Event) {
        $event.stopPropagation();
        $event.preventDefault();
    }

    private onTextDelete($event: Event) {
        if (isAppleProduct) {
            this.onInputClear($event);
        }
    }

    private onInputClear($event: Event) {
        if (!this.chipsList || !this.chipsList.length || this.searchComponent.query) {
            return;
        }
        this.$element.find('li.chip-item > a.app-chip:last').focus();
        this.stopEvent($event);
    }

    private onBackspace($event: Event, $item: DataSetItem, $index: number) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index, true);
    }

    private onDelete($event: Event, $item: DataSetItem, $index: number) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index);
    }

    private onArrowLeft($item?: DataSetItem, $index?: number) {
        if (this.readonly) {
            return;
        }

        // On left arrow click when search input query is empty.
        if (!this.searchComponent.query && !isDefined($index) && !isDefined($item)) {
            this.$element.find('li.chip-item > a.app-chip:last').focus();
            return;
        }

        if ($index > 0) {
            this.$element.find('li.chip-item > a.app-chip').get($index - 1).focus();
        } else {
            this.focusSearchBox();
        }
    }

    private onArrowRight($item?: DataSetItem, $index?: number) {
        if (this.readonly) {
            return;
        }
        // On right arrow click when search input query is empty.
        if (!this.searchComponent.query && !isDefined($index) && !isDefined($item)) {
            this.$element.find('li.chip-item > a.app-chip:first').focus();
            return;
        }

        if ($index < (this.chipsList.length - 1)) {
            this.$element.find('li.chip-item > a.app-chip').get($index + 1).focus();
        } else {
            this.focusSearchBox();
        }
    }

    // focus search box.
    private focusSearchBox() {
        this.$element.find('.app-chip-input > input.app-textbox').focus();
    }

    // Remove the item from list
    private removeItem($event: Event, item: DataSetItem, index: number, canFocus?: boolean) {
        $event.stopPropagation();

        const indexes = _.isArray(index) ? index : [index];
        const focusIndex = _.max(indexes);

        const items = _.reduce(indexes, (result, i) => {
            result.push(this.chipsList[i]);
            return result;
        }, []);

        // prevent deletion if the before-remove event callback returns false
        const allowRemove = this.invokeEventCallback('beforeremove', {$event, $item: items.length === 1 ? items[0] : items});
        if (isDefined(allowRemove) && !toBoolean(allowRemove)) {
            return;
        }

        const prevDatavalue = _.clone(this.datavalue);

        // focus next chip after deletion.
        // if there are no chips in the list focus search box
        setTimeout(() => {
            const chipsLength = this.chipsList.length;
            const $chipsList = this.$element.find('li.chip-item > a.app-chip');

            if (!chipsLength || !canFocus) {
                this.focusSearchBox();
            } else if ((chipsLength - 1) < focusIndex) {
                // if focus index is greater than chips length select last chip
                $chipsList.get(chipsLength - 1).focus();
            } else {
                // manually set the succeeding chip as active if there is a chip next to the current chip.
                this.chipsList[focusIndex].active = true;
                $chipsList.get(focusIndex).focus();
            }
        });

        const pulledItems = _.pullAt(this.chipsList, indexes);

        pulledItems.forEach(datasetItem => {
            this._modelByValue = _.filter(this._modelByValue, val => {
                return !(_.isObject(val) ? _.isEqual(val, datasetItem.value) : _.toString(val) === _.toString(datasetItem.value));
            });
        });

        this._unsubscribeDv = false;

        this.invokeOnChange(this._modelByValue, $event, true);
        this.invokeEventCallback('change', {$event, newVal: this.datavalue, oldVal: prevDatavalue});

        this.updateMaxSize();

        this.invokeEventCallback('remove', {$event, $item: items.length === 1 ? items[0] : items});
    }

    /**
     * Swaps items in an array if provided with indexes.
     * @param data :- array to be swapped
     * @param newIndex :- new index for the element to be placed
     * @param currentIndex :- the current index of the element.
     */
    private swapElementsInArray(data: Array<any>, newIndex: number, currentIndex: number) {
        const draggedItem = _.pullAt(data, currentIndex)[0];
        data.splice(newIndex, 0, draggedItem);
    }

    /**
     * Cancels the reorder by reseting the elements to the original position.
     */
    private resetReorder() {
        this.$element.removeData('oldIndex');
    }

    private onBeforeservicecall(inputData) {
        this.invokeEventCallback('beforeservicecall', {inputData});
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (eventName === 'remove' || eventName === 'beforeremove' || eventName === 'chipselect'
            || eventName === 'chipclick' || eventName === 'add' || eventName === 'reorder' || eventName === 'change') {
            return;
        }

        super.handleEvent(node, eventName, eventCallback, locals);
    }

    // Configures the reordable feature in chips widgets.
    private configureDnD() {
        const options = {
            items: '> li:not(.app-chip-search)',
            placeholder: 'chip-placeholder'
        };

        configureDnD(this.$element, options, this.onReorderStart.bind(this), this.update.bind(this));
    }

    // Triggered on drag start while reordering.
    private onReorderStart(evt: Event, ui: Object) {
        const helper = (ui as any).helper;
        // increasing the width of the dragged item by 1
        helper.width(helper.width() + 1);
        this.$element.data('oldIndex', (ui as any).item.index() - (this.inputposition === 'first' ? 1 : 0));
    }

    // updates the chipsList and datavalue on reorder.
    private update($event: Event, ui: Object) {
        let changedItem,
            newIndex,
            oldIndex;

        // Get the index of the item at position before drag and after the reorder.
        newIndex = (ui as any).item.index() - (this.inputposition === 'first' ? 1 : 0);
        oldIndex = this.$element.data('oldIndex');

        newIndex = this.chipsList.length === newIndex ? newIndex - 1 : newIndex;
        changedItem = {
            oldIndex: oldIndex,
            newIndex: newIndex,
            item: this.chipsList[oldIndex]
        };

        if (newIndex === oldIndex) {
            this.resetReorder();
            return;
        }
        changedItem.item = this.chipsList[oldIndex];

        const allowReorder = this.invokeEventCallback('beforereorder', {$event, $data: this.chipsList, $changedItem: changedItem});

        if (isDefined(allowReorder) && toBoolean(allowReorder) === false) {
            this.resetReorder();
            return;
        }

        // modify the chipsList and datavalue after the reorder.
        this.swapElementsInArray(this.chipsList, newIndex, oldIndex);
        this.swapElementsInArray(this._modelByValue, newIndex, oldIndex);

        changedItem.item = this.chipsList[newIndex];

        this.chipsList = [...this.chipsList];

        this.resetReorder();
        this.invokeEventCallback('reorder', {$event, $data: this.chipsList, $changedItem: changedItem});
    }

    onPropertyChange(key: string, nv: any, ov: any) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'dataoptions') {
            (this.searchComponent as any).dataoptions = nv;
        }
        if (key === 'datafield') {
            this.searchComponent.datafield = this.datafield;
        }
        if (key === 'displayfield') {
            this.searchComponent.displaylabel = this.displayfield;
        }
        if (key === 'displayexpression') {
            this.searchComponent.binddisplaylabel = this.binddisplayexpression ? this.binddisplayexpression : this.displayexpression;
        }
        if (key === 'displayimagesrc') {
            this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        }
        if (key === 'limit') {
            this.searchComponent.limit = this.limit;
        }
        if (key === 'enablereorder') {
            if (this.$element.hasClass('ui-sortable')) {
                this.$element.sortable('option', 'disabled', !nv );
            } else if (nv) {
                this.configureDnD();
            }
        }
        if (key === 'readonly') {
            if (nv) {
                this.$element.addClass('readonly');
            } else {
                this.$element.removeClass('readonly');
            }
        }
        if (key === 'inputposition') {
            const $inputEl = this.$element.find('li.app-chip-search');
            if (nv === 'first') {
                this.$element.prepend($inputEl);
            } else {
                this.$element.append($inputEl);
            }
        }
        if (key === 'autofocus' && nv) {
            // setting the autofocus on the input once after dom is updated
            setTimeout(() => {
                const $chipsList = this.$element.find('.app-chip-input > input.app-textbox');
                if ($chipsList && $chipsList.length) {
                    this.focusSearchBox();
                }
            });
        }
        super.onPropertyChange(key, nv, ov);
    }
}
