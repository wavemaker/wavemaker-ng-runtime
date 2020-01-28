import { Directive, ElementRef, Injector, Input } from '@angular/core';
import { NgForOfContext } from '@angular/common';

import { App } from '@wm/core';

import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './item-template.props';
import { StylableComponent } from '../base/stylable.component';

const WIDGET_CONFIG = {widgetType: 'item-template'};

@Directive({
    selector: '[itemTemplate]',
    exportAs: 'itemTemplateRef',
    providers: [
        provideAsWidgetRef(ItemTemplateDirective)
    ]
})
export class ItemTemplateDirective extends StylableComponent {
    public context;
    public nativeElement: HTMLElement;
    get $index() {
        return this.context.index;
    }

    @Input() userComponentParams;

    @Input() content;

    static initializeProps = registerProps();

    constructor(inj: Injector, elRef: ElementRef, private app: App) {
        super(inj, WIDGET_CONFIG);
        this.nativeElement = elRef.nativeElement;
        this.context = (<NgForOfContext<ItemTemplateDirective>>(<any>inj).view.context);
    }
}
