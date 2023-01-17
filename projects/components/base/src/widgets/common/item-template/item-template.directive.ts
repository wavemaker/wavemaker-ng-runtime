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

import { Directive, ElementRef, Injector, Input, Optional, ViewContainerRef } from '@angular/core';
import { NgForOfContext } from '@angular/common';

import {App, UserDefinedExecutionContext} from '@wm/core';

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
    public partialParams;
    public nativeElement: HTMLElement;
    public viewContainerRef: ViewContainerRef;
    get $index() {
        return this.context.index;
    }

    @Input() userComponentParams;

    @Input() set wmItemTemplate(value) {
        this.widget.content = value;
    }

    constructor(inj: Injector, elRef: ElementRef, private app: App, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);
        this.nativeElement = elRef.nativeElement;
        // this.context = (<NgForOfContext<ItemTemplateDirective>>(<any>inj).view.context);
        this.context = (this.viewContainerRef as any)._hostLView.debug.context;
    }
    ngOnInit() {
        super.ngOnInit();
        this.partialParams.item = this.userComponentParams.dataObject;
    }
}
