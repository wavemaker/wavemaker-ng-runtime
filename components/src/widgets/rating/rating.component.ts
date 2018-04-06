import { ChangeDetectorRef, Component, ElementRef, forwardRef, Injector, OnInit } from '@angular/core';
import { $appDigest, generateGUId, getClonedObject, setCSS } from '@wm/utils';
import { styler } from '../../utils/styler';
import { getControlValueAccessor, getEvaluatedData, getObjValueByKey } from '../../utils/widget-utils';
import { registerProps } from './rating.props';
import { BaseFormComponent } from '../base/base-form.component';

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
    providers: [getControlValueAccessor(RatingComponent)]
})
export class RatingComponent extends BaseFormComponent implements OnInit {
    _model_;
    /**
     * A placeholder is text to show in the editor when there is no value.
     * This is a useful alternative to a caption if you are constrained in space and asking for something simple of the user.
     */
    caption: string;
    /**
     * This property sets the dataValue to be returned by the rating widget when the data is populated using the dataSet property.
     * */
    datafield: string;
    /**
     * This property sets the caption to show in the rating widget when the data is populated using the dataSet property.
     * */
    displayfield: string;
    /**
     *  This is an advanced property that gives more control over what is displayed in the  rating widget's caption.
     *  A Display Expression uses a Javascript expression to format exactly what is shown.
     *  This property is bindable.
     *  For readonly mode, If dataset is null then the caption can be bound directly to display expression.
     * */
    displayexpression: string;
    /**
     * This property will show the captions for the component if set to true. Default value is true.
     */
    showcaptions: boolean;
    /**
     * This property accepts the options to create the rating component from a wavemaker studio variable which is of datatype entry.
     */
    dataset: any;
    /**
     * Maximum value (number of stars) of Rating.It should be less than or equal to 10.
     */
    maxvalue;

    datavalue;

    private selectedRatingValue;

    private ratingsWidth;

    private range;

    private _id;

    private ratingname;

    private selectOptions: any[] = [];

    /*
     * gets the key to map the select options out of dataSet
     * if only one key is there in the option object it returns that key
     * else the default key to be looked is 'dataValue'
     */
    private getKey(optionObject) {
        const keys = Object.keys(optionObject);
        /* if only one key, return it (can be anything other than 'dataValue' as well */
        if (keys.length === 1) {
            return keys[0];
        }

        /* return dataValue to be the default key */
        return 'dataValue';
    }
    /* gets the item whose value is equal to rating value */
    private getLabel(options, i) {
        return _.find(options, (item) => {
            return item.index === i;
        });
    }
    /* returns the rating widget dataset containing the value and label */
    private prepareRatingDataset(maxvalue, options?) {
        const range = [];
        let i,
            maxValue,
            result;
        maxvalue = parseInt(maxvalue, 10);
        maxValue = maxvalue > MAX_RATING ? MAX_RATING : maxvalue;
        for (i = maxValue || DEFAULT_RATING; i > 0; i--) {
            result = this.getLabel(options, i - 1);
            if (result) {
                range.push({'key': result.key, 'value': i, 'label': result.value});
            } else {
                range.push({'value': i});
            }
        }
        return range;
    }

    /*
   * parse dataSet to filter the options based on the datafield, displayfield & displayexpression
   */
    private parseDataSet(dataSet) {
        /*store parsed data in 'data'*/
        const dataField = this.datafield;
        let data = dataSet;

        /*if filter dataSet if dataField is selected other than 'All Fields'*/
        if (dataField) {
            data = {};
            // Widget selected item dataset will be object instead of array.
            if (_.isObject(dataSet) && !_.isArray(dataSet)) {
                data[getObjValueByKey(dataSet, dataField)] = getEvaluatedData(dataSet, {displayfield: this.displayfield, displayexpression: this.displayexpression});
            } else {
                _.forEach(dataSet, (option) => {
                    data[getObjValueByKey(option, dataField)] = getEvaluatedData(option, {displayfield: this.displayfield, displayexpression: this.displayexpression});
                });
            }
        }
        return data;
    }

    /* This function returns the caption for the hovered item or the selected datavalue */
    private getCaption(selecteditem?) {
        const captionItem = _.find(this.range, (item) => {
            /* item value can be string / integer*/
            return item.key == (selecteditem ? selecteditem.value : this.datavalue);
        });
        if (captionItem && captionItem.hasOwnProperty('label')) {
            return captionItem.label;
        }
        if (!this.dataset && this.displayexpression) { /* set the caption as displayexpression value if there is no dataset bound */
            return this.displayexpression;
        }
        return '';
    }
    /*function to create the options for the rating widget, based on the different configurations that can be provided.
   Options can be provided as
   * 1. comma separated string, which is captured in the options property of the scope
   * 2. application scope variable which is assigned to the dataSet attribute of the rating widget from the studio.
   * 3. a wm-studio-variable which is bound to the widget's dataSet property.*/
    private createRatingOptions(dataset) {
        /* check for dataSet*/
        if (!dataset) {
            this.range = [];
            this.caption = '';
            return;
        }
        /*assign dataSet according to liveVariable or other variable*/
        dataset = dataset.hasOwnProperty('data') ? dataset.data : dataset;
        let key;
        /*checking if dataSet is present and it is not a string.*/
        if (dataset && dataset.dataValue !== '') {
            /*initializing select options*/
            this.selectOptions = [];
            /*check if dataset is array*/
            if (_.isArray(dataset)) {
                /*filter the dataSet based on datafield & displayfield*/
                dataset = this.parseDataSet(dataset);
                /* if dataSet is an array of objects, convert it to object */
                if (_.isObject(dataset[0])) {
                    key = this.getKey(dataset[0]);
                    /* if dataSet is an array, convert it to object */
                    _.forEach(dataset, (option, index) => {
                        this.selectOptions.push({index, 'key': key, 'value': option.name || option[key]});
                    });
                } else if (_.isArray(dataset)) {
                    /* if dataSet is an array, convert it to object */
                    _.forEach(dataset, (option, index) => {
                        this.selectOptions.push({index, 'key': index + 1, 'value': option});
                    });
                } else if (_.isObject(dataset)) {
                    let index = 0;
                    _.forEach(dataset, (val, prop) => {
                        this.selectOptions.push({index: index++, 'key': prop, 'value': val});
                    });
                }
            } else if (_.isObject(dataset)) {
                /*filter the dataSet based on datafield & displayfield*/
                dataset = this.parseDataSet(dataset);
                let index = 0;
                _.forEach(dataset, (val, prop) => {
                    this.selectOptions.push({index: index++, key: prop, value: val});
                });
            } else {
                /* if dataSet is an string, convert it to object */
                if (_.isString(dataset)) {
                    _.forEach(dataset.split(','), (opt, index) => {
                        opt = opt.trim();
                        this.selectOptions.push({index, key: index + 1, value: opt});
                    });
                } else {
                    this.selectOptions.push({'index': 0, key: dataset, value: dataset});
                }
            }
            this.range = this.prepareRatingDataset(this.selectOptions.length || this.maxvalue, this.selectOptions);
            if (this.datavalue) {
                this.assignDatavalue();
            }
            this.caption = this.getCaption();
        }
    }

    assignDatavalue(rate?) {
        let _datavalue;
        this.selectedRatingValue = rate ? rate.value : this.selectedRatingValue;
        if (this.selectOptions && this.selectOptions.length) {
            const selectedItem = _.find(this.selectOptions, (rating) => {
                return rating.index === this.selectedRatingValue - 1;
            });
            _datavalue = selectedItem && selectedItem.key;
        } else {
            _datavalue = this.selectedRatingValue;
        }
        this.datavalue = this._model_ = _datavalue;
        this.invokeOnChange(this._model_);
        this.invokeOnTouched();
    }

    getActiveElements($event, rate) {
        this.assignDatavalue(rate);
        /* support if the caption is binded in the old projects for backward compatibility*/
        if (!this.showcaptions) {
            this.caption = this.getCaption();
        }
        $appDigest();
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        this._id = generateGUId();
        styler(this.$element, this);
    }

    onDatasetChange() {
        const dataset = getClonedObject(this.dataset);
        if (!_.isUndefined(dataset) && dataset !== null) {
            // Get variable and properties map only on binddataset change
            this.createRatingOptions(dataset);
        }
        $appDigest();
    }

    onDatavalueChange() {
        if (this.dataset && !_.isEmpty(this.selectOptions) && this.datavalue) {
            const selectedValue = _.find(this.selectOptions, (option) => {
                return option.key == this.datavalue;
            });
            this.selectedRatingValue = selectedValue ? selectedValue.index + 1 : 0;
            this.caption = this.getCaption();
        } else if (!this.dataset && _.isEmpty(this.selectOptions)) {
            this.selectedRatingValue = this.datavalue;
        }
        $appDigest();
    }

    calculateRatingsWidth() {
        const selectedRating = parseFloat(this.selectedRatingValue),
            starWidth = 0.925,
            maxValue = parseInt(this.selectOptions.length || this.maxvalue, 10) || DEFAULT_RATING;

        setCSS(<HTMLElement>this.$element.querySelector('.ratings-container'), 'width', (starWidth * maxValue) + 'em');

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

    onPropertyChange(key, newVal, oldVal?) {
        switch (key) {
            case 'dataset':
            case 'displayfield':
            case 'datafield':
                this.onDatasetChange();
                break;
            case 'datavalue':
                this._model_ = newVal;
                this.onDatavalueChange();
                break;
            case 'readonly':
                if (newVal) {
                    this.ratingsWidth = this.calculateRatingsWidth();
                }
                break;
            case 'maxvalue':
                if (!this.dataset && !oldVal) {
                    this.range = this.prepareRatingDataset(newVal, this.dataset);
                    this.caption = this.getCaption();
                }
                this.ratingname = 'ratings-id';
                this.ratingsWidth = this.calculateRatingsWidth();
                break;
        }
    }

    onMouseleave($event, rate) {
        this.caption = this.getCaption();
        this.$digest();
    }

    onMouseenter($event, rate) {
        this.caption = this.getCaption(rate);
        this.$digest();
    }

    ngOnInit() {
        super.ngOnInit();
        if (!this.dataset) {
            this.range = this.prepareRatingDataset(this.maxvalue);
            this.caption = this.getCaption();
        }
    }

    writeValue(value) {
        this.datavalue = value;
        this.onPropertyChange('datavalue', value);
    }
}
