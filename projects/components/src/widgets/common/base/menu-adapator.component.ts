import { AfterViewInit, QueryList, ViewChildren } from '@angular/core';

import { StylableComponent } from './stylable.component';
import { MenuComponent } from '../menu/menu.component';

declare const _;

const menuProps = ['itemlabel', 'itemicon', 'itemlink', 'itemaction', 'itemchildren', 'userrole'];

export class MenuAdapterComponent extends StylableComponent implements AfterViewInit {

    private itemlabel;
    private menuRef;
    private pageScope;

    private binditemlabel;
    private binditemicon;
    private binditemaction;
    private binditemchildren;
    private binditemlink;
    private binduserrole;

    @ViewChildren(MenuComponent) private menuRefQL: QueryList<MenuComponent>;

    constructor(
        inj,
        WIDGET_CONFIG,
    ) {
        super(inj, WIDGET_CONFIG);

        this.pageScope = this.viewParent;
        this.binditemlabel = this.nativeElement.getAttribute('itemlabel.bind');
        this.binditemicon = this.nativeElement.getAttribute('itemicon.bind');
        this.binditemaction = this.nativeElement.getAttribute('itemaction.bind');
        this.binditemlink = this.nativeElement.getAttribute('itemlink.bind');
        this.binduserrole = this.nativeElement.getAttribute('userrole.bind');
        this.binditemchildren = this.nativeElement.getAttribute('itemchildren.bind');
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (_.includes(menuProps, key) && this.menuRef) {
            this.menuRef.itemlabel = nv;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        const subscriber = this.menuRefQL.changes.subscribe((menuRefQL: QueryList<MenuComponent>) => {
            if (menuRefQL.first) {
                this.menuRef = menuRefQL.first;
                menuProps.forEach((prop) => {
                    const bindProp = `bind${prop}`;
                    if (this[bindProp]) {
                        this.menuRef[bindProp] = this[bindProp];
                    }
                    this.menuRef[prop] = this[prop];
                });
                subscriber.unsubscribe();
            }
        });
    }
}
