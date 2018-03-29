import { ChangeDetectorRef, Directive, ElementRef, Injector, OnInit, Optional, SkipSelf } from '@angular/core';
import { provideTheParent, TableGroupParent, TableParent } from '../parent';
import { setHeaderConfigForTable } from '../../../utils/live-utils';
import { registerProps } from './table-column-group.props';
import { BaseComponent } from '../../base/base.component';

registerProps();
const WIDGET_CONFIG = {widgetType: 'wm-table-column-group', hostClass: ''};

@Directive({
    selector: '[wmTableColumnGroup]',
    providers: [provideTheParent(TableGroupParent, TableColumnGroupDirective)]
})
export class TableColumnGroupDirective extends BaseComponent implements TableGroupParent, OnInit {

    accessroles;
    backgroundcolor;
    caption;
    colClass;
    name;
    textalignment;

    public config;

    constructor(@SkipSelf() @Optional() public _groupParent: TableGroupParent,
                @Optional() public _tableParent: TableParent,
                inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    populateConfig() {
        this.config = {
            field: this.name,
            displayName: this.caption,
            columns: [],
            isGroup: true,
            accessroles: this.accessroles,
            textAlignment: this.textalignment || 'center',
            backgroundColor: this.backgroundcolor,
            class: this.colClass
        };
    }

    ngOnInit() {
        super.ngOnInit();
        this.populateConfig();
        setHeaderConfigForTable(this._tableParent.headerConfig, this.config, this._groupParent && this._groupParent.name);
    }
}
