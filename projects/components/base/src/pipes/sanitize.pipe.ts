import {Pipe, PipeTransform, SecurityContext} from "@angular/core";
import {DomSanitizer, SafeValue} from "@angular/platform-browser";

@Pipe({
    name: 'sanitize'
})
export class SanitizePipe implements PipeTransform {
    constructor(private domSanitizer: DomSanitizer) {
    }

    transform(content: string | SafeValue, context: string | SecurityContext): string {
        if (content === null || content === undefined) {
            return '';
        }
        switch (context) {
            case 'html':
            case SecurityContext.HTML:
                return this.domSanitizer.sanitize(SecurityContext.HTML, content);
            case 'style':
            case SecurityContext.STYLE:
                return this.domSanitizer.sanitize(SecurityContext.STYLE, content);
            case 'script':
            case SecurityContext.SCRIPT:
                return this.domSanitizer.sanitize(SecurityContext.SCRIPT, content);
            case 'url':
            case SecurityContext.URL:
                return this.domSanitizer.sanitize(SecurityContext.URL, content);
            case 'resource':
            case SecurityContext.RESOURCE_URL:
                return this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, content);
            case 'none':
            case SecurityContext.NONE:
                return this.domSanitizer.sanitize(SecurityContext.NONE, content);
        }
    }
}
