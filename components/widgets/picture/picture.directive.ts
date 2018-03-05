import { Directive, Injector, ElementRef, ChangeDetectorRef, HostBinding, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './picture.props';
import { addClass, setAttr, setCSSObj } from '@utils/dom';
import { styler } from '../../utils/styler';
import { getImageUrl } from '@utils/utils';

registerProps();

const DEFAULT_CLS = 'app-picture';
const WIDGET_CONFIG = {widgetType: 'wm-picture', hostClass: DEFAULT_CLS};

@Directive({
    'selector': '[wmPicture]'
})
export class PictureDirective extends BaseComponent implements OnInit {

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
        setAttr(this.$element, 'src', imageSource);
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'animation':
                addClass(this.$element, 'animation ' + newVal);
                break;
            case 'pictureaspect':
                switch (newVal) {
                    case 'None':
                        setCSSObj(this.$element, {width: this.width, height: this.height});
                        break;
                    case 'H':
                        setCSSObj(this.$element, {width: '100%', height: ''});
                        break;
                    case 'V':
                        setCSSObj(this.$element, {width: '', height: '100%'});
                        break;
                    case 'Both':
                        setCSSObj(this.$element, {width: '100%', height: '100%'});
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
                setAttr(this.$element, 'alt', newVal);
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
