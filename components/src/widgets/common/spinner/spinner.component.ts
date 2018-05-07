import { Component, forwardRef, Injector } from '@angular/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { registerProps } from './spinner.props';
import { StylableComponent } from '../base/stylable.component';
import { ImagePipe } from '../../../pipes/image.pipe';

declare const _;

const DEFAULT_CLS = 'app-spinner';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-spinner', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSpinner]',
    templateUrl: './spinner.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => SpinnerComponent)}
    ]
})
export class SpinnerComponent extends StylableComponent {

    public iconclass = '';
    public animation = '';
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

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'image':
                this.picture = this.imagePipe.transform(newVal);
                break;
            case 'animation':
                if (newVal === 'spin') {
                    this.animation = 'fa-spin';
                } else {
                    this.animation = newVal || '';
                }
                break;
        }
    }
}
