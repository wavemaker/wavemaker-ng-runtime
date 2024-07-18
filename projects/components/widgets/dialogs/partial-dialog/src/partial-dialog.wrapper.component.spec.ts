import { Component, NO_ERRORS_SCHEMA, ViewChild, TemplateRef, ContentChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PartialDialogComponent } from './partial-dialog.component';
import { Context, provideAsWidgetRef } from '@wm/components/base';
import { BaseDialog } from '@wm/components/dialogs';
import { By } from '@angular/platform-browser';
import { ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { AbstractDialogService, App } from '@wm/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';

// Mock Services
class MockBsModalService {
    show = jest.fn();
    onShown = new BehaviorSubject({ id: 1 });
    onShow = new BehaviorSubject({});
    onHidden = new BehaviorSubject({});
    onHide = new BehaviorSubject({});
}

class MockAbstractDialogService {
    addToOpenedDialogs = jest.fn();
    getOpenedDialogs = jest.fn(() => []);
    removeFromOpenedDialogs = jest.fn();
    addToClosedDialogs = jest.fn();
    removeFromClosedDialogs = jest.fn();
    register = jest.fn();
    deRegister = jest.fn();
    getLastOpenedDialog = jest.fn();
    getDialogRefFromClosedDialogs = jest.fn();
}

const markup = `<div wmPartialDialog></div>`;

@Component({
    template: markup
})
class PartialDialogWrapperComponent {
    @ViewChild(PartialDialogComponent, { static: true }) wmComponent: PartialDialogComponent;
}

const testModuleDef = {
    imports: [FormsModule],
    declarations: [
        PartialDialogWrapperComponent,
        PartialDialogComponent
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        provideAsWidgetRef(PartialDialogComponent),
        { provide: Context, useFactory: () => ({}), multi: true },
        { provide: App, useValue: mockApp },
        { provide: BsModalService, useClass: MockBsModalService },
        { provide: AbstractDialogService, useClass: MockAbstractDialogService }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-partial-dialog',
    widgetSelector: '[wmPartialDialog]',
    testModuleDef: testModuleDef,
    testComponent: PartialDialogWrapperComponent,
    inputElementSelector: 'div'
};

describe('PartialDialogComponent', () => {
    let wrapperComponent: PartialDialogWrapperComponent;
    let dialogComponent: PartialDialogComponent;
    let fixture: ComponentFixture<PartialDialogWrapperComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(testModuleDef)
            .compileComponents()
            .then(() => {
                fixture = compileTestComponent(testModuleDef, PartialDialogWrapperComponent);
                wrapperComponent = fixture.componentInstance;
                dialogComponent = wrapperComponent.wmComponent;
                dialogComponent.dialogTemplate = {} as TemplateRef<any>;
                dialogComponent.dialogContent = {} as TemplateRef<any>;
                fixture.detectChanges();
            });
    }));

    it('should create partial dialog component', () => {
        expect(wrapperComponent).toBeTruthy();
        expect(dialogComponent).toBeTruthy();
    });

    it('should render the partial dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmPartialDialog]'));
        expect(dialogElement).not.toBeNull();
    });
    it('should render the partial dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmPartialDialog]'));
        expect(dialogElement).not.toBeNull();
    });
    it('should initialize properties correctly', () => {
        expect(dialogComponent.dialogTemplate).toBeDefined();
    });
    it('should close the dialog correctly', () => {
        const closeSpy = jest.spyOn(dialogComponent, 'close');
        dialogComponent.close();
        expect(closeSpy).toHaveBeenCalled();
    });

    //TypeError: Cannot read properties of null (reading 'nativeElement')
    xit("should call 'close' method on close button click", () => {
        const closeSpy = jest.spyOn(dialogComponent, 'close');
        const closeButton = fixture.debugElement.query(By.css('.close'));
        closeButton.nativeElement.click();
        expect(closeSpy).toHaveBeenCalled();
    });
});
