import { Component, Injector, OnDestroy, OnInit, Input } from '@angular/core';

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
const CARET_CLS = {
    UP: 'fa-caret-up',
    DOWN: 'fa-caret-down'
};
const PULL_CLS = {
    LEFT: 'pull-left',
    RIGHT: 'pull-right'
};

const WIDGET_CONFIG = {widgetType: 'wm-menu', hostClass: 'dropdown app-menu'};
@Component({
    selector: '[wmMenu]',
    templateUrl: './menu.component.html',
    providers: [
        provideAsWidgetRef(MenuComponent),
        provideAs(MenuComponent, MenuRef)
    ],
    exportAs: 'wmMenu'
})
export class MenuComponent extends DatasetAwareNavComponent implements OnInit, OnDestroy {

    public menualign: string;
    public menuposition: string;
    public menulayout: string;
    public menuclass: string;

    public linktarget: string;
    public iconclass: string;

    public autoclose: string;
    public animateitems: string;

    private menuCaret: string = 'fa-caret-down';

    @Input() isDataComputed: boolean = false;

    constructor(
        inj: Injector
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        this.setMenuPosition();
    }

    onPropertyChange(key, newVal, oldVal?) {
        if (!this.isDataComputed) {
            super.onPropertyChange(key, newVal, oldVal);
        } else if (key === 'dataset') {
            this.nodes = newVal;
        }
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
        args.$item = this.trimNode(args.$item);
        this.invokeEventCallback('select', args);
    }

}
