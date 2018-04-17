import { Injector, Input, HostListener, HostBinding, Directive } from '@angular/core';
import { NgForOfContext } from '@angular/common';
import { Subject } from 'rxjs/Subject';
import { ListComponent } from './list.component';
import { idMaker, $watch } from '@wm/utils';

const idGen = idMaker('widget-id-');

@Directive({
    selector: '[wmListItem]',
    exportAs: 'listItemRef'
})
export class ListItemDirective {

    item;
    context;
    destroy = new Subject();
    destroy$ = this.destroy.asObservable();

    private listComponent: ListComponent;
    private itemClass: string = '';

    @HostBinding('class.active') isActive: boolean = false;
    @HostBinding('class.disable-item') disableItem: boolean = false;
    @HostListener('click', ['$event']) onClick ($event: any) {
        this.listComponent.onItemClick($event, this);
    }

    @Input() set wmListItem(val) {
        this.item = val;
    }

    registerWatches(expression: string, callback) {
        const $locals =  (<any>this.inj).view.context,
            widgetId = idGen.next().value;
        this.destroy$.subscribe($watch(expression, this, $locals, callback, widgetId));
    }

    itemClassWatcher($list) {
        if ($list.binditemclass) {
            this.registerWatches($list.binditemclass, nv => {
                this.itemClass = nv || '';
            });
        } else {
            this.itemClass = $list.itemclass;
        }
    }

    disableItemWatcher($list: ListComponent) {
        if ($list.binddisableitem) {
            this.registerWatches($list.binddisableitem, nv => {
                this.disableItem = nv || false;
            });
        } else {
            this.disableItem = $list.disableitem || false;
        }
    }

    constructor(private inj: Injector) {
        this.listComponent = (<ListComponent>(<any>inj).view.component);
        this.context = (<NgForOfContext<ListItemDirective>>(<any>inj).view.context);
        this.itemClassWatcher(this.listComponent);
        this.disableItemWatcher(this.listComponent);
    }
}

