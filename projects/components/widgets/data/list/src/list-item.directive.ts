import { AfterViewInit, ContentChildren, Directive, ElementRef, HostBinding, HostListener, Injector, Input, OnInit, QueryList } from '@angular/core';
import { NgForOfContext } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { $invokeWatchers, $watch, App } from '@wm/core';

import { ListComponent } from './list.component';

declare const $, _;

@Directive({
    selector: '[wmListItem]',
    exportAs: 'listItemRef'
})
export class ListItemDirective implements OnInit, AfterViewInit {

    public item;
    public context;
    public destroy: Subject<any> = new Subject();
    public destroy$: Observable<any> = this.destroy.asObservable();
    public nativeElement: HTMLElement;
    public readonly listComponent: ListComponent;

    private itemClass = '';
    private _currentItemWidgets = {};

    @HostBinding('class.active') isActive = false;
    @HostBinding('class.disable-item') disableItem = false;

    @HostListener('focus')
    onFocus() {
        // maintains which element is focused/selected most recently.
        this.listComponent.lastSelectedItem = this;
    }

    get $index() {
        return this.context.index;
    }

    get $even() {
        return this.context.even;
    }

    get $odd() {
        return this.context.odd;
    }

    get $first() {
        return this.context.first;
    }

    get $last() {
        return this.context.last;
    }

    get currentItemWidgets () {
        const componentElements = Array.from(this.nativeElement.querySelectorAll('[widget-id]'));
        return Object.assign(this._currentItemWidgets, componentElements.reduce((result, comp: any) => {
            result[comp.widget.name] = comp.widget;
            return result;
        }, {}));
    }

    @Input() set wmListItem(val) {
        this.item = val;
    }

    constructor(private inj: Injector, elRef: ElementRef, private app: App) {
        this.nativeElement = elRef.nativeElement;
        this.listComponent = (<ListComponent>(<any>inj).view.component);
        this.context = (<NgForOfContext<ListItemDirective>>(<any>inj).view.context);
        this.itemClassWatcher(this.listComponent);
        this.disableItemWatcher(this.listComponent);
        $(this.nativeElement).data('listItemContext', this);
    }

    private registerWatch(expression: string, callback: Function) {
        // Removing ngFor context as the same properties are availble on listitem scope.
        // passing viewparent context for accessing varibales and widgets.
        this.destroy$.subscribe($watch(expression, (this.listComponent as any).viewParent, this, callback));
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

    private triggerWMEvent(eventName) {
        $invokeWatchers(true);
        // If we have multiselect for the livelist(List with form template), in run mode deleting a record is getting failed. Becuase the selecteditem will be array of objects. So consider the last object.
        const row = this.listComponent.multiselect ? _.last(this.listComponent.selecteditem) : this.listComponent.selecteditem;
        this.app.notify('wm-event', {eventName, widgetName: this.listComponent.name, row: row});
    }

    private setUpCUDHandlers() {
        const $editItem = this.nativeElement.querySelector('.edit-list-item');
        const $deleteItem = this.nativeElement.querySelector('.delete-list-item');

        if ($editItem) {
            // Triggered on click of edit action
            $editItem.addEventListener('click', evt => {
                this.triggerWMEvent('update');
            });
        }

        if ($deleteItem) {
            // Triggered on click of delete action
            $deleteItem.addEventListener('click', evt => {
                this.triggerWMEvent('delete');
            });
        }
    }


    ngOnInit() {
        if (this.listComponent.mouseEnterCB) {
            this.nativeElement.addEventListener('mouseenter', ($event) => {
                this.listComponent.invokeEventCallback('mouseenter', {widget: this, $event});
            });
        }
        if (this.listComponent.mouseLeaveCB) {
            this.nativeElement.addEventListener('mouseleave', ($event) => {
                this.listComponent.invokeEventCallback('mouseleave', {widget: this, $event});
            });
        }
        // adding item attribute on every list item
        $(this.nativeElement).attr('listitemindex', this.$index);
    }

    ngAfterViewInit() {
        this.setUpCUDHandlers();
    }
}
