import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostBinding,
    HostListener,
    inject,
    Injector,
    Input, OnDestroy,
    OnInit,
    Optional,
    ViewContainerRef
} from '@angular/core';

import {Observable, Subject} from 'rxjs';

import {$watch, App} from '@wm/core';

import {ListComponent} from './list.component';
import {widgetIdGenerator} from "@wm/components/base";
import {BaseFormComponent} from "@wm/components/input/base-form";

declare const $;

@Directive({
  standalone: true,
    selector: '[wmListItem]',
    exportAs: 'listItemRef'
})
export class ListItemDirective implements OnInit, AfterViewInit, OnDestroy {

    public item;
    public context;
    public destroy: Subject<any> = new Subject();
    public destroy$: Observable<any> = this.destroy.asObservable();
    public nativeElement: HTMLElement;
    public readonly listComponent: ListComponent;

    private itemClass = '';
    private _currentItemWidgets = {};
    private viewContainerRef: ViewContainerRef;
    /**
     * To avoid re-rendering of widget, passing unique id as contextKey to createCustomInjector
     */
    protected trackId = widgetIdGenerator.nextUid();

    @HostBinding('class.active') isActive = false;
    @HostBinding('class.disable-item') disableItem = false;

    @HostListener('focus')
    onFocus() {
        // maintains which element is focused/selected most recently.
        this.listComponent.lastSelectedItem = this;
    }

    get $index() {
        return this.context.$index;
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

    private widgetMap = new WeakMap<Element, any>();

    get currentItemWidgets() {
        const componentElements = Array.from(
            this.nativeElement.querySelectorAll('[widget-id]')
        );

        return componentElements.reduce((result, comp: any) => {
            let widget = this.widgetMap.get(comp);

            if (!widget) {
                widget = comp.widget;
                this.widgetMap.set(comp, widget);
            }

            // DEFENSIVE FIX: Check if comp.widget exists before accessing .name
            // During component destruction, widget reference may be nullified while DOM still exists
            if (widget && comp.widget && comp.widget.name) {
                result[comp.widget.name] = widget;
            }
            return result;
        }, {});
    }

    @Input() set wmListItem(val) {
        this.item = val;
    }
    private _viewParent = inject(ListComponent, {optional: true});
    constructor(private inj: Injector, elRef: ElementRef, private app: App) {
        this.viewContainerRef = inj.get(ViewContainerRef);
        this.nativeElement = elRef.nativeElement;
        this.listComponent = this._viewParent;
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
            console.log('this.listComponent.$editItem')

            // Triggered on click of edit action
            const handler = () => this.listComponent.update();
            $editItem.addEventListener('click', handler);
            this.destroy$.subscribe(() => $editItem.removeEventListener('click', handler));
        }

        if ($deleteItem) {
            console.log('this.listComponent.$deleteItem')

            // Triggered on click of delete action
            const handler = () => this.listComponent.delete();
            $deleteItem.addEventListener('click', handler);
            this.destroy$.subscribe(() => $deleteItem.removeEventListener('click', handler));
        }
    }
    ngOnInit() {
        if (this.listComponent.mouseEnterCB) {
            console.log('this.listComponent.mouseEnterCB')
            this.nativeElement.addEventListener('mouseenter', ($event) => {
                this.listComponent.invokeEventCallback('mouseenter', {widget: this, $event});
            });
        }
        if (this.listComponent.mouseLeaveCB) {
            console.log('this.listComponent.mouseLeaveCB')
            this.nativeElement.addEventListener('mouseleave', ($event) => {
                this.listComponent.invokeEventCallback('mouseleave', {widget: this, $event});
            });
        }
        // adding item attribute on every list item
        $(this.nativeElement).attr('listitemindex', this.$index);
    }

    ngAfterViewInit() {
        this.setUpCUDHandlers();
        const componentElements = Array.from(this.nativeElement.querySelectorAll('[widget-id]'));
        componentElements.forEach((component: any) => {
            if(component.widget instanceof BaseFormComponent) {
                if(!component.widget.$attrs.get('datavaluesource.bind')) {
                    component.widget.datavaluesource = this.listComponent['datasource'];
                }
            }
        });
    }

    ngOnDestroy() {
        console.log("ngOnDestroy listItem");
        this.destroy.next(null);
        this.destroy.complete();
        $(this.nativeElement).removeData('listItemContext');
    }
}
