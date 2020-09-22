import { AfterContentInit, Attribute, ChangeDetectorRef, Component, ContentChild, ElementRef, Injector } from '@angular/core';

import { debounceTime } from 'rxjs/operators';

import { $appDigest, AbstractDialogService, App, getClonedObject, isDefined, triggerFn } from '@wm/core';
import { provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { TableComponent } from '@wm/components/data/table';

import { registerProps } from './live-table.props';

declare const _;
declare var $: any;

const DEFAULT_CLS = 'app-livegrid';
const WIDGET_CONFIG = {widgetType: 'wm-livetable', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmLiveTable]',
    templateUrl: './live-table.component.html',
    providers: [
        provideAsWidgetRef(LiveTableComponent)
    ]
})
export class LiveTableComponent extends StylableComponent implements AfterContentInit {
    static initializeProps = registerProps();
    @ContentChild(TableComponent) table: TableComponent;

    form;
    isLayoutDialog: boolean;

    private dialogId;
    private $queue = [];

    private tableOptions: any = {
        'multiselect': false,
        'setGridEditMode': ''
    };

    constructor(
        inj: Injector,
        elRef: ElementRef,
        cdr: ChangeDetectorRef,
        private dialogService: AbstractDialogService,
        private app: App,
        @Attribute('formlayout') layoutType: string,
        @Attribute('dialogid') dialogId: string
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        if (layoutType === 'dialog') {
            this.isLayoutDialog = true;
            this.dialogId = dialogId;
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        if (this.table) {
            this.table._liveTableParent = this;
            this.table.datagridElement.datatable('option', this.tableOptions);

            this.table.selectedItemChange$
                .pipe(debounceTime(250))
                .subscribe(this.onSelectedItemChange.bind(this));

            if (!this.isLayoutDialog && !this.form) {
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

    openDialog() {
        this.dialogService.open(this.dialogId);
        $appDigest();
    }

    closeDialog() {
        this.dialogService.close(this.dialogId);
    }

    focusFirstInput() {
        const $firstInput = $(this.form.$element).find('[role="input"]').first();
        $firstInput.focus();
        $firstInput.select();
    }

    onDialogOpen() {
        this.focusFirstInput();
    }

    setFormData(val) {
        if (!this.form.isDestroyed) {
            this.form.getWidget().formdata = val;
        }
    }

    private _addNewRow() {
        this.form.isSelected = true;
        this.setFormData('');

        this.form.new();

        if (this.isLayoutDialog) {
            this.onDialogOpen();
        }
    }

    addNewRow() {
        if (this.isLayoutDialog) {
            this.openDialog();
            this.$queue.push(this._addNewRow.bind(this));
            return;
        }

       this._addNewRow();
    }

    private _updateRow(row, eventName) {
        this.setFormData(row);
        this.form.isSelected = true;
        this.form.edit();

        if (this.isLayoutDialog) {
            this.form.isUpdateMode = (eventName === 'dblclick') ? this.form.updateMode : true;
            this.onDialogOpen();
        }
    }

    updateRow(row, eventName) {

        if (this.isLayoutDialog) {
            this.openDialog();
            this.$queue.push(this._updateRow.bind(this, row, eventName));
            return;
        }

        this._updateRow(row, eventName);
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

            this.setFormData(getClonedObject(rowData));
            /*If the form is already in update mode, call the form update function*/
            if (this.form.isUpdateMode) {
                this.form.edit();
            }
        } else {
            this.form.isSelected = false;
            this.setFormData('');
            this.form.clearData();
        }
    }

    onCancel() {
        this.form.isUpdateMode = false;
        if (this.isLayoutDialog) {
            this.closeDialog();
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
                this.closeDialog();
            }
        }
    }

    showErrorMessage() {
        this.app.notifyApp(this.appLocale.LABEL_ACCESS_DENIED, 'error');
    }

    // In dialog mode, on form render call the queued functions
    onFormReady(form) {
        this.form = form;
        setTimeout(() => {
            triggerFn(this.$queue.pop());
        });
    }
}
