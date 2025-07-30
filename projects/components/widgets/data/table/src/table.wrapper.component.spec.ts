import { waitForAsync, ComponentFixture, fakeAsync, tick, discardPeriodicTasks } from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { TrustAsPipe } from "../../../../base/src/pipes/trust-as.pipe";;
import { FormBuilder } from "@angular/forms";
import { App, AppDefaults, DynamicComponentRefProvider, AbstractI18nService, Viewport, DataSource, extendProto } from "@wm/core";
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetRef } from '@wm/components/base';
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
import { ButtonComponent, InputNumberComponent, InputTextComponent } from "@wm/components/input";
import { ListComponent } from "@wm/components/data/list";
import { MenuComponent } from "@wm/components/navigation/menu";
import { FormWidgetDirective } from "@wm/components/data/form";

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    extendProto: jest.fn()
}));

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
    ButtonComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    ListComponent,
    FormWidgetDirective,
    MenuComponent,
    IMaskModule,
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

const mockWidgetRef = {
    widget: {
        // Add properties needed by your component
        name: 'TestTable',
        beforedatarender: jest.fn()  // Jest equivalent of jasmine.createSpy
    }
};

let providers = [
    { provide: App, useValue: mockApp },
    { provide: Viewport, useValue: mockViewport },
    { provide: AppDefaults, useClass: AppDefaults },
    { provide: FormBuilder, useClass: FormBuilder },
    { provide: DynamicComponentRefProvider, useValue: mockApp },
    { provide: DatePipe, useClass: DatePipe },
    { provide: DecimalPipe, useClass: DecimalPipe },
    { provide: AbstractI18nService, useClass: MockAbstractI18nService },
    { provide: WidgetRef, useValue: mockWidgetRef }
]

const testModuleDef: ITestModuleDef = {
    imports: [...declarations, ...imports],
    declarations: [TableWrapperComponent],
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
                    imports: [...declarations, ...imports],
                    declarations: [InlineTableWrapperComponent],
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
                describe('handleStateParams', () => {
                    it('should set _selectedItemsExist to true when selectedItem exists', () => {
                        const widgetState = { selectedItem: {} };
                        const options = {};
                        wmComponent['handleStateParams'](widgetState, options);
                        expect(wmComponent['_selectedItemsExist']).toBeTruthy();
                    });

                    it('should set options.page to widgetState.pagination when pagination exists', () => {
                        const widgetState = { pagination: 2 };
                        const options = { options: {} };
                        const result = wmComponent['handleStateParams'](widgetState, options);
                        expect(result.options.page).toBe(2);
                    });

                    it('should call sortStateHandler and set orderBy when sort exists', () => {
                        const widgetState = {
                            pagination: 1,
                            sort: { field: 'name', direction: 'asc' }
                        };
                        const options = { options: {} };
                        jest.spyOn(wmComponent as any, 'sortStateHandler');
                        const result = wmComponent['handleStateParams'](widgetState, options);
                        expect(wmComponent['sortStateHandler']).toHaveBeenCalledWith(widgetState);
                        expect(result.options.orderBy).toBe('name asc');
                    });

                    it('should call searchStateHandler and set filterFields when search exists', (done) => {
                        const widgetState = {
                            pagination: 1,
                            search: 'test'
                        };
                        const options = { options: {} };
                        jest.spyOn(wmComponent as any, 'searchStateHandler');
                        jest.spyOn(wmComponent as any, 'getFilterFields').mockReturnValue(['field1', 'field2']);
                        wmComponent['handleStateParams'](widgetState, options);
                        setTimeout(() => {
                            expect(wmComponent['searchStateHandler']).toHaveBeenCalledWith(widgetState);
                            done();
                        }, 600);
                    });

                    it('should set options.page to 1 when pagination does not exist', () => {
                        const widgetState = {};
                        const options = { options: {} };
                        const result = wmComponent['handleStateParams'](widgetState, options);
                        expect(result.options.page).toBe(1);
                    });

                    it('should handle search and sort when pagination does not exist', (done) => {
                        const widgetState = {
                            search: 'test',
                            sort: { field: 'name', direction: 'desc' }
                        };
                        const options = { options: {} };
                        jest.spyOn(wmComponent as any, 'searchStateHandler');
                        jest.spyOn(wmComponent as any, 'sortStateHandler');
                        jest.spyOn(wmComponent as any, 'getFilterFields').mockReturnValue(['field1', 'field2']);
                        const result = wmComponent['handleStateParams'](widgetState, options);
                        setTimeout(() => {
                            expect(wmComponent['searchStateHandler']).toHaveBeenCalledWith(widgetState);
                            expect(wmComponent['sortStateHandler']).toHaveBeenCalledWith(widgetState);
                            expect(result.options.filterFields).toEqual(['field1', 'field2']);
                            expect(result.options.orderBy).toBe('name desc');
                            done();
                        }, 600);
                    });
                });


                describe('triggerWMEvent', () => {
                    it('should not trigger event if editmode is dialog', () => {
                        wmComponent['editmode'] = 'dialog';
                        const appNotifySpy = jest.spyOn(wmComponent['app'], 'notify');
                        wmComponent['triggerWMEvent']({});
                        expect(appNotifySpy).not.toHaveBeenCalled();
                    });

                    it('should trigger event if editmode is not dialog', () => {
                        wmComponent['editmode'] = 'inline';
                        const appNotifySpy = jest.spyOn(wmComponent['app'], 'notify');
                        const newVal = { id: 1, name: 'Test' };
                        wmComponent['triggerWMEvent'](newVal);
                        expect(appNotifySpy).toHaveBeenCalledWith('wm-event', {
                            eventName: 'selectedItemChange',
                            widgetName: wmComponent.name,
                            row: newVal,
                            table: wmComponent
                        });
                    });
                });

                describe('searchStateHandler', () => {
                    it('should handle array search state', () => {
                        const widgetState = {
                            search: [
                                { field: 'name', value: 'John', matchMode: 'contains', type: 'string' },
                                { field: 'age', value: '30', matchMode: 'equals', type: 'integer' }
                            ]
                        };
                        wmComponent['rowFilter'] = {
                            name: {},
                            age: {}
                        };
                        wmComponent['rowFilterCompliedTl'] = {
                            name: $('<div><input></div>')[0],
                            age: $('<div><input></div>')[0]
                        };
                        wmComponent['searchStateHandler'](widgetState);
                        expect(wmComponent['rowFilter'].name.value).toBe('John');
                        expect(wmComponent['rowFilter'].age.value).toBe('30');
                        expect($(wmComponent['rowFilterCompliedTl'].name).find('input').val()).toBe('John');
                        expect($(wmComponent['rowFilterCompliedTl'].age).find('input').val()).toBe('30');
                    });

                    it('should handle non-array search state', () => {
                        const widgetState = {
                            search: { value: 'searchText', field: 'name' }
                        };
                        const mockGridElement = {
                            find: jest.fn().mockReturnValue({
                                val: jest.fn()
                            })
                        };
                        wmComponent['datagridElement'] = mockGridElement;
                        wmComponent['searchStateHandler'](widgetState);
                        expect(mockGridElement.find).toHaveBeenCalledWith('[data-element="dgSearchText"]');
                        expect(mockGridElement.find).toHaveBeenCalledWith('[data-element="dgFilterValue"]');
                        expect(mockGridElement.find('[data-element="dgSearchText"]').val).toHaveBeenCalledWith('searchText');
                        expect(mockGridElement.find('[data-element="dgFilterValue"]').val).toHaveBeenCalledWith('name');
                    });
                });

                describe('compareFilterExpressions', () => {
                    it('should return true for identical filters', () => {
                        const filters = [
                            { field: 'name', value: 'John' },
                            { field: 'age', value: 30 }
                        ];
                        const result = wmComponent['compareFilterExpressions'](filters, [...filters]);
                        expect(result).toBeTruthy();
                    });

                    it('should return false for different filters', () => {
                        const prevFilters = [
                            { field: 'name', value: 'John' },
                            { field: 'age', value: 30 }
                        ];
                        const newFilters = [
                            { field: 'name', value: 'Jane' },
                            { field: 'age', value: 25 }
                        ];
                        const result = wmComponent['compareFilterExpressions'](prevFilters, newFilters);
                        expect(result).toBeFalsy();
                    });

                    it('should return false for different length filters', () => {
                        const prevFilters = [
                            { field: 'name', value: 'John' },
                            { field: 'age', value: 30 }
                        ];
                        const newFilters = [
                            { field: 'name', value: 'John' }
                        ];
                        const result = wmComponent['compareFilterExpressions'](prevFilters, newFilters);
                        expect(result).toBeFalsy();
                    });
                });

                describe('setLastActionToFilterCriteria', () => {
                    beforeEach(() => {
                        wmComponent.datasource = {
                            filterExpressions: { rules: [{ field: 'name', value: 'John' }] },
                            dataBinding: [{ field: 'age', value: 30 }]
                        };
                        (wmComponent as any).gridOptions = {
                            setLastActionPerformed: jest.fn(),
                            setIsSearchTrigerred: jest.fn(),
                            ACTIONS: {
                                FILTER_CRITERIA: 'FILTER_CRITERIA',
                                DELETE: "",
                                EDIT: "",
                                SEARCH_OR_SORT: "",
                                DEFAULT: "",
                                DATASET_UPDATE: ""
                            }
                        };
                    });

                    it('should set prevFilterExpression from filterExpressions.rules', () => {
                        wmComponent['setLastActionToFilterCriteria']();
                        expect(wmComponent.prevFilterExpression).toEqual([{ field: 'name', value: 'John' }]);
                    });

                    it('should set prevFilterExpression from dataBinding if filterExpressions.rules is empty', () => {
                        wmComponent.datasource.filterExpressions.rules = null;
                        wmComponent['setLastActionToFilterCriteria']();
                        expect(wmComponent.prevFilterExpression).toEqual([{ field: 'age', value: 30 }]);
                    });

                    it('should call setLastActionPerformed with FILTER_CRITERIA', () => {
                        wmComponent['setLastActionToFilterCriteria']();
                        expect(wmComponent.gridOptions.setLastActionPerformed).toHaveBeenCalledWith('FILTER_CRITERIA');
                    });

                    it('should call setIsSearchTrigerred with true', () => {
                        wmComponent['setLastActionToFilterCriteria']();
                        expect(wmComponent.gridOptions.setIsSearchTrigerred).toHaveBeenCalledWith(true);
                    });
                });

                describe('setLastActionToDatasetUpdate', () => {
                    beforeEach(() => {
                        (wmComponent as any).gridOptions = {
                            setLastActionPerformed: jest.fn(),
                            setCurrentPage: jest.fn(),
                            setIsDatasetUpdated: jest.fn(),
                            ACTIONS: {
                                DATASET_UPDATE: 'DATASET_UPDATE',
                                DELETE: "",
                                EDIT: "",
                                SEARCH_OR_SORT: "",
                                DEFAULT: "",
                                FILTER_CRITERIA: ""
                            }
                        };
                    });

                    it('should call setLastActionPerformed with DATASET_UPDATE', () => {
                        wmComponent['setLastActionToDatasetUpdate']();
                        expect(wmComponent.gridOptions.setLastActionPerformed).toHaveBeenCalledWith('DATASET_UPDATE');
                    });

                    it('should call setCurrentPage with 1', () => {
                        wmComponent['setLastActionToDatasetUpdate']();
                        expect(wmComponent.gridOptions.setCurrentPage).toHaveBeenCalledWith(1);
                    });

                    it('should call setIsDatasetUpdated with true', () => {
                        wmComponent['setLastActionToDatasetUpdate']();
                        expect(wmComponent.gridOptions.setIsDatasetUpdated).toHaveBeenCalledWith(true);
                    });
                });

                describe('checkIfVarFiltersApplied', () => {
                    beforeEach(() => {
                        wmComponent.datasource = {
                            filterExpressions: { rules: [{ field: 'name', value: 'John' }] },
                            dataBinding: [{ field: 'age', value: 30 }]
                        };
                        wmComponent.prevFilterExpression = [{ field: 'name', value: 'John' }];
                        wmComponent['setLastActionToFilterCriteria'] = jest.fn();
                        wmComponent['compareFilterExpressions'] = jest.fn().mockReturnValue(true);
                    });

                    it('should not call setLastActionToFilterCriteria when filterExpressions are equal', () => {
                        wmComponent['checkIfVarFiltersApplied']();
                        expect(wmComponent['setLastActionToFilterCriteria']).not.toHaveBeenCalled();
                    });

                    it('should call setLastActionToFilterCriteria when filterExpressions are not equal', () => {
                        wmComponent['compareFilterExpressions'] = jest.fn().mockReturnValue(false);
                        wmComponent['checkIfVarFiltersApplied']();
                        expect(wmComponent['setLastActionToFilterCriteria']).toHaveBeenCalled();
                    });

                    it('should use dataBinding when filterExpressions.rules is empty', () => {
                        wmComponent.datasource.filterExpressions.rules = null;
                        wmComponent['compareFilterExpressions'] = jest.fn().mockReturnValue(false);
                        wmComponent['checkIfVarFiltersApplied']();
                        expect(wmComponent['compareFilterExpressions']).toHaveBeenCalledWith(
                            wmComponent.prevFilterExpression,
                            [{ field: 'age', value: 30 }]
                        );
                    });

                    it('should not call setLastActionToFilterCriteria when both filterExpressions and dataBinding are empty', () => {
                        wmComponent.datasource.filterExpressions.rules = null;
                        wmComponent.datasource.dataBinding = null;
                        wmComponent['checkIfVarFiltersApplied']();
                        expect(wmComponent['setLastActionToFilterCriteria']).not.toHaveBeenCalled();
                    });
                });

                describe('handleLoading', () => {
                    beforeEach(() => {
                        wmComponent.callDataGridMethod = jest.fn();
                        wmComponent.loadingdatamsg = 'Loading...';
                        wmComponent.nodatamessage = 'No data found';
                        wmComponent.isGridEditMode = false;
                        wmComponent.dataset = [];
                    });

                    it('should set status to loading when data is active', () => {
                        wmComponent['handleLoading']({ active: true });
                        expect((wmComponent as any).variableInflight).toBe(true);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'loading', 'Loading...');
                    });

                    it('should set status to nodata when data is not active and dataset is empty', () => {
                        wmComponent['handleLoading']({ active: false });
                        expect((wmComponent as any).variableInflight).toBe(false);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'nodata', 'No data found');
                    });

                    it('should set status to ready when data is not active and grid is in edit mode', () => {
                        wmComponent.isGridEditMode = true;
                        wmComponent['handleLoading']({ active: false });
                        expect((wmComponent as any).variableInflight).toBe(false);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'ready');
                    });

                    it('should set status to ready when data is not active and dataset is not empty', () => {
                        wmComponent.dataset = [{ id: 1 }];
                        wmComponent['handleLoading']({ active: false });
                        expect((wmComponent as any).variableInflight).toBe(false);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'ready');
                    });
                });

                describe('resetPageNavigation', () => {
                    it('should call resetPageNavigation on dataNavigator if it exists', () => {
                        wmComponent.dataNavigator = { resetPageNavigation: jest.fn() };
                        wmComponent['resetPageNavigation']();
                        expect(wmComponent.dataNavigator.resetPageNavigation).toHaveBeenCalled();
                    });

                    it('should not throw error if dataNavigator does not exist', () => {
                        wmComponent.dataNavigator = null;
                        expect(() => wmComponent['resetPageNavigation']()).not.toThrow();
                    });
                });

                describe('isDataValid', () => {
                    beforeEach(() => {
                        wmComponent.setGridData = jest.fn();
                        wmComponent.callDataGridMethod = jest.fn();
                    });

                    it('should return true for valid data', () => {
                        wmComponent.dataset = { data: [{ id: 1 }] };
                        expect(wmComponent['isDataValid']()).toBe(true);
                        expect(wmComponent.setGridData).not.toHaveBeenCalled();
                        expect(wmComponent.callDataGridMethod).not.toHaveBeenCalled();
                    });

                    it('should handle error in dataset', () => {
                        wmComponent.dataset = { error: 'Dataset error' };
                        expect(wmComponent['isDataValid']()).toBe(false);
                        expect(wmComponent.setGridData).toHaveBeenCalledWith([]);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'error', 'Dataset error');
                    });

                    it('should handle error in dataset.data', () => {
                        wmComponent.dataset = { data: { error: true, errorMessage: 'Data error' } };
                        expect(wmComponent['isDataValid']()).toBe(false);
                        expect(wmComponent.setGridData).toHaveBeenCalledWith([]);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'error', 'Data error');
                    });

                    it('should return true for undefined dataset', () => {
                        wmComponent.dataset = undefined;
                        expect(wmComponent['isDataValid']()).toBe(true);
                        expect(wmComponent.setGridData).not.toHaveBeenCalled();
                        expect(wmComponent.callDataGridMethod).not.toHaveBeenCalled();
                    });
                });

                describe('enablePageNavigation', () => {
                    beforeEach(() => {
                        wmComponent.dataset = [];
                        wmComponent.binddataset = 'someBindDataset';
                        wmComponent.dataNavigator = {
                            resultEmitter: {
                                subscribe: jest.fn()
                            },
                            maxResultsEmitter: {
                                subscribe: jest.fn()
                            },
                            widget: {
                                maxResults: 0
                            },
                            setBindDataSet: jest.fn()
                        };
                    });

                    it('should set up data navigator watches', () => {
                        wmComponent.enablePageNavigation();

                        expect((wmComponent as any).dataNavigatorWatched).toBe(true);
                        expect(wmComponent.dataNavigator.resultEmitter.subscribe).toHaveBeenCalled();
                        expect(wmComponent.dataNavigator.maxResultsEmitter.subscribe).toHaveBeenCalled();
                    });

                    it('should unsubscribe from existing watches', () => {
                        const mockUnsubscribe = jest.fn();
                        (wmComponent as any).navigatorResultWatch = { unsubscribe: mockUnsubscribe };
                        (wmComponent as any).navigatorMaxResultWatch = { unsubscribe: mockUnsubscribe };

                        wmComponent.enablePageNavigation();

                        expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
                    });

                    it('should update pagesize when maxResults is received', () => {
                        const newPageSize = 10;
                        wmComponent.enablePageNavigation();

                        const subscribeCallback = wmComponent.dataNavigator.maxResultsEmitter.subscribe.mock.calls[0][0];
                        subscribeCallback(newPageSize);

                        expect(wmComponent.pagesize).toBe(newPageSize);
                    });

                    it('should set dataNavigator options', () => {
                        wmComponent.pagesize = 20;
                        wmComponent.enablePageNavigation();

                        expect(wmComponent.dataNavigator.widget.maxResults).toBe(20);
                        expect(wmComponent.dataNavigator.options).toEqual({ maxResults: 20 });
                    });

                    it('should call setBindDataSet with correct parameters', () => {
                        (wmComponent as any).viewParent = 'someViewParent';
                        wmComponent.datasource = 'someDatasource';
                        wmComponent.binddatasource = 'someBindDatasource';
                        wmComponent.statehandler = 'someStateHandler';
                        wmComponent.enablePageNavigation();
                        expect(wmComponent.dataNavigator.setBindDataSet).toHaveBeenCalledWith(
                            wmComponent.binddataset,
                            (wmComponent as any).viewParent,
                            wmComponent.datasource,
                            wmComponent.dataset,
                            wmComponent.binddatasource,
                            undefined,
                            wmComponent.statehandler
                        );
                    });
                });

                describe('populateGridData', () => {
                    let mockServiceData;

                    beforeEach(() => {
                        mockServiceData = [
                            { id: 1, name: 'Item 1' },
                            { id: 2, name: 'Item 2' }
                        ];
                        wmComponent.name = 'TestTable';
                        (wmComponent as any).filterInfo = {};
                        (wmComponent as any).sortInfo = {};
                        (wmComponent as any)._isClientSearch = false;
                        (wmComponent as any).isdynamictable = false;
                        (wmComponent as any).getConfiguredState = jest.fn(() => 'none');
                        (wmComponent as any)._selectedItemsExist = false;
                        wmComponent.isNavigationEnabled = jest.fn(() => false);
                        wmComponent.getSearchResult = jest.fn(data => data);
                        wmComponent.getSortResult = jest.fn(data => data);
                        wmComponent.createGridColumns = jest.fn();
                        wmComponent.setGridData = jest.fn();
                        (wmComponent as any).statePersistence = {
                            getWidgetState: jest.fn(),
                            setWidgetState: jest.fn()
                        };
                        wmComponent.dataNavigator = {
                            dn: {
                                currentPage: 1
                            }
                        };
                        wmComponent.selectItem = jest.fn();
                    });

                    it('should populate grid data with client-side search', () => {
                        wmComponent._isClientSearch = true;
                        wmComponent.populateGridData(mockServiceData);
                        expect(wmComponent.getSearchResult).toHaveBeenCalled();
                        expect(wmComponent.getSortResult).toHaveBeenCalled();
                        expect((wmComponent as any).serverData).toEqual(mockServiceData);
                        expect(wmComponent.setGridData).toHaveBeenCalledWith(mockServiceData);
                    });

                    it('should populate grid data without client-side search', () => {
                        wmComponent.populateGridData(mockServiceData);
                        expect(wmComponent.getSearchResult).not.toHaveBeenCalled();
                        expect(wmComponent.getSortResult).not.toHaveBeenCalled();
                        expect((wmComponent as any).serverData).toEqual(mockServiceData);
                        expect(wmComponent.setGridData).toHaveBeenCalledWith(mockServiceData);
                    });

                    it('should create grid columns for dynamic table', () => {
                        (wmComponent as any).isdynamictable = true;
                        wmComponent.populateGridData(mockServiceData);
                        expect(wmComponent.createGridColumns).toHaveBeenCalledWith(mockServiceData);
                    });
                });

                describe('prepareColDefs', () => {
                    it('should prepare column definitions correctly', () => {
                        const mockData = {
                            field1: 'value1',
                            field2: 'value2',
                        };

                        const mockPrepareFieldDefs = jest.fn().mockReturnValue([
                            { field: 'field1', displayName: 'Field 1' },
                            { field: 'field2', displayName: 'Field 2' },
                        ]);

                        jest.spyOn(wmComponent as any, 'invokeEventCallback').mockImplementation(() => { });
                        jest.spyOn(wmComponent as any, 'generateDynamicColumns').mockImplementation(() => { });

                        (wmComponent as any).prepareColDefs(mockData);

                        expect(wmComponent.fieldDefs).toEqual([]);
                        expect(wmComponent.headerConfig).toEqual([]);
                        expect(Object.keys(wmComponent.columns).length).toBe(2);
                        expect(wmComponent.columns['field1']).toBeDefined();
                        expect(wmComponent.columns['field2']).toBeDefined();

                        expect(wmComponent.columns['field1'].binding).toBe('field1');
                        expect(wmComponent.columns['field1'].caption).toBe('Field1');
                        expect(wmComponent.columns['field1'].pcDisplay).toBe(true);
                        expect(wmComponent.columns['field1'].mobileDisplay).toBe(true);
                        expect(wmComponent.columns['field1'].tabletDisplay).toBe(true);
                        expect(wmComponent.columns['field1'].searchable).toBe(true);
                        expect(wmComponent.columns['field1'].showinfilter).toBe(true);
                        expect(wmComponent.columns['field1'].type).toBe('string');
                        expect(wmComponent.columns['field1'].index).toBe(0);
                        expect(wmComponent.columns['field1'].headerIndex).toBe(0);

                        expect((wmComponent as any).invokeEventCallback).toHaveBeenCalledWith(
                            'beforedatarender',
                            expect.objectContaining({
                                $data: mockData,
                                $columns: wmComponent.columns,
                                data: mockData,
                                columns: wmComponent.columns
                            })
                        );

                        expect((wmComponent as any).generateDynamicColumns).toHaveBeenCalled();
                    });

                    it('should handle empty data', () => {
                        const mockData = {};

                        jest.spyOn(wmComponent as any, 'invokeEventCallback').mockImplementation(() => { });
                        jest.spyOn(wmComponent as any, 'generateDynamicColumns').mockImplementation(() => { });

                        (wmComponent as any).prepareColDefs(mockData);

                        expect(wmComponent.fieldDefs).toEqual([]);
                        expect(wmComponent.headerConfig).toEqual([]);
                        expect(Object.keys(wmComponent.columns).length).toBe(0);

                        expect((wmComponent as any).invokeEventCallback).toHaveBeenCalledWith(
                            'beforedatarender',
                            expect.objectContaining({
                                $data: mockData,
                                $columns: wmComponent.columns,
                                data: mockData,
                                columns: wmComponent.columns
                            })
                        );

                        expect((wmComponent as any).generateDynamicColumns).toHaveBeenCalledWith([]);
                    });
                });

                describe('createGridColumns', () => {
                    beforeEach(() => {
                        // Mock the dynamicComponentProvider
                        (wmComponent as any).dynamicComponentProvider = {
                            getComponentFactoryRef: jest.fn().mockResolvedValue({})
                        };
                        // Mock other necessary methods
                        wmComponent.generateDynamicColumns = jest.fn();
                        wmComponent.setGridData = jest.fn();
                    });

                    it('should handle valid array data', async () => {
                        const validData = [{ id: 1, name: 'Test' }];
                        wmComponent.createGridColumns(validData);
                        expect(wmComponent.generateDynamicColumns).toHaveBeenCalled();
                        expect(wmComponent.setGridData).toHaveBeenCalledWith(validData);
                        expect((wmComponent as any).serverData).toEqual(validData);
                    });

                    it('should handle valid object data and convert it to array', async () => {
                        const validObjectData = { id: 1, name: 'Test' };
                        wmComponent.createGridColumns(validObjectData);
                        expect(wmComponent.generateDynamicColumns).toHaveBeenCalled();
                        expect(wmComponent.setGridData).toHaveBeenCalledWith([validObjectData]);
                        expect((wmComponent as any).serverData).toEqual([validObjectData]);
                    });

                    it('should handle empty data', async () => {
                        wmComponent.createGridColumns([]);
                        expect(wmComponent.setGridData).toHaveBeenCalledWith([]);
                        expect(wmComponent.generateDynamicColumns).not.toHaveBeenCalled();
                    });

                    it('should handle invalid data', async () => {
                        const invalidData = { error: 'Some error' };
                        wmComponent.createGridColumns(invalidData);
                        expect(wmComponent.generateDynamicColumns).not.toHaveBeenCalled();
                        expect(wmComponent.setGridData).not.toHaveBeenCalled();
                    });

                    it('should handle null data', async () => {
                        wmComponent.createGridColumns(null);
                        expect(wmComponent.generateDynamicColumns).not.toHaveBeenCalled();
                    });
                });

                describe('onPropertyChange', () => {
                    beforeEach(() => {
                        wmComponent.callDataGridMethod = jest.fn();
                        wmComponent.setDataGridOption = jest.fn();
                        wmComponent.watchVariableDataSet = jest.fn();
                        wmComponent.onDataSourceChange = jest.fn();
                        wmComponent.invokeEventCallback = jest.fn();
                        (wmComponent as any).gridOptions = {
                            isNavTypeScrollOrOndemand: jest.fn().mockReturnValue(true),
                            getCurrentPage: jest.fn().mockReturnValue(1),
                            setIsNextPageData: jest.fn(),
                            setIsDataUpdatedByUser: jest.fn(),
                            isNextPageData: false,
                            setLastActionPerformed: jest.fn(),
                            setCurrentPage: jest.fn(),
                            setIsDatasetUpdated: jest.fn(),
                            ACTIONS: {
                                DATASET_UPDATE: 'DATASET_UPDATE',
                                DELETE: "",
                                EDIT: "",
                                SEARCH_OR_SORT: "",
                                DEFAULT: "",
                                FILTER_CRITERIA: ""
                            }
                        };
                        wmComponent.dataNavigator = {
                            options: {},
                            widget: {},
                            maxResults: 0
                        };
                        Object.defineProperty(wmComponent, '$element', {
                            get: () => ({
                                find: jest.fn().mockReturnValue({ text: jest.fn() })
                            })
                        });
                    });

                    it('should handle datasource change', () => {
                        const newValue = { startUpdate: false };
                        wmComponent.onPropertyChange('datasource', newValue);

                        expect((wmComponent as any).variableInflight).toBeFalsy();
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setStatus', 'nodata', wmComponent.nodatamessage);
                        expect(wmComponent.watchVariableDataSet).toHaveBeenCalledWith(wmComponent.dataset);
                        expect(wmComponent.onDataSourceChange).toHaveBeenCalled();
                    });

                    it('should handle dataset change', () => {
                        const newValue = [{ id: 1, name: 'Test' }];
                        wmComponent.onPropertyChange('dataset', newValue);

                        expect(wmComponent.gridOptions.setIsDataUpdatedByUser).toHaveBeenCalledWith(true);
                        expect(wmComponent.gridOptions.setLastActionPerformed).toHaveBeenCalledWith('DATASET_UPDATE');
                        expect(wmComponent.gridOptions.setCurrentPage).toHaveBeenCalledWith(1);
                        expect(wmComponent.gridOptions.setIsDatasetUpdated).toHaveBeenCalledWith(true);
                        expect(wmComponent.watchVariableDataSet).toHaveBeenCalledWith(newValue);
                    });

                    it('should handle filtermode change', () => {
                        wmComponent.onPropertyChange('filtermode', 'multi');
                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('filtermode', 'multi');
                    });

                    it('should handle searchlabel change', () => {
                        wmComponent.onPropertyChange('searchlabel', 'Search');
                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('searchLabel', 'Search');
                    });

                    it('should handle navigation change', () => {
                        wmComponent.onPropertyChange('navigation', 'Basic');
                        expect(wmComponent.shownavigation).toBeTruthy();
                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('navigation', 'Basic');
                        expect(wmComponent.onDemandLoad).toBeFalsy();
                        expect(wmComponent.infScroll).toBeFalsy();
                        expect(wmComponent.navControls).toBe('Basic');
                    });

                    it('should handle gridfirstrowselect change', () => {
                        wmComponent.onPropertyChange('gridfirstrowselect', true);
                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('selectFirstRow', true);
                    });

                    it('should handle gridclass change', () => {
                        wmComponent.onPropertyChange('gridclass', 'custom-class');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'cssClassNames.grid', 'custom-class');
                    });

                    it('should handle nodatamessage change', () => {
                        wmComponent.onPropertyChange('nodatamessage', 'No data available');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'dataStates.nodata', 'No data available');
                    });

                    it('should handle loadingdatamsg change', () => {
                        wmComponent.onPropertyChange('loadingdatamsg', 'Loading...');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'dataStates.loading', 'Loading...');
                    });

                    it('should handle loadingicon change', () => {
                        wmComponent.onPropertyChange('loadingicon', 'fa-spinner');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'loadingicon', 'fa-spinner');
                    });

                    it('should handle spacing change', () => {
                        wmComponent.onPropertyChange('spacing', 'condensed');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'spacing', 'condensed');
                        expect(wmComponent.navigationSize).toBe('small');
                    });

                    it('should handle exportformat change', () => {
                        wmComponent.onPropertyChange('exportformat', 'csv,excel');
                        expect(wmComponent.exportOptions.length).toBe(2);
                        expect(wmComponent.exportOptions[0].label).toBe('csv');
                        expect(wmComponent.exportOptions[1].label).toBe('excel');
                    });

                    it('should handle shownewrow change', () => {
                        wmComponent.onPropertyChange('shownewrow', true);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'actionsEnabled.new', true);
                    });

                    it('should handle pagesize change', () => {
                        wmComponent.onPropertyChange('pagesize', 20);
                        expect(wmComponent.dataNavigator.options.maxResults).toBe(20);
                        expect(wmComponent.dataNavigator.widget.maxResults).toBe(20);
                        expect(wmComponent.dataNavigator.maxResults).toBe(20);
                    });

                    it('should handle ondemandmessage change', () => {
                        wmComponent.onPropertyChange('ondemandmessage', 'Load more');
                        expect(wmComponent.gridOptions.ondemandmessage).toBe('Load more');
                    });

                    it('should handle viewlessmessage change', () => {
                        wmComponent.onPropertyChange('viewlessmessage', 'View less');
                        expect(wmComponent.gridOptions.viewlessmessage).toBe('View less');
                    });

                    it('should handle show change', () => {
                        wmComponent.onPropertyChange('show', true);
                        expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('show');

                        wmComponent.onPropertyChange('show', false);
                        expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('hide');
                    });
                });

                describe('onDataSourceChange', () => {
                    beforeEach(() => {
                        wmComponent.fieldDefs = [
                            { onDataSourceChange: jest.fn() },
                            { onDataSourceChange: jest.fn() },
                            {}
                        ];
                    });

                    it('should call onDataSourceChange for each field definition that has it', () => {
                        wmComponent.onDataSourceChange();

                        expect(wmComponent.fieldDefs[0].onDataSourceChange).toHaveBeenCalled();
                        expect(wmComponent.fieldDefs[1].onDataSourceChange).toHaveBeenCalled();
                    });

                    it('should not throw an error for field definitions without onDataSourceChange', () => {
                        expect(() => wmComponent.onDataSourceChange()).not.toThrow();
                    });
                });

                describe('clearActionRowVars', () => {
                    beforeEach(() => {
                        wmComponent.setDataGridOption = jest.fn();
                    });

                    it('should clear action row variables and update grid options', () => {
                        wmComponent['clearActionRowVars']();

                        expect(wmComponent.actionRowIndex).toBeUndefined();
                        expect(wmComponent.actionRowPage).toBeUndefined();
                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('actionRowIndex', undefined);
                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('actionRowPage', undefined);
                    });
                });

                describe('populateActions', () => {
                    beforeEach(() => {
                        wmComponent.actions = [
                            { position: ['header'] },
                            { position: ['footer'] },
                            { position: ['header', 'footer'] },
                            { position: ['other'] }
                        ];
                    });

                    it('should populate header and footer actions correctly', () => {
                        wmComponent.populateActions();
                        expect(wmComponent._actions.header.length).toBe(2);
                        expect(wmComponent._actions.footer.length).toBe(2);
                        expect(wmComponent._actions.header).toContain(wmComponent.actions[0]);
                        expect(wmComponent._actions.header).toContain(wmComponent.actions[2]);
                        expect(wmComponent._actions.footer).toContain(wmComponent.actions[1]);
                        expect(wmComponent._actions.footer).toContain(wmComponent.actions[2]);
                    });

                    it('should not include actions with unrecognized positions', () => {
                        wmComponent.populateActions();
                        expect(wmComponent._actions.header).not.toContain(wmComponent.actions[3]);
                        expect(wmComponent._actions.footer).not.toContain(wmComponent.actions[3]);
                    });
                });

                describe('renderDynamicFilterColumn', () => {
                    beforeEach(() => {
                        (wmComponent as any).isdynamictable = false;
                        (wmComponent as any).filterTmpl = { _results: [] };
                    });

                    it('should add filter template ref for dynamic table', () => {
                        const mockFilterTmplRef = {};
                        (wmComponent as any).isdynamictable = true;
                        wmComponent.renderDynamicFilterColumn(mockFilterTmplRef);
                        expect((wmComponent as any).filterTmpl._results).toContain(mockFilterTmplRef);
                    });

                    it('should not add filter template ref for non-dynamic table', () => {
                        const mockFilterTmplRef = {};
                        wmComponent.renderDynamicFilterColumn(mockFilterTmplRef);
                        expect((wmComponent as any).filterTmpl._results).not.toContain(mockFilterTmplRef);
                    });
                });

                describe('registerRow', () => {
                    it('should set rowDef and rowInstance', () => {
                        const mockTableRow = { expandicon: 'expand-icon', collapseicon: 'collapse-icon' };
                        const mockRowInstance = {};
                        wmComponent.registerRow(mockTableRow, mockRowInstance);
                        expect(wmComponent.rowDef).toEqual(mockTableRow);
                        expect(wmComponent.rowInstance).toEqual(mockRowInstance);
                    });

                    it('should call callDataGridMethod with correct parameters', () => {
                        const mockTableRow = { expandicon: 'expand-icon', collapseicon: 'collapse-icon' };
                        const mockRowInstance = {};
                        jest.spyOn(wmComponent, 'callDataGridMethod');
                        wmComponent.registerRow(mockTableRow, mockRowInstance);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'cssClassNames.rowExpandIcon', 'expand-icon');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('option', 'cssClassNames.rowCollapseIcon', 'collapse-icon');
                    });

                    it('should set gridOptions properties correctly', () => {
                        const mockTableRow = { expandicon: 'expand-icon', collapseicon: 'collapse-icon' };
                        const mockRowInstance = {};
                        wmComponent.registerRow(mockTableRow, mockRowInstance);
                        expect(wmComponent.gridOptions.rowExpansionEnabled).toBe(true);
                        expect(wmComponent.gridOptions.rowDef).toEqual(mockTableRow);
                    });
                });

                describe('onStyleChange', () => {
                    it('should call setGridDimensions with width', () => {
                        jest.spyOn(wmComponent, 'callDataGridMethod');
                        wmComponent.onStyleChange('width', '100px', '50px');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setGridDimensions', 'width', '100px');
                    });

                    it('should call setGridDimensions with height', () => {
                        jest.spyOn(wmComponent, 'callDataGridMethod');
                        wmComponent.onStyleChange('height', '200px', '100px');
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('setGridDimensions', 'height', '200px');
                    });

                    it('should call super.onStyleChange', () => {
                        const spy = jest.spyOn(Object.getPrototypeOf(TableComponent.prototype), 'onStyleChange');
                        wmComponent.onStyleChange('color', 'red', 'blue');
                        expect(spy).toHaveBeenCalledWith('color', 'red', 'blue');
                    });
                });

                describe('registerColumns', () => {
                    beforeEach(() => {
                        (wmComponent as any).viewport = { isMobileType: false, isTabletType: false };
                        wmComponent.primaryKey = [];
                        wmComponent.fieldDefs = [];
                        (wmComponent as any).fullFieldDefs = [];
                        wmComponent.rowFilter = {};
                        wmComponent.columns = {};
                        (wmComponent as any).isdynamictable = false;
                        (wmComponent as any).noOfColumns = 2;
                    });

                    it('should register column for PC display', () => {
                        const tableColumn = { field: 'name', pcDisplay: true, 'primary-key': true };
                        wmComponent.registerColumns(tableColumn, 0);
                        expect(wmComponent.primaryKey).toContain('name');
                        expect(wmComponent.fieldDefs[0]).toEqual(tableColumn);
                        expect((wmComponent as any).fullFieldDefs).toContain(tableColumn);
                        expect(wmComponent.rowFilter['name']).toBeDefined();
                        expect(wmComponent.columns['name']).toEqual(tableColumn);
                    });

                    it('should not register column if display condition is not met', () => {
                        (wmComponent as any).viewport.isMobileType = true;
                        const tableColumn = { field: 'name', mobileDisplay: false };
                        wmComponent.registerColumns(tableColumn, 0);
                        expect(wmComponent.fieldDefs.length).toBe(0);
                    });

                    it('should call renderOperationColumns and setDataGridOption for dynamic table', () => {
                        (wmComponent as any).isdynamictable = true;
                        (wmComponent as any).noOfColumns = 1;
                        jest.spyOn(wmComponent, 'renderOperationColumns');
                        jest.spyOn(wmComponent, 'setDataGridOption');
                        const tableColumn = { field: 'name', pcDisplay: true };
                        wmComponent.registerColumns(tableColumn, 0);
                        expect(wmComponent.renderOperationColumns).toHaveBeenCalled();
                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('colDefs', wmComponent.fieldDefs);
                    });
                });

                describe('selectItem', () => {
                    it('should update serverData if data is provided', () => {
                        const item = { id: 1 };
                        const data = { newData: true };
                        wmComponent.selectItem(item, data);
                        expect((wmComponent as any).serverData).toEqual(data);
                    });

                    it('should call callDataGridMethod with selectRow', () => {
                        jest.spyOn(wmComponent, 'callDataGridMethod');
                        const item = { id: 1 };
                        wmComponent.selectItem(item, {});
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('selectRow', item, true);
                    });

                    it('should omit empty arrays from item', () => {
                        jest.spyOn(wmComponent, 'callDataGridMethod');
                        const item = { id: 1, emptyArray: [] };
                        wmComponent.selectItem(item, {});
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('selectRow', { id: 1 }, true);
                    });
                });

                describe('deselectItem', () => {
                    it('should call callDataGridMethod with deselectRow', () => {
                        jest.spyOn(wmComponent, 'callDataGridMethod');
                        const item = { id: 1 };
                        wmComponent.deselectItem(item);
                        expect(wmComponent.callDataGridMethod).toHaveBeenCalledWith('deselectRow', item);
                    });
                });

                describe('onDataNavigatorDataSetChange', () => {
                    beforeEach(() => {
                        wmComponent._isClientSearch = false;
                        (wmComponent as any).filterInfo = {};
                        (wmComponent as any).sortInfo = {};
                    });

                    it('should return input data when _isClientSearch is false', () => {
                        const data = [{ id: 1 }, { id: 2 }];
                        const result = wmComponent.onDataNavigatorDataSetChange(data);
                        expect(result).toEqual(data);
                    });

                    it('should process data when _isClientSearch is true', () => {
                        wmComponent._isClientSearch = true;
                        const data = [{ id: 1 }, { id: 2 }];
                        jest.spyOn((wmComponent as any), 'getSearchResult').mockReturnValue(data);
                        jest.spyOn((wmComponent as any), 'getSortResult').mockReturnValue(data);
                        const result = wmComponent.onDataNavigatorDataSetChange(data);
                        expect(wmComponent.getSearchResult).toHaveBeenCalled();
                        expect(wmComponent.getSortResult).toHaveBeenCalled();
                        expect(result).toEqual(data);
                    });

                    it('should handle object input when _isClientSearch is true', () => {
                        wmComponent._isClientSearch = true;
                        const data = { id: 1 };
                        jest.spyOn((wmComponent as any), 'getSearchResult').mockReturnValue([data]);
                        jest.spyOn((wmComponent as any), 'getSortResult').mockReturnValue([data]);
                        const result = wmComponent.onDataNavigatorDataSetChange(data);
                        expect(wmComponent.getSearchResult).toHaveBeenCalledWith([data], (wmComponent as any).filterInfo);
                        expect(wmComponent.getSortResult).toHaveBeenCalledWith([data], (wmComponent as any).sortInfo);
                        expect(result).toEqual([data]);
                    });
                });

                describe('export', () => {
                    beforeEach(() => {
                        wmComponent.fieldDefs = [
                            { field: 'name', displayName: 'Name', show: true },
                            { field: 'age', displayName: 'Age', show: true },
                            { field: 'ROW_OPS_FIELD', displayName: 'Actions', show: true },
                            { field: 'hidden', displayName: 'Hidden', show: false }
                        ];
                        (wmComponent as any).sortInfo = { field: 'name', direction: 'asc' };
                        (wmComponent as any).filterInfo = { name: 'John' };
                        wmComponent.exportdatasize = 100;
                        wmComponent.datasource = {
                            execute: jest.fn()
                        };
                        wmComponent.invokeEventCallback = jest.fn().mockReturnValue(true);
                        wmComponent.getFilterFields = jest.fn().mockReturnValue({ name: 'John' });
                    });

                    it('should handle exportexpression', () => {
                        wmComponent.fieldDefs[0].exportexpression = 'UPPER(name)';
                        const item = { label: 'CSV' };
                        wmComponent.export(item);

                        expect(wmComponent.datasource.execute).toHaveBeenCalledWith(
                            DataSource.Operation.DOWNLOAD,
                            expect.objectContaining({
                                data: expect.objectContaining({
                                    columns: expect.objectContaining({
                                        name: { header: 'Name', expression: 'UPPER(name)' }
                                    })
                                })
                            })
                        );
                    });
                });

                describe('triggerUploadEvent', () => {
                    it('should invoke callback with correct params for non-change event', () => {
                        const fieldName = 'existingField';
                        wmComponent.columns[fieldName] = {
                            invokeEventCallback: jest.fn()
                        } as any;
                        const event = { target: {} };
                        const row = { id: 1 };
                        wmComponent.triggerUploadEvent(event, 'click', fieldName, row);
                        expect(wmComponent.columns[fieldName].invokeEventCallback).toHaveBeenCalledWith('click', { $event: event, row });
                    });

                    it('should invoke callback with correct params for change event', () => {
                        const fieldName = 'existingField';
                        const oldUploadVal = ['oldFile'];
                        wmComponent.columns[fieldName] = {
                            invokeEventCallback: jest.fn(),
                            _oldUploadVal: oldUploadVal
                        } as any;
                        const newFiles = ['newFile'];
                        const event = { target: { files: newFiles } };
                        const row = { id: 1 };
                        wmComponent.triggerUploadEvent(event, 'change', fieldName, row);
                        expect(wmComponent.columns[fieldName].invokeEventCallback).toHaveBeenCalledWith('change', {
                            $event: event,
                            row,
                            newVal: newFiles,
                            oldVal: oldUploadVal
                        });
                        expect(wmComponent.columns[fieldName]._oldUploadVal).toBe(newFiles);
                    });
                });


                describe('_documentClickBind', () => {
                    beforeEach(() => {
                        Object.defineProperty(wmComponent, '$element', {
                            get: () => [{
                                contains: jest.fn()
                            }]
                        });
                    });

                    it('should call saveRow when click is within the grid', () => {
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        const mockEvent = {
                            target: document.createElement('div'),
                        };
                        wmComponent.$element[0].contains.mockReturnValue(true);
                        wmComponent['_documentClickBind'](mockEvent);
                        expect(spy).toHaveBeenCalledWith('saveRow');
                    });

                    it('should not call saveRow when click is on doctype', () => {
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        const mockEvent = {
                            target: { doctype: {} },
                        };
                        wmComponent['_documentClickBind'](mockEvent);
                        expect(spy).not.toHaveBeenCalled();
                    });

                    it('should call saveRow when click is on input body wrapper', () => {
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        const mockEvent = {
                            target: {
                                closest: jest.fn().mockReturnValue({ length: 1 }),
                                hasAttribute: jest.fn()
                            },
                        };
                        wmComponent.$element[0].contains.mockReturnValue(false);
                        wmComponent['_documentClickBind'](mockEvent);
                        expect(spy).toHaveBeenCalledWith('saveRow');
                    });

                    it('should call saveRow when click is outside the grid and not on input body wrapper', () => {
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        const mockEvent = {
                            target: {
                                closest: jest.fn().mockReturnValue({ length: 0 }),
                                hasAttribute: jest.fn().mockReturnValue(false)
                            },
                        };
                        wmComponent.$element[0].contains.mockReturnValue(false);
                        wmComponent['_documentClickBind'](mockEvent);
                        expect(spy).toHaveBeenCalledWith('saveRow');
                    });
                });

                describe('_redraw', () => {
                    it('should call datatable when forceRender is true', () => {
                        wmComponent.datagridElement = {
                            datatable: jest.fn(),
                        } as any;
                        wmComponent['_redraw'](true);
                        expect(wmComponent.datagridElement.datatable).toHaveBeenCalledWith(wmComponent.gridOptions);
                    });

                    it('should call setColGroupWidths and addOrRemoveScroll after timeout when forceRender is false', fakeAsync(() => {
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        wmComponent['_redraw'](false);
                        tick();
                        expect(spy).toHaveBeenCalledWith('setColGroupWidths');
                        expect(spy).toHaveBeenCalledWith('addOrRemoveScroll');
                    }));
                });

                describe('registerOnChange', () => {
                    it('should set the _onChange property', () => {
                        const mockFn = jest.fn();
                        wmComponent.registerOnChange(mockFn);
                        expect(wmComponent['_onChange']).toBe(mockFn);
                    });
                });

                describe('registerOnTouched', () => {
                    it('should set the _onTouched property', () => {
                        const mockFn = jest.fn();
                        wmComponent.registerOnTouched(mockFn);
                        expect(wmComponent['_onTouched']).toBe(mockFn);
                    });
                });

                describe('ngOnDetach', () => {
                    beforeEach(() => {
                        jest.spyOn((wmComponent as any), 'getConfiguredState');
                        wmComponent['_pageLoad'] = true; // Set initial state
                    });

                    it('should set _pageLoad to false when datasource category is "wm.Variable" and configured state is not "none"', () => {
                        wmComponent.datasource = { category: 'wm.Variable' };
                        (wmComponent as any).getConfiguredState.mockReturnValue('something');
                        wmComponent.ngOnDetach();
                        expect(wmComponent['_pageLoad']).toBe(false);
                    });

                    it('should set _pageLoad to true when datasource category is not "wm.Variable"', () => {
                        wmComponent.datasource = { category: 'other' };
                        wmComponent.ngOnDetach();
                        expect(wmComponent['_pageLoad']).toBe(true);
                    });

                    it('should set _pageLoad to true when datasource category is "wm.Variable" but configured state is "none"', () => {
                        wmComponent.datasource = { category: 'wm.Variable' };
                        (wmComponent as any).getConfiguredState.mockReturnValue('none');
                        wmComponent.ngOnDetach();
                        expect(wmComponent['_pageLoad']).toBe(true);
                    });

                    it('should call super.ngOnDetach()', () => {
                        const superSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(wmComponent)), 'ngOnDetach');
                        wmComponent.ngOnDetach();
                        expect(superSpy).toHaveBeenCalled();
                    });
                });

                describe('generateDynamicColumns', () => {
                    let mockDynamicComponentProvider;
                    let mockViewContainerRef;
                    let mockComponentRef;

                    beforeEach(() => {
                        mockDynamicComponentProvider = {
                            getComponentFactoryRef: jest.fn().mockResolvedValue('mockComponentFactoryRef')
                        };
                        mockViewContainerRef = {
                            clear: jest.fn(),
                            createComponent: jest.fn().mockReturnValue({
                                instance: {},
                                location: { nativeElement: document.createElement('div') }
                            })
                        };
                        mockComponentRef = {
                            instance: {},
                            location: { nativeElement: document.createElement('div') }
                        };
                        (wmComponent as any).dynamicComponentProvider = mockDynamicComponentProvider;
                        wmComponent.dynamicTableRef = mockViewContainerRef;
                        Object.defineProperty(wmComponent, '$element', {
                            get: () => ({
                                find: jest.fn().mockReturnValue([{ appendChild: jest.fn() }])
                            })
                        });
                        Object.defineProperty(wmComponent, 'viewParent', {
                            value: {},
                            writable: true
                        });
                        wmComponent.name = 'testTable';
                        (wmComponent as any).$attrs = new Map([['table_reference', 'Ref']]);
                        wmComponent.inj = {} as any;
                        (extendProto as jest.Mock).mockClear();
                    });

                    it('should clear fieldDefs and filterTmpl results when called', async () => {
                        wmComponent.fieldDefs = ['oldField'];
                        wmComponent.filterTmpl = { _results: ['oldResult'] } as any;
                        await wmComponent.generateDynamicColumns([]);
                        expect(wmComponent.fieldDefs).toEqual([]);
                        expect((wmComponent as any).filterTmpl._results).toEqual([]);
                    });

                    it('should return early if columns are empty', async () => {
                        await wmComponent.generateDynamicColumns([]);
                        expect(mockViewContainerRef.clear).not.toHaveBeenCalled();
                        expect(mockDynamicComponentProvider.getComponentFactoryRef).not.toHaveBeenCalled();
                    });

                    it('should set noOfColumns', async () => {
                        await wmComponent.generateDynamicColumns([{ field: 'name' }, { field: 'age' }]);
                        expect((wmComponent as any).noOfColumns).toBe(2);
                    });

                    it('should create _dynamicContext if not exists', async () => {
                        await wmComponent.generateDynamicColumns([{ field: 'name' }]);
                        expect((wmComponent as any)._dynamicContext).toBeDefined();
                        expect((wmComponent as any)._dynamicContext[wmComponent.getAttr('wmTable')]).toBe(wmComponent);
                    });

                    it('should not recreate _dynamicContext if it already exists', async () => {
                        const existingContext = { existingProp: 'value' };
                        (wmComponent as any)._dynamicContext = existingContext;
                        await wmComponent.generateDynamicColumns([{ field: 'name' }]);
                        expect((wmComponent as any)._dynamicContext).toBe(existingContext);
                    });

                    it('should call extendProto with component instance and _dynamicContext', async () => {
                        await wmComponent.generateDynamicColumns([{ field: 'name' }]);
                        expect(extendProto).toHaveBeenCalledWith(
                            expect.any(Object),
                            (wmComponent as any)._dynamicContext
                        );
                    });
                });

                describe('watchVariableDataSet', () => {
                    it('should handle undefined newVal when dataNavigatorWatched is true', () => {
                        (wmComponent as any).dataNavigatorWatched = true;
                        (wmComponent as any).__fullData = [{ id: 1 }];
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        wmComponent.watchVariableDataSet(undefined);
                        expect(spy).not.toHaveBeenCalled();
                    });

                    it('should show loading status when variable is in loading state', () => {
                        (wmComponent as any).variableInflight = true;
                        wmComponent.infScroll = false;
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        wmComponent.watchVariableDataSet({});
                        expect(spy).toHaveBeenCalledWith('setStatus', 'loading', wmComponent.loadingdatamsg);
                    });

                    it('should set sortInfo when sortExp is provided', () => {
                        wmComponent.getSortExpr = jest.fn().mockReturnValue('field asc');
                        wmComponent.watchVariableDataSet({});
                        expect((wmComponent as any).sortInfo).toEqual({ direction: 'asc', field: 'field' });
                    });

                    it('should enable page navigation when shownavigation is true', () => {
                        wmComponent.shownavigation = true;
                        (wmComponent as any).dataNavigatorWatched = false;
                        const spy = jest.spyOn(wmComponent, 'enablePageNavigation');
                        wmComponent.watchVariableDataSet({ data: [] });
                        expect(spy).toHaveBeenCalled();
                    });

                    it('should reset page navigation when newVal is falsy', () => {
                        const spy = jest.spyOn(wmComponent, 'resetPageNavigation');
                        wmComponent.watchVariableDataSet(null);
                        expect(spy).toHaveBeenCalled();
                    });

                    it('should set nodata status when newVal is falsy and variableInflight is false', () => {
                        (wmComponent as any).variableInflight = false;
                        const spy = jest.spyOn(wmComponent, 'callDataGridMethod');
                        wmComponent.watchVariableDataSet(null);
                        expect(spy).toHaveBeenCalledWith('setStatus', 'nodata', wmComponent.nodatamessage);
                    });

                    it('should set empty grid data when newVal is an empty string', () => {
                        const spy = jest.spyOn(wmComponent, 'setGridData');
                        wmComponent.watchVariableDataSet('');
                        expect(spy).toHaveBeenCalledWith([]);
                    });

                    it('should check if variable filters are applied when gridOptions.isNavTypeScrollOrOndemand() is true', () => {
                        (wmComponent as any).gridOptions = {
                            isNavTypeScrollOrOndemand: jest.fn().mockReturnValue(true)
                        };
                        const spy = jest.spyOn(wmComponent, 'checkIfVarFiltersApplied');

                        wmComponent.watchVariableDataSet({});

                        expect(spy).toHaveBeenCalled();
                    });

                    it('should handle state for static variables', () => {
                        wmComponent.datasource = {
                            category: 'wm.Variable',
                            execute: jest.fn().mockReturnValue(false)
                        };
                        (wmComponent as any)._pageLoad = true;
                        (wmComponent as any).getConfiguredState = jest.fn().mockReturnValue('some');
                        (wmComponent as any).statePersistence = {
                            getWidgetState: jest.fn().mockReturnValue({
                                selectedItem: true,
                                search: 'searchTerm',
                                sort: 'sortField',
                                pagination: { page: 2 }
                            }),
                            setWidgetState: jest.fn(),
                            removeWidgetState: jest.fn()
                        };

                        (wmComponent as any).searchStateHandler = jest.fn();
                        (wmComponent as any).searchSortHandler = jest.fn();
                        (wmComponent as any).sortStateHandler = jest.fn();
                        wmComponent.dataNavigator = {
                            pageChanged: jest.fn()
                        };

                        wmComponent.watchVariableDataSet({});

                        expect((wmComponent as any)._pageLoad).toBeFalsy();
                        expect((wmComponent as any)._selectedItemsExist).toBeTruthy();
                        expect((wmComponent as any).searchStateHandler).toHaveBeenCalled();
                        expect(wmComponent.searchSortHandler).toHaveBeenCalledWith('searchTerm', undefined, 'search', true);
                        expect(wmComponent.searchSortHandler).toHaveBeenCalledWith('sortField', undefined, 'sort', true);
                        expect((wmComponent as any).sortStateHandler).toHaveBeenCalled();
                    });

                    it('should set selectFirstRow when no selectedItem in widgetState', () => {
                        wmComponent.datasource = {
                            category: 'wm.Variable',
                            execute: jest.fn().mockReturnValue(false)
                        };
                        (wmComponent as any)._pageLoad = true;
                        (wmComponent as any).getConfiguredState = jest.fn().mockReturnValue('some');
                        (wmComponent as any).statePersistence = {
                            getWidgetState: jest.fn().mockReturnValue({})
                        };
                        wmComponent.setDataGridOption = jest.fn();

                        wmComponent.watchVariableDataSet({});

                        expect(wmComponent.setDataGridOption).toHaveBeenCalledWith('selectFirstRow', wmComponent.gridfirstrowselect);
                    });

                    it('should not process state handling when conditions are not met', () => {
                        wmComponent.datasource = {
                            category: 'not.Variable',
                            execute: jest.fn().mockReturnValue(false)
                        };
                        (wmComponent as any)._pageLoad = false;
                        (wmComponent as any).getConfiguredState = jest.fn().mockReturnValue('none');
                        wmComponent.setDataGridOption = jest.fn();

                        wmComponent.watchVariableDataSet({});

                        expect(wmComponent.setDataGridOption).not.toHaveBeenCalled();
                    });
                });
            });

            xdescribe("Quick Edit", () => {
                @Component({
                    template: quick_edit_markup
                })
                class QuickEditTableWrapperComponent {
                    @ViewChild(TableComponent, /* TODO: add static flag */ { static: true })
                    wmComponent: TableComponent;
                    UserTable1Rowselect($event, widget, row) { }
                }

                const quickeditTestModuleDef: ITestModuleDef = {
                    imports: [...declarations, ...imports],
                    declarations: [QuickEditTableWrapperComponent],
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

            xdescribe("Summary Row", () => {
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
                    imports: [...declarations, ...imports],
                    declarations: [SummaryRowWrapperComponent],
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
