import {
    convertDataToObject,
    IWidgetConfig,
    provideAs,
    provideAsWidgetRef,
    styler,
    TextContentDirective
} from "@wm/components/base";
import {FormsModule, NG_VALUE_ACCESSOR, NgModel} from '@angular/forms';
import {Component, Inject, Injector, Optional, ViewChild} from '@angular/core';
import {BaseFormCustomComponent} from '@wm/components/input/base-form-custom';

import {registerProps} from './slider.props';
import {isDefined} from "@wm/core";


const DEFAULT_CLS = 'app-slider slider';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-slider',
    hostClass: DEFAULT_CLS
};

@Component({
    standalone: true,
    imports: [TextContentDirective, FormsModule],
    selector: '[wmSlider]',
    templateUrl: './slider.component.html',
    providers: [
        provideAs(SliderComponent, NG_VALUE_ACCESSOR, true),
        provideAsWidgetRef(SliderComponent)
    ]
})
export class SliderComponent extends BaseFormCustomComponent {
    static initializeProps = registerProps();

    public minvalue: number;
    public maxvalue: number;
    public disabled: boolean;
    public step: number;
    public shortcutkey: string;
    public tabindex: any;
    public name: string;
    public readonly: boolean;
    public hint: string;
    public arialabel: string;
    public markerlabeltext: string
    public showmarkers: boolean;

    @ViewChild(NgModel) ngModel: NgModel;
    public markerItems: any[];

    constructor(inj: Injector, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
    }

    // change and blur events are added from the template
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'change' && eventName !== 'blur') {
            super.handleEvent(node, eventName, callback, locals);
        }
    }

    public handleChange(newVal: boolean) {
        this.invokeOnChange(this.datavalue, {type: 'change'}, this.ngModel.valid);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'tabindex') {
            return;
        }
        else if(key === 'showmarkers'||key === 'markerlabeltext' || key === 'minvalue'||key === 'maxvalue'||key === 'step') {
            if(this.showmarkers) {
                this.renderMarkers();
            }
        }
        super.onPropertyChange(key, nv, ov);
    }
    private renderMarkers() {
        const sliderTrack = this.nativeElement.querySelector('.range-input') as HTMLElement;
        const trackWidth = sliderTrack?.offsetWidth-9|| 0;
        let tickCount=0;
        if(isDefined(this.minvalue) && isDefined(this.maxvalue)){
            tickCount = this.step > 0 ? Math.floor((this.maxvalue - this.minvalue) / this.step) + 1 : 0;
        } else{
            tickCount = this.step > 0 ? Math.floor(100 / this.step) + 1 : 0;
        }
        const labels = convertDataToObject(this.markerlabeltext);
        this.markerItems = [];
        for (let i = 0; i < tickCount; i++) {
            const left = ((trackWidth / (tickCount - 1)) * i);
            const label = labels?.[i]?.dataValue ?? (Array.isArray(labels) ? (typeof labels[i] === 'object' && labels[i]?.title ? labels[i].title : labels[i]) : `${i}`);
            const position = Array.isArray(labels) && typeof labels[i] === 'object' && labels[i]?.position ? labels[i].position : 'up';
            this.markerItems.push({ label, position, left });
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if(this.showmarkers) {
            setTimeout(() => {this.renderMarkers();}, 40);
        }
    }
}
