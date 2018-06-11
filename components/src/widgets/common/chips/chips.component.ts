import { AfterViewInit, Attribute, Component, Injector, OnInit, ViewChild } from '@angular/core';

import { $appDigest, isAppleProduct, isDefined, toBoolean } from '@wm/core';

import { registerProps } from './chips.props';
import { styler } from '../../framework/styler';
import { SearchComponent } from '../search/search.component';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';
import { DataSetItem, extractDataAsArray, getUniqObjsByDataField } from '../../../utils/form-utils';
import { ALLFIELDS } from '../../../utils/data-utils';
import { IWidgetConfig } from '../../framework/types';

declare const _;

const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-chips',
    hostClass: 'app-chips nav nav-pills list-inline'
};

registerProps();

@Component({
    selector: '[wmChips]',
    templateUrl: './chips.component.html'
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

    @ViewChild(SearchComponent) searchComponent: SearchComponent;

    constructor(
        inj: Injector,
        @Attribute('displayfield.bind') private bindDisplayField,
        @Attribute('displayexpression.bind') private bindDisplayExpr,
        @Attribute('displayimagesrc.bind') private bindDisplayImgSrc,
        @Attribute('datafield.bind') private bindDataField
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);

        this.dataset$.subscribe(() => this.nextItemIndex = this.datasetItems.length);
    }

    ngOnInit() {
        super.ngOnInit();

        this.searchComponent.multiple = true;
        this.searchComponent.binddisplayimagesrc = this.bindDisplayImgSrc;
        this.searchComponent.displayimagesrc = this.displayimagesrc;
        this.searchComponent.binddisplayexpression = this.bindDisplayExpr;
        this.searchComponent.displaylabel = this.displayfield;

        this.searchComponent.updateQueryModel = _.debounce(this.updateQueryModel.bind(this), 50);
        this.getTransformedData = this.searchComponent.getTransformedData;
    }

    private removeDuplicates() {
        this.chipsList = getUniqObjsByDataField(this.chipsList, this.datafield, this.displayfield || this.displaylabel);
    }

    // This method updates the queryModel.
    private updateQueryModel(data, nextItemIndex?) {
        if (!this.datasetItems.length || !data) {
            return;
        }
        // Todo: [bandhavya] verify after this change.
        if (!_.isArray(data)) {
            data = extractDataAsArray(data);
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
        this.searchComponent.query = undefined;
    }

    // Add the newItem to the list
    private addItem($event, widget?, selectedValue?, selectedItem?) {
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
            this.datavalue = [chipObj.value];
        } else {
            this.datavalue.push(chipObj.value);
        }
        this.invokeOnTouched();
        this.invokeOnChange(this.datavalue);

        this.invokeEventCallback('add', {$event, $item: chipObj});

        this.updateMaxSize();

        // reset input box when item is added.
        this.resetSearchModel();
    }

    // Prepare datavalue object from a string(junk) value when datafield is allFields.
    private createCustomDataModel(val) {
        const key = this.displayfield || (this.datafield !== ALLFIELDS ? this.datafield : undefined);

        if (key) {
            const customObj = {iscustom: true};
            customObj[key] = val;
            return customObj;
        }
    }

    // Check if newItem already exists
    private isDuplicate(item) {
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
    protected getDefaultModel(query) {
        return this.searchComponent.getDataSource(query, true);
    }

    private handleChipClick($event, chip) {
        if (this.readonly) {
            return;
        }
        $event.currentTarget.focus();
        this.invokeEventCallback('chipclick', {$event, $item: chip});
    }

    private handleChipFocus($event, chip) {
        if (this.readonly) {
            return;
        }
        chip.active = true;
        this.invokeEventCallback('chipselect', {$event, $item: chip});
        // $appDigest();
    }

    // To avoid form submit on pressing enter key
    private stopEvent($event) {
        $event.stopPropagation();
        $event.preventDefault();
    }

    private onEnter($event) {
        if (_.trim(this.searchComponent.query)) {
            this.addItem($event);
            this.stopEvent($event);
        }
    }

    private onTextDelete($event) {
        if (isAppleProduct) {
            this.onInputClear($event);
        }
    }

    private onInputClear($event) {
        if (!this.chipsList || !this.chipsList.length || this.searchComponent.query) {
            return;
        }
        this.$element.find('li.chip-item > a.app-chip:last').focus();
        this.stopEvent($event);
    }

    private onBackspace($event, $item: DataSetItem, $index) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index, true);
    }

    private onDelete($event, $item: DataSetItem, $index) {
        if (this.readonly) {
            return;
        }
        this.removeItem($event, $item, $index, true);
    }

    private onArrowLeft($item?: DataSetItem, $index?) {
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

    private onArrowRight($item?: DataSetItem, $index?) {
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
    private removeItem($event, item: DataSetItem, index: number, canFocus: boolean = true) {
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
        setTimeout(() => {
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
        });

        this.updateMaxSize();

        this.invokeEventCallback('remove', {$event, widget: this, item: items.length === 1 ? items[0] : items});
    }

    /**
     * Swaps items in an array if provided with indexes.
     * @param data :- array to be swapped
     * @param newIndex :- new index for the element to be placed
     * @param currentIndex :- the current index of the element.
     */
    private swapElementsInArray(data, newIndex, currentIndex) {
        const draggedItem = _.pullAt(data, currentIndex)[0];
        data.splice(newIndex, 0, draggedItem);
    }

    /**
     * Cancels the reorder by reseting the elements to the original position.
     * @param $ulEle :- The set of the elements that are reordable.
     * @param $dragEl :- The dragged element.
     */
    private resetReorder($ulEle, $dragEl) {
        // cancel the sort even. as the data model is changed Angular will render the list.
        $ulEle.sortable('cancel');
        $dragEl.removeData('oldIndex');
    }

    // Configures the reordable feature in chips widgets.

    private configureDnD() {
        // Todo: check the dnd functionality.
    }

    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        if (eventName === 'remove' || eventName === 'beforeremove' || eventName === 'chipselect'
            || eventName === 'chipclick' || eventName === 'add') {
            return;
        }

        super.handleEvent(node, eventName, eventCallback, locals);
    }

    // Define the property change handler. This function will be triggered when there is a change in the widget property
    onPropertyChange(key, nv, ov) {
        super.onPropertyChange(key, nv, ov);
        switch (key) {
            case 'enablereorder':
                const $el = this.$element;
                const isSortable = $el.hasClass('ui-sortable');
                if (this.enablereorder && !this.readonly) {
                    if (isSortable) {
                        $el.sortable('enable');
                    } else {
                        this.configureDnD();
                    }
                } else if (isSortable) {
                    $el.sortable('disable');
                }
        }
    }
}
