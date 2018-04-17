import { Directive, HostBinding, Injector } from '@angular/core';

import { addClass, setAttr, setCSSObj } from '@wm/utils';

import { IStylableComponent } from '../base/framework/types';
import { styler } from '../base/framework/styler';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './picture.props';
import { getImageUrl } from '../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-picture';
const WIDGET_CONFIG = {widgetType: 'wm-picture', hostClass: DEFAULT_CLS};

@Directive({
    'selector': '[wmPicture]'
})
export class PictureDirective extends BaseComponent {

    encodeurl;
    picturesource;
    pictureplaceholder;
    width;
    height;

    @HostBinding('class') imgClass = '';

    onStyleChange(key, newVal, oldVal) {
        if (key === 'picturesource') {
            this.onPictureSourceChange(key, newVal);
        }
    }

    onPictureSourceChange(key, newVal) {
        // If picture source don't exist, assign it to imagesource
        newVal = (key === 'pictureplaceholder' && this.picturesource) ? this.picturesource : newVal;

        // ng src will not get updated if the image url is empty. So add dummy value
        // The "blank" image will get a source of //:0 which won't cause a missing image icon to appear
        const imageSource = getImageUrl(newVal, this.encodeurl, this.pictureplaceholder);
        setAttr(this.nativeElement, 'src', imageSource);
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'animation':
                addClass(this.nativeElement, 'animation ' + newVal);
                break;
            case 'pictureaspect':
                switch (newVal) {
                    case 'None':
                        setCSSObj(this.nativeElement, {width: this.width, height: this.height});
                        break;
                    case 'H':
                        setCSSObj(this.nativeElement, {width: '100%', height: ''});
                        break;
                    case 'V':
                        setCSSObj(this.nativeElement, {width: '', height: '100%'});
                        break;
                    case 'Both':
                        setCSSObj(this.nativeElement, {width: '100%', height: '100%'});
                        break;
                }
                break;
            case 'encodeurl':
                this.onPictureSourceChange('', this.picturesource);
                break;
            case 'pictureplaceholder':
                this.onPictureSourceChange(key, newVal);
                break;
            case 'shape':
                this.imgClass = DEFAULT_CLS + ' img-' + newVal;
                break;
            case 'hint':
                setAttr(this.nativeElement, 'alt', newVal);
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this as IStylableComponent);
    }
}
