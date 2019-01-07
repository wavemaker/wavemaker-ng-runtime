import { Directive, HostBinding, Injector, OnInit } from '@angular/core';

import { setAttr, setCSS, switchClass } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { registerProps } from './picture.props';
import { StylableComponent } from '../base/stylable.component';
import { DISPLAY_TYPE } from '../../framework/constants';
import { ImagePipe } from '../../../pipes/image.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'app-picture';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-picture',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

@Directive({
    selector: 'img[wmPicture]',
    providers: [
        provideAsWidgetRef(PictureDirective)
    ]
})
export class PictureDirective extends StylableComponent implements OnInit {

    encodeurl;
    picturesource;
    pictureplaceholder;

    @HostBinding('src') imgSource: string;

    constructor(inj: Injector, private imagePipe: ImagePipe) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this);
    }

    setImgSource() {
        this.imgSource = this.imagePipe.transform(this.picturesource, this.encodeurl, this.pictureplaceholder);
    }

    onPropertyChange(key: string, nv: any, ov: any) {
        if (key === 'pictureaspect') {
            let width = '';
            let height = '';
            switch (nv) {
                case 'None':
                    width = this.width;
                    height = this.height;
                    break;
                case 'H':
                    width = '100%';
                    break;
                case 'V':
                    height = '100%';
                    break;
                case 'Both':
                    width = '100%';
                    height = '100%';
                    break;
            }
            setCSS(this.nativeElement, 'width', width);
            setCSS(this.nativeElement, 'height', height);
        } else if (key === 'encodeurl' || key === 'pictureplaceholder') {
            this.setImgSource();
        } else if (key === 'shape') {
            switchClass(this.nativeElement, `img-${nv}`, `img-${ov}`);
        } else if (key === 'hint') {
            setAttr(this.nativeElement, 'alt', nv);
        }
        super.onPropertyChange(key, nv, ov);
    }

    onStyleChange(key: string, nv: any, ov?: any) {
        if (key === 'picturesource') {
            this.setImgSource();
        } else {
            super.onStyleChange(key, nv, ov);
        }
    }

    ngOnInit() {
        this.setImgSource();
        super.ngOnInit();
    }
}
