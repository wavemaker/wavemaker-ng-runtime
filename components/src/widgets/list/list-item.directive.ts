import { Injector, Input, HostListener, HostBinding, Directive } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { ListComponent } from './list.component';
import { idMaker, $appDigest, $watch } from '@wm/utils';

const idGen = idMaker('widget-id-');

@Directive({
    selector: '[wmListItem]',
    exportAs: 'listItemRef'
})
export class ListItemDirective {

    item;
    destroy = new Subject();
    destroy$ = this.destroy.asObservable();

    private listComponent: ListComponent;
    private itemClass: string = '';

    @HostBinding('class.active') isActive: boolean = false;
    @HostBinding('class.disable-item') disableItem: boolean = false;
    @HostListener('click') onClick () {
        this.listComponent.clearItems();
        this.listComponent.setItems(this);
        $appDigest();
    }

    @Input() set wmListItem(val) {
        this.item = val;
    }

    registerWatches(expression: string, callback) {
        const $locals =  (<any>this.inj).view.context,
            widgetId = idGen.next().value;
        this.destroy$.subscribe($watch(expression, this, $locals, callback, widgetId));
    }

    itemClassWatcher(parent) {
        if (parent.binditemclass) {
            this.registerWatches(parent.binditemclass, nv => {
                this.itemClass = nv || '';
            });
        } else {
            this.itemClass = parent.itemclass;
        }
    }

    disableItemWatcher(parent: ListComponent) {
        if (parent.binddisableitem) {
            this.registerWatches(parent.binddisableitem, nv => {
                this.disableItem = nv || false;
            });
        } else {
            this.disableItem = parent.binddisableitem || false;
        }
    }

    constructor(private inj: Injector) {
        this.listComponent = (<ListComponent>(<any>inj).view.component);
        this.itemClassWatcher(this.listComponent);
        this.disableItemWatcher(this.listComponent);
    }
}

