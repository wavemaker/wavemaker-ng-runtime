import {Component, ContentChild, AfterContentInit, ElementRef, Injector, ChangeDetectorRef, forwardRef} from '@angular/core';
import {styler} from '../../utils/styler';
import {BaseComponent} from '../base/base.component';
import {registerProps} from './live-table.props';
import {FormComponent} from '../../widgets/form/form.component';
import {TableComponent} from '../../widgets/table/table.component';
import {getClonedObject, isDefined} from '@utils/utils';

declare const _;
declare const moment;
declare var $: any;

registerProps();

export abstract class LiveTableParent {
    abstract updateRow(row, eventName);

    abstract addNewRow();

    abstract deleteRow(row, callBackFn?);
}

const DEFAULT_CLS = 'app-livegrid';
const WIDGET_CONFIG = {widgetType: 'wm-livetable', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLiveTable]',
    templateUrl: './live-table.component.html',
    providers: [{provide: LiveTableParent, useExisting: forwardRef(() => LiveTableComponent)}]
})
export class LiveTableComponent extends BaseComponent implements AfterContentInit {

    @ContentChild(FormComponent) form: FormComponent;
    @ContentChild(TableComponent) table: TableComponent;

    private isLayoutDialog;

    private tableOptions = {
        'multiselect': false,
        'setGridEditMode': '',
        'onRowDelete': this.deleteRow
    };

    deleteRow(row, callBackFn?) {
        this.form.widget.rowdata = row;
        this.form.delete(callBackFn);
    }

    addNewRow() {
        this.form.isSelected = true;
        this.form.widget.rowdata = '';

        this.form.new();

        // TODO: Layout Dialog
    }

    updateRow(row, eventName) {

        if (!this.form) {
            return;
        }

        this.form.widget.rowdata = row;
        this.form.isSelected = true;
        this.form.edit();

        // TODO: Layout Dialog
    }

    onSelectedItemChange(newValue) {
        let rowData;
        if (!this.form || !this.table) {
            return;
        }

        if (newValue && newValue.length > 0 && !this.form.isSelected) {
            this.form.isSelected = true;
        }

        /*Update the rowdata of only that grid form that is associated with the specific grid on which row selection is being performed...
         * Since both the grid & gridform are associated with the same "parentgrid", match the same*/
        if (newValue && newValue.length > 0) {
            if (this.table.multiselect) {
                rowData = newValue[0];
            } else {
                rowData = newValue[newValue.length - 1];
            }

            this.form.widget.rowdata = getClonedObject(rowData);
            /*If the form is already in update mode, call the form update function*/
            if (this.form.isUpdateMode) {
                this.form.edit();
            }
        } else {
            this.form.isSelected = false;
            this.form.widget.rowdata = '';
            // this.form.clearData();
        }
    }

    onResult(operation, response, newForm, updateMode) {
        this.form.isUpdateMode = isDefined(updateMode) ? updateMode : newForm ? true : false;
        switch (operation) {
            case 'insert':
                if (newForm) {
                    /*if new form is to be shown after insert, skip the highlight of the row*/
                    this.table.gridfirstrowselect = false;
                    this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response, true);
                } else {
                    /*The new row would always be inserted at the end of all existing records. Hence navigate to the last page and highlight the inserted row.*/
                    this.table.initiateSelectItem(this.table.getNavigationTargetBySortInfo(), response);
                }
                break;
            case 'update':
                /*The updated row would be found in the current page itself. Hence simply highlight the row in the current page.*/
                if (newForm) {
                    this.table.gridfirstrowselect = false;
                    this.table.initiateSelectItem('current', response, true);
                } else {
                    this.table.initiateSelectItem('current', response);
                }
                break;
            case 'delete':
                this.table.onRecordDelete();
                break;
        }
        this.table.updateVariable();
        if (this.isLayoutDialog) {
            /*if new form is to be shown after update or insert, don't close the dialog*/
            if (newForm) {
                if (operation === 'insert') {
                    this.form.new();
                } else if (operation === 'update') {
                    this.form.edit();
                }
            } else {
                // DialogService.hideDialog(scope.gridform._dialogid);
            }
        }
    }


    ngAfterContentInit() {
        this.form._liveTableParent = this;
        this.table.datagridElement.datatable('option', this.tableOptions);

        this.table.selectedItemChange$.subscribe(this.onSelectedItemChange.bind(this));
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }
}
