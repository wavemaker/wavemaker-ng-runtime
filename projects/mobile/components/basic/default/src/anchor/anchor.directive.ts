import { Directive, HostListener, Inject } from '@angular/core';

import { WidgetRef } from '@wm/components/base';
import {startsWith} from "lodash-es";

@Directive({
    selector: '[wmAnchor]'
})
export class AnchorDirective {

    constructor(@Inject(WidgetRef) private widget: any) { }

    @HostListener('click')
    onClick () {
        let href = this.widget.hyperlink;
        if (href) {
            if (href.indexOf(':') >= 0 && !(startsWith(href, 'http://') || startsWith(href, 'https://'))) {
                return;
            } else if (startsWith(href, '#')) {
                window.location.href = window.location.origin + window.location.pathname + href;
                return;
            } else if (startsWith(href, '//')) {
                href = 'https:' + href;
            }
            if (window['cordova']) {
                window.open(href, this.widget.target);
            }
        }
    }
}
