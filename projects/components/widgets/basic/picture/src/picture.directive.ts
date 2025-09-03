import {Directive, HostBinding, Inject, Injector, OnInit, Optional} from '@angular/core';

import {setAttr, setCSS, switchClass} from '@wm/core';
import {
    DISPLAY_TYPE,
    ImagePipe,
    IWidgetConfig,
    provideAsWidgetRef,
    StylableComponent,
    styler
} from '@wm/components/base';

import {registerProps} from './picture.props';

const DEFAULT_CLS = 'app-picture';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-picture',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

@Directive({
  standalone: true,
    selector: 'img[wmPicture]',
    providers: [
        provideAsWidgetRef(PictureDirective)
    ],
    exportAs: 'wmPicture'
})
export class PictureDirective extends StylableComponent implements OnInit {
    static initializeProps = registerProps();

    encodeurl;
    picturesource;
    pictureplaceholder;
    alttext;

    @HostBinding('src') imgSource: string;

    constructor(inj: Injector, private imagePipe: ImagePipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

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
            setCSS(this.nativeElement, 'width', width, true);
            setCSS(this.nativeElement, 'height', height, true);
        } else if (key === 'encodeurl' || key === 'pictureplaceholder') {
            this.setImgSource();
        } else if (key === 'shape') {
            switchClass(this.nativeElement, `img-${nv}`, `img-${ov}`);
        }  else if (key === 'resizemode') {
            setCSS(this.nativeElement, 'object-fit', nv);
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
