import { Directive, Input } from '@angular/core';

import { provideAsWidgetRef } from '@wm/components/base';

@Directive({
    selector: '[wmMediaListItem]',
    providers: [
        provideAsWidgetRef(MediaListItemDirective)
    ]
})
export class MediaListItemDirective {

    public index;
    public item;

    @Input() set wmMediaListItem(val) {
        this.item = val;
    }
}
