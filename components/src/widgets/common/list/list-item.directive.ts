import { ContentChildren, Directive, ElementRef, HostBinding, Injector, Input, OnInit, QueryList } from '@angular/core';
import { NgForOfContext } from '@angular/common';

import { Observable, Subject } from 'rxjs';

import { $watch } from '@wm/core';

import { ListComponent } from './list.component';
import { WidgetRef } from '../../framework/types';

@Directive({
    selector: '[wmListItem]',
    exportAs: 'listItemRef'
})
export class ListItemDirective implements OnInit {

    public item;
    public context;
    public destroy: Subject<any> = new Subject();
    public destroy$: Observable<any> = this.destroy.asObservable();
    public nativeElement: HTMLElement;

    private readonly listComponent: ListComponent;
    private itemClass: string = '';

    @HostBinding('class.active') isActive: boolean = false;
    @HostBinding('class.disable-item') disableItem: boolean = false;

    @ContentChildren(WidgetRef) _currentItemWidgets: QueryList<WidgetRef>;

    get currentItemWidgets () {
        const componentElements = Array.from(this.nativeElement.querySelectorAll('[widget-id]'));
        return componentElements.reduce((result, comp: any) => {
            result[comp.widget.name] = comp.widget;
            return result;
        }, {});
    }

    @Input() set wmListItem(val) {
        this.item = val;
    }

    constructor(private inj: Injector, elRef: ElementRef) {
        this.nativeElement = elRef.nativeElement;
        this.listComponent = (<ListComponent>(<any>inj).view.component);
        this.context = (<NgForOfContext<ListItemDirective>>(<any>inj).view.context);
        this.itemClassWatcher(this.listComponent);
        this.disableItemWatcher(this.listComponent);
        $(this.nativeElement).data('listItemContext', this);
    }

    private registerWatch(expression: string, callback: Function) {
        const $locals =  (<any>this.inj).view.context;
        this.destroy$.subscribe($watch(expression, this, $locals, callback));
    }

    private itemClassWatcher(listComponent: ListComponent) {
        if (listComponent.binditemclass) {
            this.registerWatch(listComponent.binditemclass, nv => this.itemClass = nv || '');
        } else {
            this.itemClass = listComponent.itemclass;
        }
    }

    private disableItemWatcher($list: ListComponent) {
        if ($list.binddisableitem) {
            this.registerWatch($list.binddisableitem, nv => this.disableItem = nv || false);
        } else {
            this.disableItem = $list.disableitem || false;
        }
    }

    ngOnInit() {
        if (this.listComponent.mouseEnterCB) {
            this.nativeElement.addEventListener('mouseenter', ($event) => {
                this.listComponent.invokeEventCallback('mouseenter', {$event});
            });
        }
        if (this.listComponent.mouseLeaveCB) {
            this.nativeElement.addEventListener('mouseleave', ($event) => {
                this.listComponent.invokeEventCallback('mouseleave', {$event});
            });
        }
    }
}

