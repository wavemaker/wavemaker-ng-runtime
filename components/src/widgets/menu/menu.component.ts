import { Component, forwardRef, Injector, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { $appDigest, addClass, findValueOf, isObject, removeClass, validateAccessRoles } from '@wm/utils';

import { styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { getEvaluatedData, invokeEventHandler } from '../../utils/widget-utils';
import { registerProps } from './menu.props';
import { getOrderedDataSet } from '../../utils/form-utils';

registerProps();

declare const $, _;

// Marker class, used as an interface
export abstract class MenuParent {
    itemaction?: string;
    linktarget?: string;
    animateitems?: string;
    menuposition?: string;
    menulayout?: string;
    menualign?: string;
    onSelect?;
    animateClass?;
}

// Helper method to provide the current component instance in the name of a `parentType`.
// The `parentType` defaults to `Parent` when omitting the second parameter.
export const provideParent =
    (component: any, parentType?: any) => {
        return { provide: parentType || MenuParent, useExisting: forwardRef(() => component) };
    };

const POSITION = {
    DOWN_RIGHT: 'down,right',
    DOWN_LEFT: 'down,left',
    UP_RIGHT: 'up,right',
    UP_LEFT: 'up,left',
    INLINE: 'inline'
};

const WIDGET_CONFIG = {widgetType: 'wm-menu', hostClass: ''};
const CARET_UP_CLS = 'fa-caret-up';
const CARET_DOWN_CLS = 'fa-caret-down';
const PULL_LEFT = 'pull-left';
const PULL_RIGHT = 'pull-right';

@Component({
    selector: '[wmMenu]',
    templateUrl: './menu.component.html',
    providers: [{provide: MenuParent, useExisting: forwardRef(() => MenuComponent)}]
})
export class MenuComponent extends BaseComponent implements MenuParent, OnInit, OnDestroy {

    orderby;
    userrole;
    datafield;
    displayfield;
    itemlabel;
    type = 'menu';
    hint = '';
    menualign = '';
    menulayout = '';
    menuItems;
    menuCaret = 'fa-caret-down';

    itemaction: string;
    linktarget: string;
    animateitems: string = '';
    menuposition: string;
    animateClass = '';
    menuclass = '';
    iconclass = '';

    // explicitly defined OnInit to be triggered when the widget is created dynamically
    _ngOnInit;

    select = new Subject();

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this as IStylableComponent);
    }

    onPropertyChange(key, newVal, oldVal?) {
        switch (key) {
            case 'scopedataset':
            case 'dataset':
                this.itemlabel = this.itemlabel || this.displayfield;
                this.menuItems = this.getMenuItems(newVal.data || newVal);
                break;
            case 'menuposition':
                switch (newVal) {
                    case POSITION.DOWN_RIGHT:
                        removeClass(this.nativeElement, 'dropup');
                        this.menualign = PULL_LEFT;
                        this.menuCaret = CARET_DOWN_CLS;
                        break;
                    case POSITION.DOWN_LEFT:
                        removeClass(this.nativeElement, 'dropup');
                        this.menualign = PULL_RIGHT;
                        this.menuCaret = CARET_DOWN_CLS;
                        break;
                    case POSITION.UP_LEFT:
                        addClass(this.nativeElement, 'dropup');
                        this.menualign = PULL_RIGHT;
                        this.menuCaret = CARET_UP_CLS;
                        break;
                    case POSITION.UP_RIGHT:
                        addClass(this.nativeElement, 'dropup');
                        this.menualign = PULL_LEFT;
                        this.menuCaret = CARET_UP_CLS;
                        break;
                    case POSITION.INLINE:
                        this.menualign = 'dropinline-menu';
                        break;
                }
                $appDigest();
                break;
        }
    }

    getMenuItems(newVal) {
        let menuItems = [],
            transformFn;
        if (typeof newVal === 'string') {
            menuItems = newVal.split(',').map(function (item) {
                const _val = item && item.trim();
                return {
                    label: _val,
                    value: _val
                };
            });
        } else if (Array.isArray(newVal)) {
            newVal = getOrderedDataSet(newVal, this.orderby);
            if (isObject(newVal[0])) {
                transformFn = (result, item) => {
                    const children = (getEvaluatedData(item, {expressionName: 'itemchildren'}) || item.children);

                    if (validateAccessRoles(item[this.userrole])) {
                        result.push({
                            label: getEvaluatedData(item, {expressionName: 'itemlabel'}) || item.label,
                            icon: getEvaluatedData(item, {expressionName: 'itemicon'}) || item.icon,
                            disabled: item.disabled,
                            link: getEvaluatedData(item, {expressionName: 'itemlink'}) || item.link,
                            value: this.datafield ? (this.datafield === 'All Fields' ? item : findValueOf(item, this.datafield)) : item,
                            children: (Array.isArray(children) ? children : []).reduce(transformFn, []),
                            action: getEvaluatedData(item, {expressionName: 'itemaction'}) || item.action,
                            role: getEvaluatedData(item, {expressionName: 'userrole'})
                        });
                    }

                    return result;
                };
                menuItems = newVal.reduce(transformFn, []);
            } else {
                menuItems = newVal.map(function (item) {
                    return {
                        label: item,
                        value: item
                    };
                });
            }
        }

        return menuItems;
    }

    onSelect(args) {
        // emit the values to the subscribers as menu is also used as a dynamic component
        this.select.next(args);
        invokeEventHandler(this, 'change', args);
    }

    ngOnInit() {
        super.ngOnInit();
        // condition validates to true when the widget is created dynamically e.g from nav widget
        if (this._ngOnInit) {
            this._ngOnInit();
        }
        this.registerDestroyListener(() => this.select.complete());
    }
}
