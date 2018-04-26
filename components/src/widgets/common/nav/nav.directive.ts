import { AfterViewInit, ComponentFactoryResolver, Directive, forwardRef, Injector, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

import { $appDigest, addClass, isObject, validateAccessRoles } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './nav.props';
import { isActiveNavItem } from '../../../utils/widget-utils';
import { getOrderedDataSet } from '../../../utils/form-utils';
import { MenuComponent } from '../menu/menu.component';

registerProps();

const DEFAULT_CLS = 'nav app-nav';
const WIDGET_CONFIG = {widgetType: 'wm-nav', hostClass: DEFAULT_CLS};

declare const _, $;

@Directive({
    selector: '[wmNav]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => NavDirective)}
    ]
})
export class NavDirective extends StylableComponent implements AfterViewInit, OnInit {

    _nodes;
    nodes;
    dataset;
    itemicon;
    itemlabel;
    itemlink;
    itembadge;
    itemchildren;
    itemaction;
    userrole;
    autoclose;
    orderby;
    newcolumns;
    selecteditem;
    menuComponents = [];

    getNodes(nv = this.dataset) {
        let nodes = [];
        if (typeof nv === 'string') {
            nv = _.trim(nv);
            if (nv) {
                nodes = nv.split(',').map(function (item) {
                    return {
                        'label': _.trim(item)
                    };
                });
            }
        } else if (Array.isArray(nv)) {
            nv = getOrderedDataSet(nv, this.orderby);
            nodes = nv;
        } else if (isObject(nv)) {
            nodes = [nv];
        }
        /* re-initialize the property values */
        if (this.newcolumns) {
            this.newcolumns   = false;
            this.itemlabel    = '';
            this.itemchildren = '';
            this.itemicon     = '';
            this.itemlink     = '';
        }
        return nodes;
    }

    destroyMenuComponents() {
        this.menuComponents.forEach((cmp) => {
            cmp.destroy();
        });
        this.menuComponents = [];
    }

    constructNav() {
        const $el = $(this.nativeElement);
        $el.empty();
        // destroy the previously created dynamic menu components
        this.destroyMenuComponents();
        this._nodes = [];

        if (this.nodes && this.nodes.length) {
            const iconField = this.itemicon || 'icon',
                labelField = this.itemlabel || 'label',
                itemField = this.itemlink || 'link',
                badgeField = this.itembadge || 'badge',
                childrenField = this.itemchildren || 'children',
                actionField = this.itemaction || 'action',
                userRole = this.userrole;

            this.nodes = this.nodes.reduce((result, node, index) => {
                if (validateAccessRoles(node[userRole])) {
                    result.push(node);
                    const $a = $('<a class="app-anchor"></a>'),
                        $a_caption = $('<span class="anchor-caption"></span>'),
                        $li = $('<li class="app-nav-item"></li>').data('node-data', node),
                        $i = $('<i class="app-nav-icon"></i>'),
                        $badge = $('<span class="badge"></span>'),
                        itemLabel = node[labelField],
                        itemClass = node[iconField],
                        itemLink = node[itemField],
                        itemBadge = node[badgeField],
                        itemAction = node[actionField],
                        itemChildren = node[childrenField];

                    // menu widget expects data as an array.
                    // push the current object as an array into the internal array
                    this._nodes[index] = node[childrenField];
                    // itemLink can be #/routeName or #routeName
                    if (isActiveNavItem(itemLink, this.route.url)) {
                        $li.addClass('active');
                    }

                    if (itemChildren && Array.isArray(itemChildren)) {
                        // create dynamic menu component for the nav widget
                        const factory = this.componentFactoryResolver.resolveComponentFactory(MenuComponent);
                        const newMenuCmp = this.vcr.createComponent(factory);
                        const menuCmpIns = newMenuCmp.instance;
                        // this function will be executed on Init of the widget
                        menuCmpIns._ngOnInit = () => {
                            Object.assign(menuCmpIns, {
                                caption: itemLabel,
                                itemlabel: labelField,
                                itemlink: itemField,
                                itemaction: itemAction,
                                itemicon: iconField,
                                itemchildren: childrenField,
                                userrole: userRole,
                                type: 'anchor',
                                iconclass: itemClass || ''
                            });
                            // set the values on the proxy instance so the onPropertyChange will be triggered
                            menuCmpIns.getWidget().dataset = this._nodes[index];
                            menuCmpIns.getWidget().autoclose = this.autoclose;
                            // subscribe to the select event in the menu widget to notify the nav directive
                            menuCmpIns.select.asObservable().subscribe((e: any) => {
                                this._onMenuItemSelect(e.$event, e.$item);
                            });
                            $appDigest();
                            this.menuComponents.push(newMenuCmp);
                        };
                        $li.append(newMenuCmp.location.nativeElement);
                        $el.append($li);
                    } else {
                        $i.addClass(itemClass);
                        $a.append($a_caption.html(itemLabel)).prepend($i);
                        if (itemBadge) {
                            $a.append($badge.html(itemBadge));
                        }
                        $li.append($a);
                        $el.append($li);
                    }
                }

                return result;

            }, []);
        }
    }

    _onMenuItemSelect(e, $item) {
        this.selecteditem = $item;
        this.invokeEventCallback('select', {$event: e, $item});
    }

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'type':
                let _cls = '';
                if (nv === 'pills') {
                    _cls = 'nav-pills';
                } else if (nv === 'tabs') {
                    _cls = 'nav-tabs';
                } else if (nv === 'navbar') {
                    _cls = 'navbar-nav';
                }
                addClass(this.nativeElement, _cls);
                break;
            case 'layout':
                addClass(this.nativeElement, `nav-${nv}`);
                break;
            case 'dataset':
                this.nodes = this.getNodes();
                this.constructNav();
                break;
            case 'itemicon':
            case 'itemlabel':
            case 'itemlink':
            case 'itemchildren':
            case 'orderby':
                this.constructNav();
                break;
        }
    }

    constructor(
        inj: Injector,
        private route: Router,
        private vcr: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.registerDestroyListener(() => this.destroyMenuComponents());
    }

    ngAfterViewInit() {
        const $el = $(this.nativeElement);
        /* Element on select functionality */
        $el.on('click.on-select', '.app-anchor', (e) => {
            const $target    = $(e.target),
                $li        = $target.closest('.app-nav-item');
            let itemLink,
                itemAction;
            $li.closest('ul.app-nav').children('li.app-nav-item').removeClass('active');
            $li.addClass('active');
            this.selecteditem = $li.data('node-data');
            this.invokeEventCallback('select', {$event: e, $item: this.selecteditem});

            if (this.selecteditem) {
                itemLink   = this.selecteditem[this.itemlink] || this.selecteditem.link;
                itemAction = this.selecteditem[this.itemaction] || this.selecteditem.action;
                if (itemAction) {
                    // TODO: Evaluating the action expression
                    /*Utils.evalExp($el.scope(), itemAction).then(function () {
                        if (itemLink) {
                            $window.location.href = itemLink;
                        }
                    });*/
                } else if (itemLink) {
                    // If action is not present and link is there
                    window.location.href = itemLink;
                }
            }
        });
    }
}
