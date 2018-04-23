import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export const SANITIZE_AS = {
    RESOURCE: 'resource',
    HTML: 'html'
};

@Pipe({
    name: 'sanitize'
})
export class SanitizePipe implements PipeTransform {

    constructor(private domSanitizer: DomSanitizer) {}

    transform(content: string, as: string) {
        if (as === SANITIZE_AS.RESOURCE) {
            return this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, content);
        }

        if (as === SANITIZE_AS.HTML) {
            return this.domSanitizer.sanitize(SecurityContext.HTML, content);
        }
    }


}
