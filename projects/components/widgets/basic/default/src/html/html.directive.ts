import { Attribute, Directive, Injector, OnInit, SecurityContext } from '@angular/core';

import { setCSS, setProperty } from '@wm/core';
import { IWidgetConfig, provideAsWidgetRef, SanitizePipe, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './html.props';

const DEFAULT_CLS = 'app-html-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-html',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmHtml]',
    providers: [
        provideAsWidgetRef(HtmlDirective)
    ],
    exportAs: 'wmHtml'
})
export class HtmlDirective extends StylableComponent implements OnInit {
    static initializeProps = registerProps();
    public content: string;

    constructor(
        inj: Injector,
        @Attribute('height') height: string,
        @Attribute('content.bind') private boundContent: string,
        private sanitizePipe:SanitizePipe
    ) {
        super(inj, WIDGET_CONFIG);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.boundContent) {
            this.nativeElement.innerHTML = '';
        }
        if (!this.content && this.nativeElement.innerHTML) {
            this.content = this.nativeElement.innerHTML;
        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'content') {
            let safeValue = nv && nv.constructor.name.startsWith('Safe');
            if (safeValue) {
                setProperty(this.nativeElement, 'innerHTML', nv[Object.keys(nv)[0]]);
            }  else {
                setProperty(this.nativeElement, 'innerHTML', this.sanitizePipe.transform(nv, SecurityContext.HTML));
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
