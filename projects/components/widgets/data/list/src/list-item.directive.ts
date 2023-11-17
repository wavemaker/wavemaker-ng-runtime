import {
    AfterViewInit,
    ContentChildren,
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    Injector,
    Input,
    OnInit,
    Optional,
    inject,
    QueryList, ViewContainerRef
} from '@angular/core';
import { NgForOfContext } from '@angular/common';

import { Observable, Subject } from 'rxjs';

import {$invokeWatchers, $watch, App, findParent} from '@wm/core';

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
    private viewContainerRef: ViewContainerRef;

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
        this.viewContainerRef = inj.get(ViewContainerRef);
        this.nativeElement = elRef.nativeElement;
        let viewParentApp = this.inj ? this.inj.get(App) : inject(App);
        let _viewParent  = findParent((this.inj as any)._lView, viewParentApp);

        // @ts-ignore
        this.listComponent = _viewParent;
        // this.context = (<NgForOfContext<ListItemDirective>>(<any>inj).view.context);
        this.context = (this.inj as any)._lView[8];
        //this.context = (this.viewContainerRef as any)._hostLView.find(t => t && !!t.$implicit);
        this.itemClassWatcher(this.listComponent);
        this.disableItemWatcher(this.listComponent);
        $(this.nativeElement).data('listItemContext', this);
    }

    private registerWatch(expression: string, callback: Function) {
        // Removing ngFor context as the same properties are availble on listitem scope.
        // passing viewparent context for accessing varibales and widgets.
        //[CSP]: expression will be generated in the component as e.g. 'item.className'
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

    private setUpCUDHandlers() {
        const $editItem = this.nativeElement.querySelector('.edit-list-item');
        const $deleteItem = this.nativeElement.querySelector('.delete-list-item');

        if ($editItem) {
            // Triggered on click of edit action
            $editItem.addEventListener('click', evt => {
                this.listComponent.update();
            });
        }

        if ($deleteItem) {
            // Triggered on click of delete action
            $deleteItem.addEventListener('click', evt => {
                this.listComponent.delete();
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
