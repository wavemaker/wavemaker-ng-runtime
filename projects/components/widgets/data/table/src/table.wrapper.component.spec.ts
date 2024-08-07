import { waitForAsync, ComponentFixture, fakeAsync, tick, discardPeriodicTasks } from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { TrustAsPipe } from "../../../../base/src/pipes/trust-as.pipe";;
import { FormBuilder } from "@angular/forms";
import { App, AppDefaults, DynamicComponentRefProvider, AbstractI18nService, Viewport } from "@wm/core";
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WmComponentsModule } from '@wm/components/base';
import { BasicModule } from '@wm/components/basic';
import { InputModule } from '@wm/components/input';
import { MenuModule } from '@wm/components/navigation/menu';
import { ListModule } from '@wm/components/data/list';
import { IMaskModule } from 'angular-imask';
import { TableComponent } from './table.component';
import { TableCUDDirective } from './table-cud.directive';
import { TableFilterSortDirective } from './table-filter.directive';
import { TableActionDirective } from './table-action/table-action.directive';
import { TableColumnDirective } from './table-column/table-column.directive';
import { TableColumnGroupDirective } from './table-column-group/table-column-group.directive';
import { TableRowDirective } from './table-row/table-row.directive';
import { TableRowActionDirective } from './table-row-action/table-row-action.directive';
import { VALIDATOR } from '@wm/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { fullNameValidator, registerFullNameValidator, nameComparisionValidator } from 'projects/components/base/src/test/util/validations-test-util';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import { compileTestComponent, mockApp, mockViewport } from "projects/components/base/src/test/util/component-test-util";
import { PaginationComponent } from '@wm/components/data/pagination';
import "./datatable.js"
import { DateComponent } from "../../../input/epoch/src/date/date.component";
import { TimeComponent } from "../../../input/epoch/src/time/time.component";

const quick_edit_markup = `<div wmTable wmTableFilterSort wmTableCUD #table_1 data-identifier="table" tabindex="0" editmode="quickedit"
                                name="UserTable1" title="User List" navigation="Basic" filtermode="search" isdynamictable="false" rowselect.event="UserTable1Rowselect($event, widget, row)">

                                <div wmTableColumn index="0" headerIndex="0" binding="firstname" caption="Firstname" edit-widget-type="text" type="string"
                                    mobiledisplay="false" searchable="true" show="true" readonly="false" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="firstname">
                                            <wm-input #inlineWidget wmFormWidget key="firstname" data-field-name="firstname"
                                                formControlName="firstname" type="text" aria-describedby="Enter text"></wm-input>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="firstname">
                                            <wm-input #inlineWidgetNew wmFormWidget key="firstname" data-field-name="firstname"
                                                formControlName="firstname_new" type="text" aria-describedby="Enter text">
                                            </wm-input>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="lastname" index="1" headerIndex="1" caption="Lastname" edit-widget-type="text" type="string" mobiledisplay="false"
                                    searchable="false" show="true" readonly="false" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="lastname">
                                            <wm-input #inlineWidget wmFormWidget key="lastname" data-field-name="lastname"
                                                formControlName="lastname" type="text" aria-describedby="Enter text"></wm-input>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="lastname">
                                            <wm-input #inlineWidgetNew wmFormWidget key="lastname" data-field-name="lastname"
                                                formControlName="lastname_new" type="text" aria-describedby="Enter text"></wm-input>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="age" index="2" headerIndex="2" caption="Age" edit-widget-type="number" type="number" mobiledisplay="false"
                                    searchable="false" show="true" readonly="undefined" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="age">
                                            <div wmNumber #inlineWidget wmFormWidget key="age" data-field-name="age" formControlName="age"
                                                type="number" aria-label="Only numbers"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="age">
                                            <div wmNumber #inlineWidgetNew wmFormWidget key="age" data-field-name="age" formControlName="age_new"
                                                type="number" aria-label="Only numbers"></div>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="dateofbirth" index="3" headerIndex="3" caption="Dateofbirth" edit-widget-type="date" type="date"
                                    mobiledisplay="false" searchable="false" show="true" readonly="undefined" formatpattern="toDate"
                                    customExpression="true" [formGroup]="table_1.ngform">

                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="dateofbirth">
                                            <div wmDate dataentrymode="undefined" #inlineWidget wmFormWidget key="dateofbirth"
                                                data-field-name="dateofbirth" formControlName="dateofbirth"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="dateofbirth">
                                            <div wmDate dataentrymode="undefined" #inlineWidgetNew wmFormWidget key="dateofbirth"
                                                data-field-name="dateofbirth" formControlName="dateofbirth_new"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #customExprTmpl let-row="row" let-colDef="colDef" let-editRow="editRow" let-deleteRow="deleteRow"
                                        let-addNewRow="addNewRow">
                                        <div data-col-identifier="dateofbirth"
                                            title="{{row.getProperty('dateofbirth') | toDate: colDef.datepattern}}">
                                            {{row.getProperty('dateofbirth') | toDate: colDef.datepattern}}</div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="timeofbirth" index="4" headerIndex="4" caption="Timeofbirth" edit-widget-type="time" type="time"
                                    mobiledisplay="false" searchable="false" show="true" readonly="undefined" formatpattern="toDate"
                                    customExpression="true" [formGroup]="table_1.ngform">

                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="timeofbirth">
                                            <div wmTime dataentrymode="undefined" #inlineWidget wmFormWidget key="timeofbirth"
                                                data-field-name="timeofbirth" formControlName="timeofbirth"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="timeofbirth">
                                            <div wmTime dataentrymode="undefined" #inlineWidgetNew wmFormWidget key="timeofbirth"
                                                data-field-name="timeofbirth" formControlName="timeofbirth_new"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #customExprTmpl let-row="row" let-colDef="colDef" let-editRow="editRow" let-deleteRow="deleteRow"
                                        let-addNewRow="addNewRow">
                                        <div data-col-identifier="timeofbirth"
                                            title="{{row.getProperty('timeofbirth') | toDate: colDef.datepattern}}">
                                            {{row.getProperty('timeofbirth') | toDate: colDef.datepattern}}</div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="rowOperations" caption="Actions" width="120px" edit-widget-type="text" type="custom"
                                    readonly="true" sortable="false" searchable="false" show="true" [formGroup]="table_1.ngform">
                                </div>
                                <div wmTableRowAction key="deleterow" display-name show="true" class="btn-transparent" iconclass="wi wi-trash"
                                    title="Delete" action="deleteRow($event)" disabled="false" widget-type="button">
                                    <ng-template #rowActionTmpl let-row="row">
                                        <button wmButton data-action-key="deleterow" caption="" show="true" hint="Delete" disabled="false"
                                            class="row-action row-action-button btn-transparent delete delete-row-button" iconclass="wi wi-trash"
                                            click.event.delayed="deleteRow($event)" type="button"></button>
                                    </ng-template>
                                </div>
                            </div>`;

const inline_edit_markup = `<div wmTable wmTableFilterSort wmTableCUD #table_1 data-identifier="table" tabindex="0" editmode="inline"
                                name="UserTable1" title="User List" navigation="Basic" isdynamictable="false" filtermode="multicolumn" >

                                <div wmTableColumn index="0" headerIndex="0" binding="firstname" caption="Firstname" edit-widget-type="text" type="string"
                                    mobiledisplay="false" searchable="false" show="true" readonly="false" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="firstname">
                                            <wm-input #inlineWidget wmFormWidget key="firstname" data-field-name="firstname"
                                                formControlName="firstname" type="text" aria-describedby="Enter text"></wm-input>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="lastname" index="1" headerIndex="1" caption="Lastname" edit-widget-type="text" type="string" mobiledisplay="false"
                                    searchable="false" show="true" readonly="false" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="lastname">
                                            <wm-input #inlineWidget wmFormWidget key="lastname" data-field-name="lastname"
                                                formControlName="lastname" type="text" aria-describedby="Enter text"></wm-input>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="age" index="2" headerIndex="2" caption="Age" edit-widget-type="number" type="number" mobiledisplay="false"
                                    searchable="false" show="true" readonly="false" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="age">
                                            <div wmNumber #inlineWidget wmFormWidget key="age" data-field-name="age" formControlName="age"
                                                type="number" aria-label="Only numbers"></div>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="dateofbirth" index="3" headerIndex="3" caption="Dateofbirth" edit-widget-type="date" type="date"
                                    mobiledisplay="false" searchable="false" show="true" readonly="undefined" formatpattern="toDate"
                                    customExpression="true" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="dateofbirth">
                                            <div wmDate dataentrymode="undefined" #inlineWidget wmFormWidget key="dateofbirth"
                                                data-field-name="dateofbirth" formControlName="dateofbirth"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #customExprTmpl let-row="row" let-colDef="colDef" let-editRow="editRow" let-deleteRow="deleteRow"
                                        let-addNewRow="addNewRow">
                                        <div data-col-identifier="dateofbirth"
                                            title="{{row.getProperty('dateofbirth') | toDate: colDef.datepattern}}">
                                            {{row.getProperty('dateofbirth') | toDate: colDef.datepattern}}</div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="timeofbirth"  index="4" headerIndex="4" caption="Timeofbirth" edit-widget-type="time" type="time"
                                    mobiledisplay="false" searchable="false" show="true" readonly="undefined" formatpattern="toDate"
                                    customExpression="true" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="timeofbirth">
                                            <div wmTime dataentrymode="undefined" #inlineWidget wmFormWidget key="timeofbirth"
                                                data-field-name="timeofbirth" formControlName="timeofbirth"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #customExprTmpl let-row="row" let-colDef="colDef" let-editRow="editRow" let-deleteRow="deleteRow"
                                        let-addNewRow="addNewRow">
                                        <div data-col-identifier="timeofbirth"
                                            title="{{row.getProperty('timeofbirth') | toDate: colDef.datepattern}}">
                                            {{row.getProperty('timeofbirth') | toDate: colDef.datepattern}}</div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn binding="rowOperations" caption="Actions" width="120px" edit-widget-type="text" type="custom"
                                    readonly="true" sortable="false" searchable="false" show="true" [formGroup]="table_1.ngform">
                                </div>

                                <div name="addNewRow" wmTableAction key="addNewRow" display-name="New" show="true" class="btn-primary"
                                    iconclass="wi wi-plus" title="New" action="addNewRow()" shortcutkey disabled="false" widget-type="button"></div>

                                <div wmTableRowAction key="updaterow" display-name show="true" class="btn-transparent" iconclass="wi wi-pencil"
                                    title="Edit" action="editRow($event)" disabled="false" widget-type="button">
                                    <ng-template #rowActionTmpl let-row="row">
                                        <button wmButton data-action-key="updaterow" caption="" show="true" hint="Edit" disabled="false"
                                            class="row-action row-action-button btn-transparent edit edit-row-button" iconclass="wi wi-pencil"
                                            click.event.delayed="editRow($event)" type="button"></button>
                                        <button type="button" aria-label="Save edit icon"
                                            class="save row-action-button btn app-button btn-transparent save-edit-row-button hidden" title="Save">
                                            <i class="wi wi-done" aria-hidden="true"></i>
                                        </button>
                                        <button type="button" aria-label="Cancel edit icon"
                                            class="cancel row-action-button btn app-button btn-transparent cancel-edit-row-button hidden"
                                            title="Cancel">
                                            <i class="wi wi-cancel" aria-hidden="true"></i>
                                        </button>
                                    </ng-template>
                                </div>

                                <div wmTableRowAction key="deleterow" display-name show="true" class="btn-transparent" iconclass="wi wi-trash"
                                    title="Delete" action="deleteRow($event)" disabled="false" widget-type="button">
                                    <ng-template #rowActionTmpl let-row="row">
                                        <button wmButton data-action-key="deleterow" caption="" show="true" hint="Delete" disabled="false"
                                            class="row-action row-action-button btn-transparent delete delete-row-button" iconclass="wi wi-trash"
                                            click.event.delayed="deleteRow($event)" type="button"></button>
                                    </ng-template>
                                </div>
                            </div>`;

const summary_row_markup = `<div wmTable wmTableFilterSort wmTableCUD #table_1 data-identifier="table" tabindex="0" editmode="quickedit"
                                name="UserTable1" title="User List" navigation="Basic" isdynamictable="false"
                                beforedatarender.event="UserTable1Beforedatarender(widget, data, columns)">

                                <div wmTableColumn index="0" headerIndex="0" binding="exam" caption="Exam" edit-widget-type="text" type="string"
                                    mobiledisplay="false" searchable="false" show="true" readonly="false" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="exam">
                                            <wm-input #inlineWidget wmFormWidget key="exam" data-field-name="exam"
                                                formControlName="exam" type="text" aria-describedby="Enter text"></wm-input>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="exam">
                                            <wm-input #inlineWidgetNew wmFormWidget key="exam" data-field-name="exam"
                                                formControlName="exam_new" type="text" aria-describedby="Enter text">
                                            </wm-input>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn index="1" headerIndex="1" binding="science" caption="Science" edit-widget-type="number" type="number" mobiledisplay="false"
                                    searchable="false" show="true" readonly="undefined" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="science">
                                            <div wmNumber #inlineWidget wmFormWidget key="science" data-field-name="science" formControlName="science"
                                                type="number" aria-label="Only numbers"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="science">
                                            <div wmNumber #inlineWidgetNew wmFormWidget key="science" data-field-name="science" formControlName="science_new"
                                                type="number" aria-label="Only numbers"></div>
                                        </div>
                                    </ng-template>
                                </div>

                                <div wmTableColumn index="2" headerIndex="2" binding="arts" caption="Arts" edit-widget-type="number" type="number" mobiledisplay="false"
                                    searchable="false" show="true" readonly="undefined" [formGroup]="table_1.ngform">
                                    <ng-template #inlineWidgetTmpl let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatus="getPendingSpinnerStatus">
                                        <div data-col-identifier="arts">
                                            <div wmNumber #inlineWidget wmFormWidget key="arts" data-field-name="arts" formControlName="arts"
                                                type="number" aria-label="Only numbers"></div>
                                        </div>
                                    </ng-template>
                                    <ng-template #inlineWidgetTmplNew let-row="row" let-getControl="getControl"
                                        let-getValidationMessage="getValidationMessage" let-getPendingSpinnerStatusNew="getPendingSpinnerStatusNew">
                                        <div data-col-identifier="arts">
                                            <div wmNumber #inlineWidgetNew wmFormWidget key="arts" data-field-name="arts" formControlName="arts_new"
                                                type="number" aria-label="Only numbers"></div>
                                        </div>
                                    </ng-template>
                                </div>
                            </div>`;

const testData: any = [
    {
        firstname: "admin",
        lastname: "adminpass",
        age: 42,
        dateofbirth: "2019-12-12",
        timeofbirth: "10:00:00"
    }, {
        firstname: "user",
        lastname: "userpass",
        age: 28,
        dateofbirth: "2019-12-12",
        timeofbirth: "10:00:00"
    }, {
        firstname: "other",
        lastname: "otherpass",
        age: 23,
        dateofbirth: "2019-12-12",
        timeofbirth: "10:00:00"
    }
];

const summaryRowData: any = [
    {
        exam: "Internal",
        science: 20,
        arts: 5
    },
    {
        exam: "External",
        science: 44,
        arts: 29
    }
];

@Component({
    template: quick_edit_markup
})

class TableWrapperComponent {
    @ViewChild(TableComponent, /* TODO: add static flag */ { static: true })
    wmComponent: TableComponent;
}

let imports = [
    BrowserAnimationsModule,
    BasicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputModule,
    ListModule,
    MenuModule,
    IMaskModule,
    WmComponentsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDropdownModule.forRoot()
]

let declarations = [
    TrustAsPipe,
    TableComponent,
    TableCUDDirective,
    TableFilterSortDirective,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableRowDirective,
    PaginationComponent,
    TableRowActionDirective,
    DateComponent,
    TimeComponent
]

let providers = [
    { provide: App, useValue: mockApp },
    { provide: Viewport, useValue: mockViewport },
    { provide: AppDefaults, useClass: AppDefaults },
    { provide: FormBuilder, useClass: FormBuilder },
    { provide: DynamicComponentRefProvider, useValue: mockApp },
    { provide: DatePipe, useClass: DatePipe },
    { provide: DecimalPipe, useClass: DecimalPipe },
    { provide: AbstractI18nService, useClass: MockAbstractI18nService }
]

const testModuleDef: ITestModuleDef = {
    imports: imports,
    declarations: [...declarations, TableWrapperComponent],
    providers: providers,
    teardown: { destroyAfterEach: false }
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(quick_edit_markup),
    type: 'wm-Table',
    widgetSelector: '[wmTable]',
    inputElementSelector: 'input.app-textbox',
    testModuleDef: testModuleDef,
    testComponent: TableWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();  /* to be fixed for isdynamictable property issue */
// TestBase.verifyCommonProperties(); /* to be fixed for tabindex property issue */
TestBase.verifyStyles();


const clickEditElement = (isNewRow, fixture) => {
    const selector = isNewRow ? 'tr.app-datagrid-row:first-child>td' : 'tr.app-datagrid-row:first-child>td .edit-row-button';
    fixture.debugElement.nativeElement.querySelector(selector).click();
}

const defaultValidators = (
    isNewRow,
    validatorType,
    errorType,
    validator,
    errorMsg,
    formField,
    fixture,
    invalidTestValue,
    validTestValue
) => {
    const validatorObj = {
        type: validatorType,
        validator: validator,
        errorMessage: errorMsg
    };

    formField.setValidators([validatorObj]);
    formField.applyValidations([validatorObj]);

    if (isNewRow) {
        formField.applyNewRowValidations();
        // New row
        let formFieldControlNew = formField.getFormControl('_new');
        // Positive case
        formFieldControlNew.setValue(invalidTestValue);
        expect(formFieldControlNew.valid).toBeFalsy();
        expect(formFieldControlNew.errors[errorType]).toBeTruthy();
        // Negetive case
        formFieldControlNew.setValue(validTestValue);
        expect(formFieldControlNew.valid).toBeTruthy();
    }

    clickEditElement(isNewRow, fixture);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
        let formFieldControl = formField.getFormControl();
        // Positive case
        formFieldControl.setValue(invalidTestValue);
        expect(formFieldControl.valid).toBeFalsy();
        expect(formFieldControl.errors[errorType]).toBeTruthy();
        // Negetive case
        formFieldControl.setValue(validTestValue);
        expect(formFieldControl.valid).toBeTruthy();
    });
}

const dateValidators = (
    isNewRow,
    validatorType,
    validator,
    errorMsg,
    wmComponent,
    fixture,
    invalidTestValue,
    validTestValue
) => {
    let formField = (wmComponent as any).fullFieldDefs[3];
    const validatorObj = {
        type: validatorType,
        validator: validator,
        errorMessage: errorMsg
    };

    formField.setValidators([validatorObj]);
    formField.applyValidations([validatorObj]);

    clickEditElement(isNewRow, fixture);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
        let formFieldControl = formField.getFormControl();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            // Positive case
            formFieldControl.setValue(invalidTestValue);
            expect(formFieldControl.valid).toBeFalsy();
            // Negetive case
            formFieldControl.setValue(validTestValue);
            expect(formFieldControl.valid).toBeTruthy();

            if (isNewRow) {
                formField.applyNewRowValidations();
                // New row
                let formFieldControlNew = formField.getFormControl('_new');
                // Positive case
                formFieldControlNew.setValue(invalidTestValue);
                expect(formFieldControlNew.valid).toBeFalsy();
                // Negetive case
                formFieldControlNew.setValue(validTestValue);
                expect(formFieldControlNew.valid).toBeTruthy();
            }
        });
    });
}

const customValidatorSync = (isNewRow, wmComponent, fixture) => {
    const invalidTestValue = 'test';
    const validTestValue = 'test12345';
    let formField = (wmComponent as any).fullFieldDefs[0];
    formField.setValidators([fullNameValidator]);
    formField.applyValidations([fullNameValidator]);

    if (isNewRow) {
        formField.applyNewRowValidations();
        // New row
        let formFieldControlNew = formField.getFormControl('_new');
        // Positive case
        formFieldControlNew.setValue(invalidTestValue);
        expect(formFieldControlNew.valid).toBeFalsy();
        expect(formFieldControlNew.errors.errorMessage).toEqual('Enter your full name.');
        // Negetive case
        formFieldControlNew.setValue(validTestValue);
        expect(formFieldControlNew.valid).toBeTruthy();
    }

    // Normal row
    clickEditElement(isNewRow, fixture);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
        let formFieldControl = formField.getFormControl();
        // Positive case
        formFieldControl.setValue(invalidTestValue);
        expect(formFieldControl.valid).toBeFalsy();
        expect(formFieldControl.errors.errorMessage).toEqual('Enter your full name.');
        // Negetive case
        formFieldControl.setValue(validTestValue);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(formFieldControl.valid).toBeTruthy();
        });
    });
}

const defaultAndCustomValidator = (isNewRow, wmComponent, fixture) => {
    const invalidTestValue = 'test';
    const validTestValue = 'test12345';
    let formField = (wmComponent as any).fullFieldDefs[0];
    const validatorObj = {
        type: VALIDATOR.REQUIRED,
        validator: true,
        errorMessage: "This field cannot be empty."
    };

    formField.setValidators([validatorObj, fullNameValidator]);
    formField.applyValidations([validatorObj, fullNameValidator]);

    if (isNewRow) {
        formField.applyNewRowValidations();
        // New row
        let formFieldControlNew = formField.getFormControl('_new');
        formFieldControlNew.setValue('');
        expect(formFieldControlNew.valid).toBeFalsy();
        expect(formFieldControlNew.errors.required).toBeTruthy();
        // Positive case
        formFieldControlNew.setValue(invalidTestValue);
        expect(formFieldControlNew.valid).toBeFalsy();
        expect(formFieldControlNew.errors.errorMessage).toEqual('Enter your full name.');
        // Negetive case
        formFieldControlNew.setValue(validTestValue);
        expect(formFieldControlNew.valid).toBeTruthy();
    }

    // Normal row
    clickEditElement(isNewRow, fixture);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
        let formFieldControl = formField.getFormControl();
        formFieldControl.setValue('');
        expect(formFieldControl.valid).toBeFalsy();
        expect(formFieldControl.errors.required).toBeTruthy();
        // Positive case
        formFieldControl.setValue(invalidTestValue);
        expect(formFieldControl.valid).toBeFalsy();
        expect(formFieldControl.errors.errorMessage).toEqual('Enter your full name.');
        // Negetive case
        formFieldControl.setValue(validTestValue);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(formFieldControl.valid).toBeTruthy();
        });
    });
}

const observeValidator = (isNewRow, wmComponent, fixture) => {
    const invalidTestValue = 'test';
    const validTestValue = 'valid';
    let firstnameFormField = (wmComponent as any).fullFieldDefs[0];
    let lastnameFormField = (wmComponent as any).fullFieldDefs[1];
    firstnameFormField.setValidators([nameComparisionValidator]);
    fixture.detectChanges();
    fixture.whenStable().then(() => {
        // Normal row
        let firstnameFormFieldControl = firstnameFormField.getFormControl();
        let lastnameFormFieldControl = lastnameFormField.getFormControl();
        clickEditElement(isNewRow, fixture);
        tick(500);
        firstnameFormField.datavalue = invalidTestValue;
        firstnameFormField.observeOn(['lastname']);
        firstnameFormField.applyValidations([nameComparisionValidator]);
        // As the Form is not touched the validations are not triggering,
        // So programatically setting the control as touched
        lastnameFormFieldControl.markAsTouched();
        // Positive case
        lastnameFormField.datavalue = invalidTestValue;
        // Added tick to kick in depended control validators
        tick(500);
        // expect(firstnameFormFieldControl.isValid).toBeFalsy();
        // expect(firstnameFormFieldControl.errors.errorMessage).toEqual('First name and last name cannot be same.');
        // Negetive case
        lastnameFormField.datavalue = validTestValue;
        // Added tick to kick in depended control validators
        tick(500);
        expect(firstnameFormFieldControl.valid).toBeTruthy();
        discardPeriodicTasks();
    });

    if (isNewRow) {
        let firstnameFormFieldControlNew = firstnameFormField.getFormControl('_new');
        let lastnameFormFieldControlNew = lastnameFormField.getFormControl('_new');
        // New row
        firstnameFormFieldControlNew.setValue(invalidTestValue);
        firstnameFormField.observeOn(['lastname']);
        firstnameFormField.applyNewRowValidations();
        // As the Form is not touched the validations are not triggering,
        // So programatically setting the control as touched
        lastnameFormFieldControlNew.markAsTouched();
        // Positive case
        lastnameFormFieldControlNew.setValue(invalidTestValue);
        // Added tick to kick in depended control validators
        tick(500);
        // expect(firstnameFormFieldControlNew.valid).toBeFalsy();
        // expect(firstnameFormFieldControlNew.errors.errorMessage).toEqual('First name and last name cannot be same.');
        // Negetive case
        lastnameFormFieldControlNew.setValue(validTestValue);
        // Added tick to kick in depended control validators
        tick(500);
        expect(firstnameFormFieldControlNew.valid).toBeTruthy();
    }
}

const customValidatorAsync = (isNewRow, wmComponent, fixture) => {
    const invalidTestValue = 'test';
    const validTestValue = 'valid';
    let formField = (wmComponent as any).fullFieldDefs[0];
    formField.setAsyncValidators([registerFullNameValidator]);
    formField.applyValidations([registerFullNameValidator]);

    if (isNewRow) {
        formField.applyNewRowValidations();
        // New row
        let formFieldControlNew = formField.getFormControl('_new');
        formFieldControlNew.setValue(invalidTestValue);
        // Added tick let the asyncronous call complete
        tick(500);
        expect(formFieldControlNew.valid).toBeFalsy();
        expect(formFieldControlNew.errors.errorMessage).toEqual('The email address is already registered.');
        // Negetive case
        formFieldControlNew.setValue(validTestValue);
        tick(500);
        expect(formFieldControlNew.valid).toBeTruthy();
    }

    // Normal row
    clickEditElement(isNewRow, fixture);
    tick(500);
    let formFieldControl = formField.getFormControl();
    formFieldControl.setValue(invalidTestValue);
    // Added tick let the asyncronous call complete
    tick(500);
    expect(formFieldControl.valid).toBeFalsy();
    expect(formFieldControl.errors.errorMessage).toEqual('The email address is already registered.');
    // Negetive case
    formFieldControl.setValue(validTestValue);
    tick(500);
    expect(formFieldControl.valid).toBeTruthy();
    discardPeriodicTasks();
}

const getSummaryContainer = (fixture) => {
    const debugEl = fixture.debugElement.nativeElement;
    return debugEl.querySelector(".app-datagrid-footer");
}

describe("DataTable", () => {
    describe("Create Operation", () => {
        describe("Read Only", () => {
            describe("Details Below", () => {
                it("To Do", () => { });
            });
            describe("Simple View Only", () => {
                it("To Do", () => { });
            });
        });
        describe("Editable", () => {
            describe("Form As Dialog", () => {
                it("To Do", () => { });
            });
            describe("Form Below", () => {
                it("To Do", () => { });
            });
            describe("Inline Editable", () => {
                @Component({
                    template: inline_edit_markup
                })
                class InlineTableWrapperComponent {
                    @ViewChild(TableComponent, /* TODO: add static flag */ { static: true })
                    wmComponent: TableComponent;
                }

                const inlineTestModuleDef: ITestModuleDef = {
                    imports: imports,
                    declarations: [...declarations, InlineTableWrapperComponent],
                    providers: providers,
                    teardown: { destroyAfterEach: false }
                };

                let wrapperComponent: InlineTableWrapperComponent;
                let wmComponent: TableComponent;
                let inline_edit_fixture: ComponentFixture<InlineTableWrapperComponent>;

                beforeEach(waitForAsync(() => {
                    inline_edit_fixture = compileTestComponent(inlineTestModuleDef, InlineTableWrapperComponent);
                    wrapperComponent = inline_edit_fixture.componentInstance;
                    wmComponent = wrapperComponent.wmComponent;
                    wmComponent.populateGridData(testData);
                    inline_edit_fixture.detectChanges();
                }));

                it("Should create the component", () => {
                    expect(wmComponent).toBeDefined();
                });

                it('should trigger default required validator', waitForAsync(() => {
                    const invalidTestValue = '';
                    const validTestValue = 'test';
                    defaultValidators(
                        false,
                        VALIDATOR.REQUIRED,
                        'required',
                        true,
                        'This field cannot be empty.',
                        (wmComponent as any).fullFieldDefs[0],
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger default regexp validator', waitForAsync(() => {
                    const invalidTestValue = 'test';
                    const validTestValue = 'test@test.com';
                    defaultValidators(
                        false,
                        VALIDATOR.REGEXP,
                        'pattern',
                        /\w+@\w+\.\w{2,3}/,
                        'Not a Valid Email.',
                        (wmComponent as any).fullFieldDefs[0],
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger default maxchars validator', waitForAsync(() => {
                    const invalidTestValue = 'test12345';
                    const validTestValue = 'test';
                    defaultValidators(
                        false,
                        VALIDATOR.MAXCHARS,
                        'maxlength',
                        5,
                        'Text is too long.',
                        (wmComponent as any).fullFieldDefs[0],
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger default minvalue validator', waitForAsync(() => {
                    const invalidTestValue = 15;
                    const validTestValue = 18;
                    defaultValidators(
                        false,
                        VALIDATOR.MINVALUE,
                        'min',
                        validTestValue,
                        'Under age.',
                        (wmComponent as any).fullFieldDefs[2],
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger default maxvalue validator', waitForAsync(() => {
                    const invalidTestValue = 20;
                    const validTestValue = 18;
                    defaultValidators(
                        false,
                        VALIDATOR.MAXVALUE,
                        'max',
                        validTestValue,
                        'Over age.',
                        (wmComponent as any).fullFieldDefs[2],
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the mindate validation', waitForAsync(() => {
                    const invalidTestValue = '2019-11-02';
                    const validTestValue = '2019-12-05';
                    dateValidators(
                        false,
                        VALIDATOR.MINDATE,
                        '2019-12-02',
                        'Minimum date.',
                        wmComponent,
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the maxdate validation', waitForAsync(() => {
                    const invalidTestValue = '2019-12-05';
                    const validTestValue = '2019-11-02';
                    dateValidators(
                        false,
                        VALIDATOR.MAXDATE,
                        '2019-12-02',
                        'Maximum date.',
                        wmComponent,
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the excludedays validation', waitForAsync(() => {
                    const invalidTestValue = '2019-12-30';
                    const validTestValue = '2019-12-29';
                    dateValidators(
                        false,
                        VALIDATOR.EXCLUDEDAYS,
                        '1,6',
                        'Excluded days.',
                        wmComponent,
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the excludedate validation', waitForAsync(() => {
                    const invalidTestValue = '2020-01-01';
                    const validTestValue = '2020-01-02';
                    dateValidators(
                        false,
                        VALIDATOR.EXCLUDEDATES,
                        '2020-01-01',
                        'Excluded dates.',
                        wmComponent,
                        inline_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));


                it('should trigger custom validator(sync)', waitForAsync(() => {
                    customValidatorSync(false, wmComponent, inline_edit_fixture);
                }));

                it('should trigger default and custom validator', waitForAsync(() => {
                    defaultAndCustomValidator(false, wmComponent, inline_edit_fixture);
                }));

                it('should trigger observe validator', fakeAsync(() => {
                    observeValidator(false, wmComponent, inline_edit_fixture);
                }));

                it('should trigger custom validator(async)', fakeAsync(() => {
                    customValidatorAsync(false, wmComponent, inline_edit_fixture);
                }));

                it("Should add new row when clicked on add new row button", () => {
                    const debugEl = inline_edit_fixture.debugElement.nativeElement;
                    const addNewRowBtnEl = debugEl.querySelector(".app-datagrid-actions button");
                    addNewRowBtnEl.click();
                    inline_edit_fixture.detectChanges();
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row");
                    expect(tableRowEls.length).toEqual(4);
                });

                it('should update when click update button', () => {
                    clickEditElement(false, inline_edit_fixture);
                    const rowEl = inline_edit_fixture.debugElement.nativeElement.querySelector('tr.app-datagrid-row:first-child')
                    rowEl.querySelector('td .save-edit-row-button').click();
                    inline_edit_fixture.detectChanges();
                    expect(rowEl.querySelector('td .save-edit-row-button').classList.contains('hidden')).toBeTruthy();
                });

                it('should show mutlicolumn filter', () => {
                    const debugEl = inline_edit_fixture.debugElement.nativeElement;
                    const filterRowElem = debugEl.querySelector(".filter-row");
                    expect(filterRowElem).toBeDefined()
                });

            });

            describe("Quick Edit", () => {
                @Component({
                    template: quick_edit_markup
                })
                class QuickEditTableWrapperComponent {
                    @ViewChild(TableComponent, /* TODO: add static flag */ { static: true })
                    wmComponent: TableComponent;
                    UserTable1Rowselect($event, widget, row) {
                        console.log('Row Selected');
                        console.log(row);
                    }
                }

                const quickeditTestModuleDef: ITestModuleDef = {
                    imports: imports,
                    declarations: [...declarations, QuickEditTableWrapperComponent],
                    providers: providers,
                    teardown: { destroyAfterEach: false }
                };

                let wrapperComponent: QuickEditTableWrapperComponent;
                let wmComponent: TableComponent;
                let quick_edit_fixture: ComponentFixture<QuickEditTableWrapperComponent>;

                beforeEach(waitForAsync(() => {
                    quick_edit_fixture = compileTestComponent(quickeditTestModuleDef, QuickEditTableWrapperComponent);
                    wrapperComponent = quick_edit_fixture.componentInstance;
                    wmComponent = wrapperComponent.wmComponent;
                    wmComponent.populateGridData(testData);
                    quick_edit_fixture.detectChanges();
                }));

                it("Should create the component", () => {
                    expect(wmComponent).toBeDefined();
                });

                it("Should have a editable new row ", () => {
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row.always-new-row.row-editing");
                    expect(tableRowEls.length).toEqual(1);
                });

                it("Should have a editable new row in the end", () => {
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const lastRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row:last-child");
                    expect(
                        lastRowEls[0].matches(".app-datagrid-row.always-new-row.row-editing")
                    ).toBeTruthy();
                });

                it("Should have a editable new row with all the columns of the loaded data in the end", () => {
                    const newRowEl = quick_edit_fixture.debugElement.nativeElement.querySelector(
                        ".always-new-row.row-editing"
                    );
                    const newRowColEls = newRowEl.querySelectorAll("td");
                    expect(newRowColEls.length - 1).toEqual(
                        Object.keys(testData[0]).length
                    );
                });

                it("Should have a new row with all the columns of data in the end with empty value", () => {
                    const newRowEl = quick_edit_fixture.debugElement.nativeElement.querySelector(
                        ".always-new-row.row-editing"
                    );
                    const newRowColEls = newRowEl.querySelectorAll("td input.form-control");
                    let emptyColCount = Array.prototype.filter.call(
                        newRowColEls,
                        el => el.value === ""
                    ).length;
                    expect(emptyColCount).toEqual(
                        Object.keys(testData[0]).length
                    );
                });

                it('should trigger default required validator', waitForAsync(() => {
                    const invalidTestValue = '';
                    const validTestValue = 'test';
                    defaultValidators(
                        true,
                        VALIDATOR.REQUIRED,
                        'required',
                        true,
                        'This field cannot be empty.',
                        (wmComponent as any).fullFieldDefs[0],
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger default regexp validator', waitForAsync(() => {
                    const invalidTestValue = 'test';
                    const validTestValue = 'test@test.com';
                    defaultValidators(
                        true,
                        VALIDATOR.REGEXP,
                        'pattern',
                        /\w+@\w+\.\w{2,3}/,
                        'Not a Valid Email.',
                        (wmComponent as any).fullFieldDefs[0],
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger default maxchars validator', waitForAsync(() => {
                    const invalidTestValue = 'test12345';
                    const validTestValue = 'test';
                    defaultValidators(
                        true,
                        VALIDATOR.MAXCHARS,
                        'maxlength',
                        5,
                        'Text is too long.',
                        (wmComponent as any).fullFieldDefs[0],
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger default minvalue validator', waitForAsync(() => {
                    const invalidTestValue = 15;
                    const validTestValue = 18;
                    defaultValidators(
                        true,
                        VALIDATOR.MINVALUE,
                        'min',
                        validTestValue,
                        'Under age.',
                        (wmComponent as any).fullFieldDefs[2],
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                /* TODO: Need to add testcase for WMS-20545 Trigger select event when only one column is editable */
                it("Should make row editable when clicked on a column having customExpression", () => {
                    jest.spyOn(wrapperComponent, 'UserTable1Rowselect');
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row:first-child");
                    const tableColEls = tableRowEls[0].querySelectorAll("td.app-datagrid-cell > div");
                    tableColEls[0].click();
                    expect(wrapperComponent.UserTable1Rowselect).toHaveBeenCalledTimes(1);
                    expect(
                        tableRowEls[0].matches(".app-datagrid-row.row-editing")
                    ).toBeTruthy();
                });

                xit('should trigger default maxvalue validator', waitForAsync(() => {
                    const invalidTestValue = 20;
                    const validTestValue = 18;
                    defaultValidators(
                        true,
                        VALIDATOR.MAXVALUE,
                        'max',
                        validTestValue,
                        'Over age.',
                        (wmComponent as any).fullFieldDefs[2],
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the mindate validation', waitForAsync(() => {
                    const invalidTestValue = '2019-11-02';
                    const validTestValue = '2019-12-05';
                    dateValidators(
                        true,
                        VALIDATOR.MINDATE,
                        '2019-12-02',
                        'Minimum date.',
                        wmComponent,
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the maxdate validation', waitForAsync(() => {
                    const invalidTestValue = '2019-12-05';
                    const validTestValue = '2019-11-02';
                    dateValidators(
                        true,
                        VALIDATOR.MAXDATE,
                        '2019-12-02',
                        'Maximum date.',
                        wmComponent,
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the excludedays validation', waitForAsync(() => {
                    const invalidTestValue = '2019-12-30';
                    const validTestValue = '2019-12-29';
                    dateValidators(
                        true,
                        VALIDATOR.EXCLUDEDAYS,
                        '1,6',
                        'Excluded days.',
                        wmComponent,
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should respect the excludedate validation', waitForAsync(() => {
                    const invalidTestValue = '2020-01-01';
                    const validTestValue = '2020-01-02';
                    dateValidators(
                        true,
                        VALIDATOR.EXCLUDEDATES,
                        '2020-01-01',
                        'Excluded dates.',
                        wmComponent,
                        quick_edit_fixture,
                        invalidTestValue,
                        validTestValue
                    );
                }));

                it('should trigger custom validator(sync)', waitForAsync(() => {
                    customValidatorSync(true, wmComponent, quick_edit_fixture);
                }));

                it('should trigger default and custom validator', waitForAsync(() => {
                    defaultAndCustomValidator(true, wmComponent, quick_edit_fixture);
                }));

                it('should trigger observe validator', fakeAsync(() => {
                    observeValidator(true, wmComponent, quick_edit_fixture);
                }));

                it('should trigger custom validator(async)', fakeAsync(() => {
                    customValidatorAsync(true, wmComponent, quick_edit_fixture);
                }));

                it('should sort the column on click of the column header', () => {
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const tableHeaderEl = debugEl.querySelectorAll(".app-datagrid-header-cell");
                    tableHeaderEl[0].click();
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row");
                    const firstRowColEls = tableRowEls[0].querySelectorAll("td");
                    expect(firstRowColEls[0].textContent.trim()).toEqual('admin');
                });

                it('should sort the column in descending order on click of the column header twice', () => {
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const tableHeaderEl = debugEl.querySelectorAll(".app-datagrid-header-cell");
                    tableHeaderEl[0].click();
                    tableHeaderEl[0].click();
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row");
                    const firstRowColEls = tableRowEls[0].querySelectorAll("td");
                    expect(firstRowColEls[0].textContent.trim()).toEqual('admin');
                });

                it('should filter the data on entering the text in the filter input', async () => {
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const filterSelect = debugEl.querySelector(".form-search select");
                    filterSelect.value = 'firstname';
                    filterSelect.dispatchEvent(new Event('change'));
                    quick_edit_fixture.detectChanges();

                    const filterInputEl = debugEl.querySelector(".form-search input");
                    expect(filterInputEl.attributes['data-element'].value).toEqual('dgSearchText');
                    filterInputEl.value = 'admin';
                    filterInputEl.dispatchEvent(new Event('input'));
                    filterInputEl.dispatchEvent(new Event('keyup'));


                    quick_edit_fixture.detectChanges();

                    await quick_edit_fixture.whenStable();
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row");
                    expect(tableRowEls.length).toEqual(4);
                });

                it('should add load more button to table when data is more than 10', () => {
                    wmComponent.populateGridData(testData.concat(testData).concat(testData).concat(testData).concat(testData));
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row");
                    expect(tableRowEls.length).toEqual(16);
                    const loadMoreBtnEl = debugEl.querySelector(".app-datagrid-load-more");
                    expect(loadMoreBtnEl).toBeDefined();
                });


                it('should open confirmaion dialog on click of delete icon', () => {
                    const debugEl = quick_edit_fixture.debugElement.nativeElement;
                    const tableBodyEl = debugEl.querySelector(".app-datagrid-body");
                    const tableRowEls = tableBodyEl.querySelectorAll("tr.app-datagrid-row");
                    const deleteIconEl = tableRowEls[0].querySelector(".delete-row-button");
                    deleteIconEl.click();
                    const modalEl = document.querySelector(".modal-dialog");
                    expect(modalEl).toBeDefined();
                });


                it("Tab out between columns", () => { });
                it("Tab out of last columns with empty new-row", () => { });
                it("Tab out of last columns with non empty new-row", () => { });
                it("Tab out of last columns with non-empty exisiting row", () => { });
                describe("Pagination", () => {
                    describe("Basic", () => {
                        // ADD COLUMNS STEP
                        it("To Do", () => { });
                    });
                    describe("Pager", () => {
                        it("To Do", () => { });
                    });
                    describe("Classic", () => {
                        it("To Do", () => { });
                    });
                    describe("None", () => {
                        it("To Do", () => { });
                    });
                });
            });

            describe("Summary Row", () => {
                @Component({
                    template: summary_row_markup
                })
                class SummaryRowWrapperComponent {
                    @ViewChild(TableComponent, /* TODO: add static flag */ { static: true })
                    wmComponent: TableComponent;
                    UserTable1Beforedatarender(widget, data, columns) {
                        const internalMarks = data.find(o => o.exam === 'Internal');
                        const externalMarks = data.find(o => o.exam === 'External');

                        const scienceAggregate = columns.science.aggregate;
                        const artsAggregate = columns.arts.aggregate;

                        columns.exam.setSummaryRowData([
                            'Sum',
                            'Average',
                            'Count',
                            'Minimum',
                            'Maximum',
                            'Percent',
                            'Result'
                        ]);
                        columns.science.setSummaryRowData([
                            scienceAggregate.sum(),
                            scienceAggregate.average(),
                            scienceAggregate.count(),
                            scienceAggregate.minimum(),
                            scienceAggregate.maximum(),
                            scienceAggregate.percent(100) + '%',
                            calculateResult('science'),
                            'Total Marks',
                            'Grade'
                        ]);
                        columns.arts.setSummaryRowData([
                            artsAggregate.sum(),
                            artsAggregate.average(),
                            artsAggregate.count(),
                            artsAggregate.minimum(),
                            artsAggregate.maximum(),
                            artsAggregate.percent(100) + '%',
                            calculateResult('arts'),
                            calculateTotal(),
                            evaluateGrade(calculateTotal())
                        ]);

                        function calculateResult(columnName) {
                            if (internalMarks[columnName] >= 10 && externalMarks[columnName] >= 25) {
                                return {
                                    value: 'Pass',
                                    class: 'pass'
                                }
                            } else {
                                return {
                                    value: 'Fail',
                                    class: 'fail'
                                }
                            }
                        }

                        function calculateTotal() {
                            let total = 0;
                            ['science', 'arts'].forEach((item) => {
                                total = total + columns[item].aggregate.sum();
                            });
                            return total;
                        }

                        function evaluateGrade(total) {
                            return new Promise(function (resolve, reject) {
                                setTimeout(() => resolve('B+'), 100);
                            });
                        }
                    };
                }

                const summaryRowTestModuleDef: ITestModuleDef = {
                    imports: imports,
                    declarations: [...declarations, SummaryRowWrapperComponent],
                    providers: providers,
                    teardown: { destroyAfterEach: false }
                };

                let wrapperComponent: SummaryRowWrapperComponent;
                let wmComponent: TableComponent;
                let summary_row_fixture: ComponentFixture<SummaryRowWrapperComponent>;

                beforeEach(waitForAsync(() => {
                    summary_row_fixture = compileTestComponent(summaryRowTestModuleDef, SummaryRowWrapperComponent);
                    wrapperComponent = summary_row_fixture.componentInstance;
                    summary_row_fixture.detectChanges();
                    wmComponent = wrapperComponent.wmComponent;
                    wmComponent.dataset = summaryRowData;
                    wmComponent.populateGridData(summaryRowData);
                }));

                it("Should create the component", () => {
                    expect(wmComponent).toBeDefined();
                });

                it("Should have summary row at the bottom", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    expect(tableSummaryEl).toBeDefined();
                });

                it("Sum aggregate function", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(1)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[0].textContent).toEqual('Sum');
                    expect(summaryColumns[1].textContent).toEqual('64');
                    expect(summaryColumns[2].textContent).toEqual('34');
                });

                it("Average aggregate function", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(2)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[0].textContent).toEqual('Average');
                    expect(summaryColumns[1].textContent).toEqual('32');
                    expect(summaryColumns[2].textContent).toEqual('17');
                });

                it("Count aggregate function", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(3)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[0].textContent).toEqual('Count');
                    expect(summaryColumns[1].textContent).toEqual('2');
                    expect(summaryColumns[2].textContent).toEqual('2');
                });

                it("Minimum aggregate function", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(4)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[0].textContent).toEqual('Minimum');
                    expect(summaryColumns[1].textContent).toEqual('20');
                    expect(summaryColumns[2].textContent).toEqual('5');
                });

                it("Maximum aggregate function", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(5)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[0].textContent).toEqual('Maximum');
                    expect(summaryColumns[1].textContent).toEqual('44');
                    expect(summaryColumns[2].textContent).toEqual('29');
                });

                it("Percent aggregate function and Value concatination", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(6)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[0].textContent).toEqual('Percent');
                    expect(summaryColumns[1].textContent).toEqual('64%');
                    expect(summaryColumns[2].textContent).toEqual('34%');
                });

                it("Object notation custom function with class property", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(7)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[0].textContent).toEqual('Result');
                    expect(summaryColumns[1].textContent).toEqual('Pass');
                    expect(summaryColumns[1].classList).toContain('pass');
                    expect(summaryColumns[2].textContent).toEqual('Fail');
                    expect(summaryColumns[2].classList).toContain('fail');
                });

                it("Custom function in combination with aggregate function", () => {
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(8)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[1].textContent).toEqual('Total Marks');
                    expect(summaryColumns[2].textContent).toEqual('98');
                });

                it("Asyncronous function in combination with aggregate function", fakeAsync(() => {
                    tick(500);
                    const tableSummaryEl = getSummaryContainer(summary_row_fixture);
                    const summaryRow = tableSummaryEl.querySelector("tr.app-datagrid-row:nth-child(9)");
                    const summaryColumns = summaryRow.querySelectorAll("td");
                    expect(summaryColumns[1].textContent).toEqual('Grade');
                    expect(summaryColumns[2].textContent).toEqual('B+');
                    discardPeriodicTasks();
                }));
            });
        });
    });
});
