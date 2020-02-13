import { Input } from '@angular/core';

/**
 * The `wmPage` directive defines the Page component.
 */
export class Page {
    /**
     * This property will be set as the page title in run mode.
     */
    @Input() pagetitle: string;
}