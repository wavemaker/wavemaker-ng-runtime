import { By } from "@angular/platform-browser";
import { detectChanges } from "./../../../../../core/src/utils/utils";
import { TestBed } from "@angular/core/testing";
import { Component, ViewChild } from "@angular/core";
import { TrustAsPipe } from "projects/components/src/pipes/trust-as.pipe";
import { FormBuilder } from "@angular/forms";
import { App, DynamicComponentRefProvider } from "@wm/core";
import { TableComponent } from "./table.component";

@Component({
    template: `
        <div wmTable editmode="quickedit"></div>
    `
})
class TestComponent {}
/*
abstract class ComponentFixture {
    debugElement;       // test helper 
    componentInstance;  // access properties and methods
    nativeElement;      // access DOM
    detectChanges();    // trigger component change detection
  }
  */
let Dependencies = [TrustAsPipe, TableComponent];
let providers = [
    { provide: FormBuilder, useClass: FormBuilder },
    { provide: App, useValue: { subscribe: () => {} } },
    { provide: DynamicComponentRefProvider, useValue: {} }
];
const testData = [
    {
        deptId: 1,
        name: "Engineering",
        budget: 1936760,
        q1: 445455,
        q2: 522925,
        q3: 426087,
        q4: 542293,
        deptCode: "Eng",
        location: "San Francisco",
        tenantId: 1
    },
    {
        deptId: 2,
        name: "Marketing",
        budget: 1129777,
        q1: 225955,
        q2: 271146,
        q3: 327635,
        q4: 305040,
        deptCode: "Mktg",
        location: "New York",
        tenantId: 1
    },
    {
        deptId: 3,
        name: "General and Admin",
        budget: 1452570,
        q1: 435771,
        q2: 290514,
        q3: 348617,
        q4: 377668,
        deptCode: "G&A",
        location: "San Francisco",
        tenantId: 1
    },
    {
        deptId: 4,
        name: "Sales",
        budget: 2743744,
        q1: 493874,
        q2: 658499,
        q3: 713373,
        q4: 877998,
        deptCode: "Sales",
        location: "Austin",
        tenantId: 1
    },
    {
        deptId: 5,
        name: "Professional Services",
        budget: 806984,
        q1: 201746,
        q2: 201746,
        q3: 177536,
        q4: 225955,
        deptCode: "PS",
        location: "San Francisco",
        tenantId: 2
    }
];

describe("DataTable", () => {
    describe("Create Operation", () => {
        describe("Read Only", () => {
            describe("Details Below", () => {
                xit("To Do", () => {});
            });
            describe("Simple View Only", () => {
                xit("To Do", () => {});
            });
        });
        describe("Editable", () => {
            describe("Form As Dialog", () => {
                xit("To Do", () => {});
            });
            describe("Form Below", () => {
                xit("To Do", () => {});
            });
            describe("Inline Editable", () => {
                xit("To Do", () => {});
            });
            describe("Quick Edit", () => {
                let quick_edit_fixture;
                beforeEach(async () => {
                    @Component({
                        template: `
                            <div wmTable editmode="quickedit"></div>
                        `
                    })
                    class TestQuickEditTableComponent {}
                    TestBed.configureTestingModule({
                        declarations: [
                            ...Dependencies,
                            TestQuickEditTableComponent
                        ],
                        providers
                    }).compileComponents();
                    quick_edit_fixture = TestBed.createComponent(
                        TestQuickEditTableComponent
                    );
                    quick_edit_fixture.detectChanges();
                });
                it("Should create the component", () => {
                    expect(quick_edit_fixture.componentInstance).toBeDefined();
                });
                it("Should have a editable new row ", () => {
                    const debugEl =
                        quick_edit_fixture.debugElement.nativeElement;
                    const tableBodyEl = debugEl.querySelector(
                        ".app-datagrid-body"
                    );
                    const tableRowEls = tableBodyEl.querySelectorAll(
                        "tr.app-datagrid-row.always-new-row.row-editing"
                    );
                    expect(tableRowEls.length).toEqual(1);
                });
                it("Should have a editable new row in the end", () => {
                    const debugEl = quick_edit_fixture.debugElement.query(
                        By.css("div")
                    );
                    const compInstance = debugEl.componentInstance;
                    compInstance.populateGridData(testData);
                    quick_edit_fixture.detectChanges();
                    const tableBodyEl = debugEl.nativeElement.querySelector(
                        ".app-datagrid-body"
                    );
                    const lastRowEls = tableBodyEl.querySelectorAll(
                        "tr.app-datagrid-row:last-child"
                    );
                    expect(
                        lastRowEls[0].matches(
                            ".app-datagrid-row.always-new-row.row-editing"
                        )
                    ).toBeTruthy();
                });
                it("Should have a editable new row with all the columns of the loaded data in the end", () => {
                    const debugEl = quick_edit_fixture.debugElement.query(
                        By.css("div")
                    );
                    const compInstance = debugEl.componentInstance;
                    compInstance.populateGridData(testData);
                    quick_edit_fixture.detectChanges();
                    const newRowEl = quick_edit_fixture.debugElement.nativeElement.querySelector(
                        ".always-new-row.row-editing"
                    );
                    const newRowColEls = newRowEl.querySelectorAll("td");
                    expect(newRowColEls.length).toEqual(
                        Object.keys(testData[0]).length
                    );
                });
                it("Should have a new row with all the columns of data in the end with empty value", () => {
                    const debugEl = quick_edit_fixture.debugElement.query(
                        By.css("div")
                    );
                    const compInstance = debugEl.componentInstance;
                    compInstance.populateGridData(testData);
                    quick_edit_fixture.detectChanges();
                    const newRowEl = quick_edit_fixture.debugElement.nativeElement.querySelector(
                        ".always-new-row.row-editing"
                    );
                    const newRowColEls = newRowEl.querySelectorAll("td");
                    let emptyColCount = Array.prototype.filter.call(
                        newRowColEls,
                        el => el.innerHTML === ""
                    ).length;
                    expect(emptyColCount).toEqual(
                        Object.keys(testData[0]).length
                    );
                });
                xit("Tab out between columns", () => {});
                xit("Tab out of last columns with empty new-row", () => {});
                xit("Tab out of last columns with non empty new-row", () => {});
                xit("Tab out of last columns with non-empty exisiting row", () => {});
                describe("Pagination", () => {
                    describe("Basic", () => {
                        // ADD COLUMNS STEP
                        xit("To Do", () => {});
                    });
                    describe("Pager", () => {
                        xit("To Do", () => {});
                    });
                    describe("Classic", () => {
                        xit("To Do", () => {});
                    });
                    describe("None", () => {
                        xit("To Do", () => {});
                    });
                });
            });
        });
    });
});
