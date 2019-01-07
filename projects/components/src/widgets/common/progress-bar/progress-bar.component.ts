import { Attribute, Component, Injector } from '@angular/core';

import { findValueOf, isDefined, isString } from '@wm/core';

import { IWidgetConfig } from '../../framework/types';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './progress-bar.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { getDecimalCount, isPercentageValue, TYPE_CLASS_MAP } from './progress-utils';

registerProps();

declare const _;

const DEFAULT_CLS = 'progress app-progress';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-progress-bar', hostClass: DEFAULT_CLS};

// interface for the progress-bar info
interface IProgressInfo {
    cls: string;
    progressBarWidth: string;
    displayValue: string;
}

@Component({
    selector: '[wmProgressBar]',
    templateUrl: './progress-bar.component.html',
    providers: [
        provideAsWidgetRef(ProgressBarComponent)
    ]
})
export class ProgressBarComponent extends StylableComponent {

    public displayformat: string;
    public datavalue: string;
    public minvalue: number;
    public maxvalue: number;
    public type: string;
    public dataset: Array<any>;

    private _prepareData: Function;
    private readonly hasDataset: boolean;

    // progress-bar data, ngFor in the template iterates on this
    private data: Array<IProgressInfo> = [{
        cls: TYPE_CLASS_MAP.default,
        progressBarWidth: '0%',
        displayValue: '0'
    }];

    constructor(inj: Injector, @Attribute('dataset') dataset: string, @Attribute('dataset.bind') boundDataset: string) {
        super(inj, WIDGET_CONFIG);

        // flag which determines whether dataset is provided or not
        this.hasDataset = !!(dataset || boundDataset);

        styler(this.nativeElement, this);

        this._prepareData = _.debounce(() => this.prepareData(), 50);
    }

    // update the proper classes when there is a change in type
    protected onTypeChange() {
        if (!this.hasDataset) {
            if (this.data[0]) {
                this.data[0].cls = TYPE_CLASS_MAP[this.type];
            }
        }
    }

    // returns the formatted display value based on the provided displayformat
    protected getFormattedDisplayVal(val: string | number): string {
        const format = this.displayformat || '9';

        val = parseFloat('' + val);
        val = (val.toFixed(getDecimalCount(format)));

        if (format && format.includes('%')) {
            val = `${val}%`;
        }
        return val;
    }

    protected prepareData() {
        // when the dataset is provided, iterate over the dataset to set the proper values in the data
        if (this.dataset && _.isArray(this.dataset) && this.type && this.datavalue) {
            this.data = this.dataset.map((datum): IProgressInfo => {
                const val: string = findValueOf(datum, this.datavalue);
                let percentVal = val;
                if (val && !val.includes('%')) {
                    percentVal = `${val}%`;
                }
                return {
                    cls: TYPE_CLASS_MAP[findValueOf(datum, this.type)],
                    progressBarWidth: percentVal,
                    displayValue: this.getFormattedDisplayVal(val)
                };
            });
        } else {
            // if the dataset is not provided, update the values in the default data
            let width: string | number = 0;
            let displayVal: string | number = 0;
            if (this.datavalue) {
                if (isPercentageValue(this.datavalue)) {
                    const val = (this.datavalue || '0%');
                    width = displayVal = val;
                } else {
                    if (isDefined(this.datavalue)) {
                        const denominator = (+this.maxvalue - +this.minvalue) || 1;
                        const val = (+this.datavalue * 100) / denominator + '%';
                        width = displayVal = val;
                    }
                }
            }
            this.data[0].displayValue = this.getFormattedDisplayVal(displayVal as string);
            this.data[0].progressBarWidth = width as string;
            this.data[0].cls = TYPE_CLASS_MAP[this.type];

        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'type') {
            this.onTypeChange();
        } else if (key === 'minvalue' || key === 'maxvalue' || key === 'datavalue' || key === 'dataset' || key === 'displayformat') {
            this._prepareData();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
