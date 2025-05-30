import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import {Attribute, Component, Inject, Injector, Optional} from '@angular/core';

import {findValueOf, isDefined} from '@wm/core';
import {IWidgetConfig, provideAsWidgetRef, StylableComponent, styler} from '@wm/components/base';

import {registerProps} from './progress-bar.props';
import {getDecimalCount, isPercentageValue} from '../utils';
import {debounce, isArray} from "lodash-es";

const DEFAULT_CLS = 'progress app-progress';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-progress-bar', hostClass: DEFAULT_CLS};

// map of progress-bar type and classes
export const TYPE_CLASS_MAP = {
    'default': '',
    'default-striped': 'progress-bar-striped',
    'success': 'progress-bar-success',
    'success-striped': 'progress-bar-success progress-bar-striped',
    'info': 'progress-bar-info',
    'info-striped': 'progress-bar-info progress-bar-striped',
    'warning': 'progress-bar-warning',
    'warning-striped': 'progress-bar-warning progress-bar-striped',
    'danger': 'progress-bar-danger',
    'danger-striped': 'progress-bar-danger progress-bar-striped'
};


// interface for the progress-bar info
interface IProgressInfo {
    cls: string;
    progressBarWidth: string;
    displayValue: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule],
    selector: '[wmProgressBar]',
    templateUrl: './progress-bar.component.html',
    providers: [
        provideAsWidgetRef(ProgressBarComponent)
    ]
})
export class ProgressBarComponent extends StylableComponent {
    static initializeProps = registerProps();

    public displayformat: string;
    public datavalue: string;
    public minvalue: number;
    public maxvalue: number;
    public type: string;
    public dataset: Array<any>;
    public hint: string;
    public arialabel: string;
    public tabindex: string;

    private _prepareData: Function;
    private readonly hasDataset: boolean;

    // progress-bar data, ngFor in the template iterates on this
    public data: Array<IProgressInfo> = [{
        cls: TYPE_CLASS_MAP.default,
        progressBarWidth: '0%',
        displayValue: '0'
    }];

    constructor(inj: Injector, @Attribute('dataset') dataset: string, @Attribute('dataset.bind') boundDataset: string, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        // flag which determines whether dataset is provided or not
        this.hasDataset = !!(dataset || boundDataset);

        styler(this.nativeElement, this);

        this._prepareData = debounce(() => this.prepareData(), 50);
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
        if (this.dataset && isArray(this.dataset) && this.type && this.datavalue) {
            this.data = this.dataset.map((datum): IProgressInfo => {
                const val: string = findValueOf(datum, this.datavalue).toString();
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
                        const val = ((+this.datavalue - +this.minvalue) * 100) / denominator + '%';
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
        } else if (key === 'tabindex') {
            return;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
