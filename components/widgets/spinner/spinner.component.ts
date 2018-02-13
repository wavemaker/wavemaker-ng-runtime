import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import { getBackGroundImageUrl } from '@utils/utils';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { registerProps } from './spinner.props';

declare const _;

const DEFAULT_CLS = 'app-spinner';
const WIDGET_CONFIG = {widgetType: 'wm-spinner', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmSpinner]',
    templateUrl: './spinner.component.html'
})
export class SpinnerComponent extends BaseComponent {

    iconclass = 'fa fa-spinner';
    /**
     * Internal property to map the proper sanitised resource url
     */
    private picture: string;
    /**
     * Property to map the animation class to the widget
     */
    animation: string;
    /**
     * Internal property to map the proper sanitised `caption` property
     */
    private messageContent: any;

    private _spinnerMessages;

    private showCaption = true;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'image':
                this.picture = getBackGroundImageUrl(newVal);
                break;
            case 'animation':
                if (newVal === 'spin') {
                    this.animation = 'fa-spin';
                } else {
                    this.animation = newVal;
                }
                break;
            case 'caption':
                this.messageContent = this.sanitizer.bypassSecurityTrustHtml(newVal);
                break;
        }
    }

    get spinnerMessages() {
        return this._spinnerMessages;
    }

    set spinnerMessages(newVal) {
        this.showCaption = _.isEmpty(newVal);
        this._spinnerMessages = newVal;
    }
}
