import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import {DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl} from '@angular/platform-browser';

@Pipe({
    name: 'trustAs',
    standalone: false
})
export class TrustAsPipe implements PipeTransform {

    constructor(private domSanitizer: DomSanitizer) {}

    transform(content: string, context: string | SecurityContext) {
        if (content === null || content === undefined) {
            return '';
        }
        switch (context) {
            case 'html':
            case SecurityContext.HTML:
                return this.domSanitizer.bypassSecurityTrustHtml(content);
            case 'style':
            case SecurityContext.STYLE:
                return this.domSanitizer.bypassSecurityTrustStyle(content);
            case 'script':
            case SecurityContext.SCRIPT:
                return this.domSanitizer.bypassSecurityTrustScript(content);
            case 'url':
            case SecurityContext.URL:
                return this.domSanitizer.bypassSecurityTrustUrl(content);
            case 'resource':
            case SecurityContext.RESOURCE_URL:
                return this.domSanitizer.bypassSecurityTrustResourceUrl(content);
        }
    }
}
