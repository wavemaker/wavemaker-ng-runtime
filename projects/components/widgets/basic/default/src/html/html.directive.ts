import {Attribute, Directive, Injector, OnInit, Optional, SecurityContext} from '@angular/core';

import {setCSS, setProperty, UserDefinedExecutionContext} from '@wm/core';
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
        private sanitizePipe:SanitizePipe, @Optional() public _viewParent: UserDefinedExecutionContext
    ) {
        super(inj, WIDGET_CONFIG, _viewParent);

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
            // Check for trustPipe safe values
            let bindContent = this.nativeElement.getAttribute('content.bind');
            let safeValue = bindContent ? nv && bindContent.includes('trustAs:') : false;
            if (typeof nv === 'object' && safeValue) {
                setProperty(this.nativeElement, 'innerHTML', nv[Object.keys(nv)[0]]);
            }  else {
                setProperty(this.nativeElement, 'innerHTML', this.sanitizePipe.transform(nv, SecurityContext.HTML));
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
