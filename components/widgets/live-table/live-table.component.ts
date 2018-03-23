import { Component, ContentChild, AfterContentInit, ElementRef, Injector, ChangeDetectorRef, forwardRef } from '@angular/core';
import { styler } from '../../utils/styler';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './live-table.props';
import { FormComponent } from '../../widgets/form/form.component';
import { TableComponent } from '../../widgets/table/table.component';
import { getClonedObject } from '@utils/utils';

declare const _;
declare const moment;
declare var $: any;

registerProps();

export abstract class LiveTableParent {
    abstract updateRow(row, eventName);
    abstract addNewRow();
}

const DEFAULT_CLS = 'app-livegrid';
const WIDGET_CONFIG = {widgetType: 'wm-livetable', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLiveTable]',
    templateUrl: './live-table.component.html',
    providers: [{provide: LiveTableParent, useExisting: forwardRef(() => LiveTableComponent)}]
})
export class LiveTableComponent extends BaseComponent implements AfterContentInit {

    @ContentChild(FormComponent) formInstance: FormComponent;
    @ContentChild(TableComponent) tableInstance: TableComponent;


    addNewRow() {
        this.formInstance.isSelected = true;
        this.formInstance.widget.rowdata = '';

        this.formInstance.new();

        // TODO: Layout Dialog
    }

    updateRow(row, eventName) {

        if (!this.formInstance) {
            return;
        }

        this.formInstance.widget.rowdata = row;
        this.formInstance.isSelected = true;
        this.formInstance.edit();

        // TODO: Layout Dialog
    }


    ngAfterContentInit() {
        this.tableInstance.selectedItemChange$.subscribe((newValue: any) => {
            let rowData;
            if (!this.formInstance || !this.tableInstance) {
                return;
            }

            if (newValue && newValue.length > 0 && !this.formInstance.isSelected) {
                this.formInstance.isSelected = true;
            }

            /*Update the rowdata of only that grid form that is associated with the specific grid on which row selection is being performed...
             * Since both the grid & gridform are associated with the same "parentgrid", match the same*/
            if (newValue && newValue.length > 0) {
                if (this.tableInstance.multiselect) {
                    rowData = newValue[0];
                } else {
                    rowData = newValue[newValue.length - 1];
                }

                this.formInstance.widget.rowdata = getClonedObject(rowData);
                /*If the form is already in update mode, call the form update function*/
                if (this.formInstance.isUpdateMode) {
                    this.formInstance.edit();
                }
            } else {
                this.formInstance.isSelected = false;
                this.formInstance.widget.rowdata = '';
                // this.formInstance.clearData();
            }
        });
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }
}
