import { Component, Injector, OnInit } from '@angular/core';
import { formatStyle } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './spinner.props';
import { StylableComponent } from '../base/stylable.component';
import { ImagePipe } from '../../../pipes/image.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

declare const _;

const DEFAULT_CLS = 'app-spinner';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-spinner', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSpinner]',
    templateUrl: './spinner.component.html',
    providers: [
        provideAsWidgetRef(SpinnerComponent)
    ]
})
export class SpinnerComponent extends StylableComponent implements OnInit {

    public iconclass = '';
    public animation = '';
    public imagewidth;
    public imageheight;
    private picture: string;
    private _spinnerMessages;
    private showCaption = true;

    public get spinnerMessages() {
        return this._spinnerMessages;
    }

    public set spinnerMessages(newVal) {
        this.showCaption = _.isEmpty(newVal);
        this._spinnerMessages = newVal;
    }

    constructor(inj: Injector, private imagePipe: ImagePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        this.imageheight = formatStyle(this.imageheight);
        this.imagewidth = formatStyle(this.imagewidth);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'image') {
            this.picture = this.imagePipe.transform(nv);
        } else if (key === 'animation') {
            if (nv === 'spin') {
                this.animation = 'fa-spin';
            } else {
                this.animation = nv || '';
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
