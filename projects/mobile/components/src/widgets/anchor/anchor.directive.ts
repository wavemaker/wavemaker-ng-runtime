import { Directive, HostListener, Inject } from '@angular/core';

import { WidgetRef } from '@wm/components';

declare const _;
declare const cordova;

@Directive({
    selector: '[wmAnchor]'
})
export class AnchorDirective {

    constructor(@Inject(WidgetRef) private widget: any) { }

    @HostListener('click')
    onClick () {
        let href = this.widget.hyperlink;
        if (href) {
            if (href.indexOf(':') >= 0 && !(_.startsWith(href, 'http://') || _.startsWith(href, 'https://'))) {
                return;
            } else if (_.startsWith(href, '#')) {
                window.location.href = window.location.origin + window.location.pathname + href;
                return;
            } else if (_.startsWith(href, '//')) {
                href = 'https:' + href;
            }
            cordova.InAppBrowser.open(href, this.widget.target);
        }
    }
}
