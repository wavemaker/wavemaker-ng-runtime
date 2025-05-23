import { WmComponentsModule } from "@wm/components/base";
import { NgCircleProgressModule } from 'ng-circle-progress';
import {AfterViewInit, Component, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {CircleProgressComponent, CircleProgressOptionsInterface} from 'ng-circle-progress';


import {IRedrawableComponent, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler} from '@wm/components/base';
import {registerProps} from './progress-circle.props';
import {calculatePercent, getDecimalCount, isPercentageValue} from '../utils';
import {clone, debounce, extend} from "lodash-es";

const DEFAULT_CLS = 'progress app-progress circle';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-progress-circle', hostClass: DEFAULT_CLS};
const DEFAULT_OPTIONS: CircleProgressOptionsInterface  = {
    responsive: true,
    innerStrokeWidth: 10,
    outerStrokeWidth: 10,
    unitsFontSize: '15',
    space: -10,
    toFixed: 0,
    maxPercent: 100,
    showSubtitle: false,
    clockwise: true,
    startFromZero: false,
    renderOnClick: false,
    innerStrokeColor: '',
    outerStrokeColor: ''
};

// map of progress-bar type and classes
export const TYPE_CLASS_MAP_PC = {
    'default': '',
    'success': 'progress-circle-success',
    'info': 'progress-circle-info',
    'warning': 'progress-circle-warning',
    'danger': 'progress-circle-danger',
};



@Component({
  standalone: true,
  imports: [WmComponentsModule, NgCircleProgressModule],
    selector: '[wmProgressCircle]',
    templateUrl: './progress-circle.component.html',
    providers: [
        provideAsWidgetRef(ProgressCircleComponent)
    ],
    exportAs: 'wmProgressCircle'
})
export class ProgressCircleComponent extends StylableComponent implements AfterViewInit, IRedrawableComponent {
    static initializeProps = registerProps();

    public displayformat: string;
    public datavalue: string;
    public minvalue: number;
    public maxvalue: number;
    public type: string;
    public title: string;
    public subtitle: string;
    public captionplacement: string;
    public percentagevalue: number;
    public redraw: Function;
    public options: CircleProgressOptionsInterface;
    public hint: string;
    public arialabel: string;
    public displayValue: string;

    @ViewChild(CircleProgressComponent, { static: true }) circleRef: CircleProgressComponent;


    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
        this.options = clone(DEFAULT_OPTIONS);
        this.redraw = debounce(this._redraw, 100);
    }

    private _redraw () {
        this.circleRef.render();
        // Select the <tspan> element that contains the percentage value
        let tspanElement = $(this.nativeElement).find('svg text tspan:first');
        this.displayValue = this.options.showUnits ? tspanElement?.text() + '%' : tspanElement?.text();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.invokeEventCallback('beforerender', {'$event' : {}});
        this.options = Object.assign(this.circleRef.options, this.options);
    }

    getDefaultOptions() {
        return this.options;
    }

    getLib() {
        return 'ng-circle-progress';
    }

    overrideDefaults(options) {
        extend(this.options, options);
    }

    updateDisplayValueFormat() {
        // show title and subtitle only when captionplacement is 'inside'
        this.options.showTitle = this.options.showSubtitle = (this.captionplacement === 'inside');

        // show units when title value is empty and captionplacement is 'inside'
        this.options.showUnits = !this.title && this.options.showTitle && isPercentageValue(this.displayformat);
        this.options.toFixed = getDecimalCount(this.displayformat);

        if (this.options.showTitle) {
            this.options.title = this.title || 'auto';
            this.options.showSubtitle = !!this.subtitle;
            this.options.subtitle = this.subtitle || '';
        }
        this.redraw();
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        switch (key) {
            case 'type':
                this.$element.removeClass(TYPE_CLASS_MAP_PC[ov]);
                this.$element.addClass(TYPE_CLASS_MAP_PC[nv]);
                break;
            case 'minvalue':
            case 'maxvalue':
            case 'datavalue':
                if (isPercentageValue(this.datavalue)) {
                    this.percentagevalue = parseFloat(this.datavalue);
                } else {
                    this.percentagevalue = calculatePercent(parseFloat(this.datavalue), this.minvalue, this.maxvalue);
                }
                break;
            case 'displayformat':
            case 'captionplacement':
            case 'title':
            case 'subtitle':
                this.updateDisplayValueFormat();
                break;
        }
        super.onPropertyChange(key, nv, ov);
    }
}
