import { AfterViewInit, Component, Injector, ViewChild } from '@angular/core';
import { CircleProgressComponent, CircleProgressOptionsInterface } from 'ng-circle-progress';


import { IWidgetConfig, provideAsWidgetRef, IRedrawableComponent, StylableComponent, styler } from '@wm/components/base';
import { registerProps } from './progress-circle.props';
import { calculatePercent, getDecimalCount, isPercentageValue } from '../utils';

declare const _;

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
export const TYPE_CLASS_MAP = {
    'default': '',
    'success': 'progress-circle-success',
    'info': 'progress-circle-info',
    'warning': 'progress-circle-warning',
    'danger': 'progress-circle-danger',
};



@Component({
    selector: '[wmProgressCircle]',
    templateUrl: './progress-circle.component.html',
    providers: [
        provideAsWidgetRef(ProgressCircleComponent)
    ]
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

    @ViewChild(CircleProgressComponent, { static: true }) circleRef: CircleProgressComponent;


    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.options = _.clone(DEFAULT_OPTIONS);
        this.redraw = _.debounce(this._redraw, 100);
    }

    private _redraw () {
        this.circleRef.render();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.invokeEventCallback('beforerender', {'$event' : {}});
        this.options = Object.assign(this.circleRef.options, this.options);
    }

    getDefualtOptions() {
        return this.options;
    }

    getLib() {
        return 'ng-circle-progress';
    }

    overrideDefaults(options) {
        _.extend(this.options, options);
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
                this.$element.removeClass(TYPE_CLASS_MAP[ov]);
                this.$element.addClass(TYPE_CLASS_MAP[nv]);
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
