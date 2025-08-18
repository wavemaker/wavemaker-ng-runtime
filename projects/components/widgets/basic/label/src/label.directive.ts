import {Directive, Inject, Injector, Optional, SecurityContext} from '@angular/core';

import {setProperty, toggleClass} from '@wm/core';
import {
    DISPLAY_TYPE,
    IWidgetConfig,
    provideAsWidgetRef,
    SanitizePipe,
    StylableComponent,
    styler
} from '@wm/components/base';

import {registerProps} from './label.props';
import {isObject} from "lodash-es";

const DEFAULT_CLS = 'app-label';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-label',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

@Directive({
  standalone: true,
    selector: '[wmLabel]',
    providers: [
        provideAsWidgetRef(LabelDirective)
    ],
    exportAs: 'wmLabel'
})
export class LabelDirective extends StylableComponent {
    static initializeProps = registerProps();

    constructor(inj: Injector, private sanitizePipe:SanitizePipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);

        styler(this.nativeElement, this);
    }

    onPropertyChange(key, nv, ov?) {

        if (key === 'caption') {
            // Check for trustPipe safe values
            let bindContent = this.nativeElement.getAttribute('caption.bind');
            let safeValue = bindContent ? nv && bindContent.includes('trustAs:') : false;
            const insertZWSP = (value: any): string => {
                if (typeof value !== 'string') return value;
                return value.replace(/\d{5,}/g, (match) => {
                    return match.replace(/(.{9})(?=.)/g, '$1\u200B');
                });
            };
            if (isObject(nv) && !safeValue) {
                setProperty(this.nativeElement, 'textContent', JSON.stringify(nv));
            } else if (isObject(nv) && safeValue) {
                setProperty(this.nativeElement, 'innerHTML', nv[Object.keys(nv)[0]]);
            }  else {
                setProperty(this.nativeElement, 'innerHTML', this.sanitizePipe.transform(insertZWSP(nv), SecurityContext.HTML));
            }

        } else if (key === 'required') {
            toggleClass(this.nativeElement, 'required', nv);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
