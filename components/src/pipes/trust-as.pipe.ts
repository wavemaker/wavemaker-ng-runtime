import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'trustAs'
})
export class TrustAsPipe implements PipeTransform {

    constructor(private domSanitizer: DomSanitizer) {}

    transform(content: string, as: string | SecurityContext) {
        if (as === 'resource' || as === SecurityContext.RESOURCE_URL) {
            if (!content) {
                return;
            }
            return this.domSanitizer.bypassSecurityTrustResourceUrl(content);
        }

        if (as === 'html' || as === SecurityContext.HTML) {
            if (content === null || content === undefined) {
                return '';
            }
            return this.domSanitizer.bypassSecurityTrustHtml(content);
        }
    }
}
