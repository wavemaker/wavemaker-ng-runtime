import { AfterContentInit, ChangeDetectorRef, Component, ContentChild, ElementRef, Injector } from '@angular/core';

import { getClonedObject, isDefined } from '@wm/core';

import { styler } from '../../framework/styler';
import { registerProps } from './live-table.props';
import { FormComponent } from '../form/form.component';
import { TableComponent } from '../table/table.component';
import { DialogService } from '../dialog/dialog.service';
import { StylableComponent } from '../base/stylable.component';

declare const _;
declare const moment;
declare var $: any;

registerProps();

const DEFAULT_CLS = 'app-livegrid';
const WIDGET_CONFIG = {widgetType: 'wm-livetable', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLiveTable]',
    templateUrl: './live-table.component.html'
})
export class LiveTableComponent extends StylableComponent implements AfterContentInit {

    @ContentChild(FormComponent) form: FormComponent;
    @ContentChild(TableComponent) table: TableComponent;

    private isLayoutDialog;

    private tableOptions = {
        'multiselect': false,
        'setGridEditMode': '',
        'onRowDelete': this.deleteRow
    };

    focusFirstInput() {
        const $firstInput = $(this.form.$element).find('[role="input"]:first');
        $firstInput.focus();
        $firstInput.select();
    }

    onDialogOpen() {
        setTimeout(() => {
            this.focusFirstInput();
        }, 100);
    }

    deleteRow(row, callBackFn?) {
        this.form.getWidget().rowdata = row;
        this.form.delete(callBackFn);
    }

    addNewRow() {
        this.form.isSelected = true;
        this.form.getWidget().rowdata = '';

        this.form.new();

        if (this.isLayoutDialog) {
            this.toggleDialogVisibility(true);
        }
    }

    toggleDialogVisibility(flag) {
        const dialogId = this.form.dialogId;
        if (flag) {
            this.dialogService.openDialog(dialogId);
            this.onDialogOpen();
        } else {
            this.dialogService.closeDialog(dialogId);
        }
    }

    onPropertyChange(key, nv) {
        if (key === 'formlayout' && nv === 'dialog') {
            this.isLayoutDialog = true;
            this.form.isLayoutDialog = true;
        }
    }

    updateRow(row, eventName) {

        if (!this.form) {
            return;
        }

        this.form.getWidget().rowdata = row;
        this.form.isSelected = true;
        this.form.edit();

        if (this.isLayoutDialog) {
            this.form.isUpdateMode = (eventName === 'dblclick') ? this.form.updateMode : true;
            this.toggleDialogVisibility(true);
        }
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

            this.form.getWidget().rowdata = getClonedObject(rowData);
            /*If the form is already in update mode, call the form update function*/
            if (this.form.isUpdateMode) {
                this.form.edit();
            }
        } else {
            this.form.isSelected = false;
            this.form.getWidget().rowdata = '';
            this.form.clearData();
        }
    }

    onCancel() {
        this.form.isUpdateMode = false;
        if (this.isLayoutDialog) {
            this.toggleDialogVisibility(false);
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
                this.toggleDialogVisibility(false);
            }
        }
    }

    showErrorMessage() {
        // TODO: wmToaster.show('error', 'ERROR', $rs.appLocale.LABEL_ACCESS_DENIED);
    }

    ngAfterContentInit() {
        if (this.form) {
            this.form._liveTableParent = this;
        }
        if (this.table) {
            this.table._liveTableParent = this;
            this.table.datagridElement.datatable('option', this.tableOptions);

            this.table.selectedItemChange$.subscribe(this.onSelectedItemChange.bind(this));

            if (!this.form) {
                this.table.datagridElement.datatable('option', {
                    'beforeRowUpdate' : () => {
                        this.showErrorMessage();
                    },
                    'beforeRowDelete' : () => {
                        this.showErrorMessage();
                    },
                    'beforeRowInsert' : () => {
                        this.showErrorMessage();
                    }
                });
            }
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private dialogService: DialogService) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
