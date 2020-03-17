/**
 * This directive is used to set custom template partial for an item and maintains separate scope for each item.
 * This takes two inputs
 *      1) template partial name as wmItemTemplate
 *      2) item object as userComponentParams
 * Example: Providing a custom template for the search/autocomplete widget (customized UI in the dropdown for each item)
 * Add this directive to the li tag and provide item object and partial name like below. And also provide partialContainer and partial-container-target to render the partial.
 * <li #liElements *ngFor="let match of matches" [wmItemTemplate]="content" [userComponentParams]="match.item" partialContainer>
 *      <a partial-container-target></a>
 * </li>
 */

import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { NgForOfContext } from '@angular/common';

import { App } from '@wm/core';

import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './item-template.props';
import { StylableComponent } from '../base/stylable.component';

const WIDGET_CONFIG = {widgetType: 'wm-item-template'};

@Directive({
    selector: '[wmItemTemplate]',
    exportAs: 'itemTemplateRef',
    providers: [
        provideAsWidgetRef(ItemTemplateDirective)
    ]
})
export class ItemTemplateDirective extends StylableComponent {
    static initializeProps = registerProps();
    public context;
    public content;
    public nativeElement: HTMLElement;
    get $index() {
        return this.context.index;
    }

    @Input() userComponentParams;

    @Input() set wmItemTemplate(value) {
        this.widget.content = value;
    }

    constructor(inj: Injector, elRef: ElementRef, private app: App) {
        super(inj, WIDGET_CONFIG);
        this.nativeElement = elRef.nativeElement;
        this.context = (<NgForOfContext<ItemTemplateDirective>>(<any>inj).view.context);
    }
}
