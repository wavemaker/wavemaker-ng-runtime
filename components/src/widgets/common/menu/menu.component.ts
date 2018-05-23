import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { addClass, removeClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { MenuRef } from '../../framework/types';
import { provideAs, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './menu.props';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';

registerProps();

declare const $, _;

const POSITION = {
    DOWN_RIGHT: 'down,right',
    DOWN_LEFT: 'down,left',
    UP_RIGHT: 'up,right',
    UP_LEFT: 'up,left',
    INLINE: 'inline'
};

const WIDGET_CONFIG = {widgetType: 'wm-menu', hostClass: 'dropdown app-menu'};
const CARET_CLS = {
    UP: 'fa-caret-up',
    DOWN: 'fa-caret-down'
};
const PULL_CLS = {
    LEFT: 'pull-left',
    RIGHT: 'pull-right'
};
@Component({
    selector: '[wmMenu]',
    templateUrl: './menu.component.html',
    providers: [
        provideAsWidgetRef(MenuComponent),
        provideAs(MenuComponent, MenuRef)
    ]
})
export class MenuComponent extends DatasetAwareNavComponent implements OnInit, OnDestroy {

    public menualign: string;
    public linktarget: string;
    public animateitems: string;
    public menuclass: string = '';
    public iconclass: string = '';
    public menuposition: string;
    public menulayout: string;

    private menuCaret: string = 'fa-caret-down';

    select = new Subject();
    constructor(
        inj: Injector
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    private setMenuPosition() {
        switch (this.menuposition) {
            case POSITION.DOWN_RIGHT:
                removeClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.LEFT;
                this.menuCaret = CARET_CLS.DOWN;
                break;
            case POSITION.DOWN_LEFT:
                removeClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.RIGHT;
                this.menuCaret = CARET_CLS.DOWN;
                break;
            case POSITION.UP_LEFT:
                addClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.RIGHT;
                this.menuCaret = CARET_CLS.UP;
                break;
            case POSITION.UP_RIGHT:
                addClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.LEFT;
                this.menuCaret = CARET_CLS.UP;
                break;
            case POSITION.INLINE:
                this.menualign = 'dropinline-menu';
                break;
        }
    }

    public onSelect(args) {
        // emit the values to the subscribers as menu is also used as a dynamic component
        this.select.next(args);
        this.invokeEventCallback('select', args);
    }

    onPropertyChange(key, newVal, oldVal?) {
        super.onPropertyChange(key, newVal, oldVal);
    }

    ngOnInit() {
        super.ngOnInit();
        this.setMenuPosition();
        this.registerDestroyListener(() => this.select.complete());
    }
}
