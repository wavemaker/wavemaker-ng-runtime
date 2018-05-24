import { Component, Injector, OnInit } from '@angular/core';

import { generateGUId, setCSS } from '@wm/core';
import { styler } from '../../framework/styler';
import { provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './rating.props';
import { DatasetAwareFormComponent } from '../base/dataset-aware-form.component';

declare const _;

registerProps();

const DEFAULT_CLS = 'app-ratings';
const WIDGET_CONFIG = {widgetType: 'wm-rating', hostClass: DEFAULT_CLS};

const MAX_RATING = 10;
const DEFAULT_RATING = 5;

/**
 * The rating component
 * Rating component allow users to input ratings as data.
 * Example of usage:
 * <example-url>http://localhost:4200/rating</example-url>
 *
 */
@Component({
    selector: '[wmRating]',
    templateUrl: './rating.component.html',
    providers: [
        provideAsNgValueAccessor(RatingComponent),
        provideAsWidgetRef(RatingComponent)
    ]
})
export class RatingComponent extends DatasetAwareFormComponent implements OnInit {
    caption: string;
    showcaptions: boolean;
    maxvalue;

    private selectedRatingValue;
    private ratingsWidth;
    private ratingItems;
    private _id;
    private oldValue: any;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        this._id = generateGUId();
        styler(this.nativeElement, this);

        // prepare the rating options on dataset ready.
        this.listenToDataset.subscribe(() => {
            this.prepareRatingDataset();
            this.onDatavalueChange(this.datavalue);
        });

        // listen to changes in datavalue.
        this.listenToDatavalue.subscribe(() => this.onDatavalueChange(this.datavalue));
    }

    ngOnInit() {
        super.ngOnInit();
    }

    writeValue(value) {
        this.datavalue = value;
        this.onPropertyChange('datavalue', value);
    }

    // This function returns the rating widget dataset containing the index, value and label
    private prepareRatingDataset() {
        if (!this.datasetItems.length) {
            this.ratingItems = [];
            this.caption = '';
        }

        const ratingItems = [];
        let data = this.datasetItems;
        const maxvalue = parseInt(this.maxvalue || this.datasetItems.length, 10);
        const maxValue = (maxvalue > MAX_RATING ? MAX_RATING : maxvalue) || DEFAULT_RATING;

        /**
         * 1. If datasetItems.length is more than maxValue (i.e. 10 ratings) then just extract maxValue of items from datasetItems.
         * 2. If datasetItems are not available then prepare ratings value depending on maxvalue. eg: 1,2,3 .. upto maxvalue
         * 3. If datasetItem at the given index (i - 1) is available then add to ratingItems otherwise prepare object with index and label.
         */
        if (data.length && data.length > maxValue) {
            data = _.slice(data, 0, maxValue);
        }

        for (let i = maxValue; i > 0; i--) {
            if (!data.length) {
                ratingItems.push({'index': i, 'label': i});
            } else {
                const ratingOption = data[i - 1];

                if (ratingOption) {
                    ratingItems.push(ratingOption);
                } else {
                    ratingItems.push({'index': i, 'label': i});
                }
            }
        }

        this.ratingItems = ratingItems;
    }

    onRatingClick($event, rate) {
        this.selectedRatingValue = rate.index;
        this.proxyModel = rate.key;

        // support if the caption is binded in the old projects for backward compatibility
        if (!this.showcaptions) {
            this.caption = rate.label;
        }

        this.invokeOnTouched();
        this.invokeEventCallback('change', {$event: $event, newVal: this.datavalue, oldVal: this.oldValue});
        this.oldValue = this.datavalue;
    }

    // Update the selected flag on datasetItems and assign the ratingValue.
    /**
     * On datavalue change, update the caption, selectedRatingValue.
     * 1. if datasetItems contain the selected item (check the selected flag on item), find the index of selected item.
     * 2. if not, just check if the datavalue is provided as the index on the item.
     *
     * @param dataVal datavalue
     */
    onDatavalueChange(dataVal) {
        if (!_.isEmpty(this.datasetItems)) {
            let selectedItem = _.find(this.datasetItems, {'selected': true});

            if (!selectedItem && !_.isUndefined(dataVal)) {
                selectedItem = _.find(this.datasetItems, function (item) {
                    return _.toString(item.index) === dataVal;
                });
            }

            if (selectedItem) {
                selectedItem.selected = true;
            } else {
                return;
            }

            this.selectedRatingValue = selectedItem ? selectedItem.index : 0;
            if (selectedItem) {
                this.caption = selectedItem.label;
            }
        } else {
            this.selectedRatingValue = 0;
        }
    }

    calculateRatingsWidth() {
        const selectedRating = parseFloat(this.selectedRatingValue),
            starWidth = 0.925,
            maxValue = parseInt(this.datasetItems.length || this.maxvalue, 10) || DEFAULT_RATING;

        setCSS(
            this.nativeElement.querySelector('.ratings-container') as HTMLElement,
            'width',
            (starWidth * maxValue) + 'em'
        );

        if (this.datavalue === undefined || this.datavalue === '' || this.datavalue === null) {
            return 0;
        }
        if (selectedRating <= maxValue && selectedRating >= 0) {
            return selectedRating * starWidth + 'em';
        }
        if (selectedRating > maxValue) {
            return maxValue * starWidth + 'em';
        }
    }

    onPropertyChange(key, nv, ov?) {
        super.onPropertyChange(key, nv, ov);
        switch (key) {
            case 'readonly':
                if (nv) {
                    this.ratingsWidth = this.calculateRatingsWidth();
                }
                break;
            case 'maxvalue':
                this.prepareRatingDataset();
                break;
        }
    }

    onMouseleave($event, rate) {
        this.caption = rate.label;
    }

    onMouseenter($event, rate) {
        this.caption = rate.label;
    }
}
