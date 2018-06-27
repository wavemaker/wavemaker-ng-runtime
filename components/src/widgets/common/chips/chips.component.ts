import { AfterViewInit, Attribute, ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';

import { $appDigest, isAppleProduct, isDefined, toBoolean } from '@wm/core';

import { registerProps } from './chips.props';
import { styler } from '../../framework/styler';
import { SearchComponent } from '../search/search.component';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { configureDnD, DataSetItem, getUniqObjsByDataField } from '../../../utils/form-utils';
import { ALLFIELDS } from '../../../utils/data-utils';
import { IWidgetConfig } from '../../framework/types';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';

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

    // When datavalue is not available check value in "toBeProcessedDatavalue" property.
    set toBeProcessedDatavalue(val) {
        this.searchComponent.toBeProcessedDatavalue = val;
    }

    constructor(
        inj: Injector,
        private cdRef: ChangeDetectorRef,
        @Attribute('displayfield.bind') private bindDisplayField,
        @Attribute('displayexpression.bind') private bindDisplayExpr,
        @Attribute('displayimagesrc.bind') private bindDisplayImgSrc,
        @Attribute('datafield.bind') private bindDataField,
        @Attribute('dataset.bind') private bindDataSet
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        // set the showsearchicon as false by default.
        if (_.isUndefined(this.showsearchicon)) {
            this.showsearchicon = false;
        }

        this.multiple = true;
        this.dataset$.subscribe(() => this.nextItemIndex = this.datasetItems.length);
    }

    ngOnInit() {
        super.ngOnInit();

        this.searchComponent.binddisplayimagesrc = this.bindDisplayImgSrc;
        this.searchComponent.displayimagesrc = this.displayimagesrc;
        this.searchComponent.binddisplayexpression = this.bindDisplayExpr;
        this.searchComponent.displaylabel = this.displayfield;
        this.searchComponent.datafield = this.bindDataField;
        this.searchComponent.binddataset = this.bindDataSet;
        this.searchComponent.dataset = this.dataset;

        this.searchComponent.updateQueryModel = _.debounce(this.updateQueryModel.bind(this), 50);
        this.getTransformedData = this.searchComponent.getTransformedData;
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        if (this.enablereorder) {
            this.configureDnD();
        }
    }

    private removeDuplicates() {
        this.chipsList = getUniqObjsByDataField(this.chipsList, this.datafield, this.displayfield || this.displaylabel);
    }

    // This method updates the queryModel.
    private updateQueryModel(data: any) {
        if (!this.datasetItems.length || !data) {
            return;
        }

        // clone the data as the updations on data will change the datavalue.
        const dataValue = _.clone(data);

        this.chipsList = [];

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
                this.getDefaultModel(val)
                    .then(response => {
                        if (response.length) {
                            this.chipsList = this.chipsList.concat(response);
                        } else if (this.allowonlyselect) {
                            data.splice(i, 1);
                        } else {
                            this.nextItemIndex++;
                            const transformedData = this.getTransformedData([dataValue[i]], this.nextItemIndex);
                            this.chipsList.push(transformedData[0]);
                        }
                    });
            } else if (this.datafield === ALLFIELDS) {
                let dataObj;
                if (!_.isObject(val)) {
                    dataObj = this.createCustomDataModel(val);
                    if (dataObj) {
                        data.splice(i, 1, dataObj);
                    }
                }

                this.nextItemIndex++;

                dataObj = dataObj || val;

                const transformedData = this.getTransformedData([dataObj], this.nextItemIndex);
                this.chipsList.push(transformedData[0]);
            }
        });

        this.removeDuplicates();
        this.resetSearchModel();
        this.updateMaxSize();
        $appDigest();
    }

    private resetSearchModel() {
        this.searchComponent.query = '';

        this.focusSearchBox();
    }

    // Add the newItem to the list
    private addItem($event: Event, widget?: SearchComponent) {
        const searchComponent = widget;
        let allowAdd;
        let chipObj;

        if (searchComponent && isDefined(searchComponent.queryModel)) {
            chipObj = searchComponent.queryModel;
        } else {
            if (this.allowonlyselect) {
                return;
            }
            let dataObj;
            if (this.datafield === ALLFIELDS) {
                if (!_.isObject(this.searchComponent.query)) {
                    dataObj = this.createCustomDataModel(this.searchComponent.query);
                }
            }

            this.nextItemIndex++;
            const data = dataObj || this.searchComponent.query;
            chipObj = this.getTransformedData([data], this.nextItemIndex)[0];
        }

        allowAdd = this.invokeEventCallback('beforeadd', {$event, newItem: chipObj});

        if (isDefined(allowAdd) && !toBoolean(allowAdd)) {
            return;
        }

        if (this.isDuplicate(chipObj)) {
            this.resetSearchModel();
            return;
        }
        this.chipsList.push(chipObj);

        if (!this.datavalue) {
            this._modelByValue = [chipObj.value];
        } else {
            this._modelByValue = [...this._modelByValue, chipObj.value];
        }
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);

        this.invokeEventCallback('add', {$event, $item: chipObj});

        this.updateMaxSize();

        // reset input box when item is added.
        this.resetSearchModel();
    }

    // Prepare datavalue object from a string(junk) value when datafield is allFields.
    private createCustomDataModel(val: string) {
        const key = this.displayfield || (this.datafield !== ALLFIELDS ? this.datafield : undefined);

        if (key) {
            const customObj = {iscustom: true};
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
    protected getDefaultModel(query: string) {
        return this.searchComponent.getDataSource(query, true);
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
        if (!this.searchComponent.query && _.isUndefined($index) && _.isUndefined($item)) {
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
        if (!this.searchComponent.query && _.isUndefined($index) && _.isUndefined($item)) {
            this.$element.find('li.chip-item > a.app-chip:first').focus();
            return;
        }

        if ($index < (this.chipsList.length - 1)) {
            this.$element.find('li.chip-item > a.app-chip').get($index + 1).focus();
        } else {
            this.focusSearchBox();
        }
    }

    /**
     * focus search box.
     */
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
        const allowRemove = this.invokeEventCallback('beforeremove', {$event, item: items.length === 1 ? items[0] : items});
        if (isDefined(allowRemove) && !toBoolean(allowRemove)) {
            return;
        }

        const pulledItems = _.pullAt(this.chipsList, indexes);

        pulledItems.forEach(datasetItem => {
            _.remove(this.datavalue, val => {
                return _.isObject(val) ? _.isEqual(val, datasetItem.value) : _.toString(val) === _.toString(datasetItem.value);
            });
        });

        // focus next chip after deletion.
        const chipsLength = this.chipsList.length;
        const $chipsList = this.$element.find('li.chip-item > a.app-chip');

        // if there are no chips in the list focus search box
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

        this.updateMaxSize();

        this.invokeEventCallback('remove', {$event, widget: this, item: items.length === 1 ? items[0] : items});
    }

    // Adds the custom chip when datavalue is undefined.
    public notifyEmptyValues($event: Event) {
        this.addItem($event);
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

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (eventName === 'remove' || eventName === 'beforeremove' || eventName === 'chipselect'
            || eventName === 'chipclick' || eventName === 'add' || eventName === 'reorder') {
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
        this.cdRef.detectChanges();

        this.resetReorder();
        this.invokeEventCallback('reorder', {$event, $data: this.chipsList, $changedItem: changedItem});
    }

    onPropertyChange(key: string, nv: any, ov: any) {
        if (key === 'tabindex') {
            return;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
