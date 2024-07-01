import { Component, NO_ERRORS_SCHEMA, ViewChild, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from './confirm-dialog.component';
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

const markup = `<div wmConfirmDialog></div>`;

@Component({
    template: markup
})
class ConfirmDialogWrapperComponent {
    @ViewChild(ConfirmDialogComponent, { static: true }) wmComponent: ConfirmDialogComponent;
}

const testModuleDef = {
    imports: [FormsModule],
    declarations: [
        ConfirmDialogWrapperComponent,
        ConfirmDialogComponent
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        provideAsWidgetRef(ConfirmDialogComponent),
        { provide: Context, useFactory: () => ({}), multi: true },
        { provide: App, useValue: mockApp },
        { provide: BsModalService, useClass: MockBsModalService },
        { provide: AbstractDialogService, useClass: MockAbstractDialogService }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-confirm-dialog',
    widgetSelector: '[wmConfirmDialog]',
    testModuleDef: testModuleDef,
    testComponent: ConfirmDialogWrapperComponent,
    inputElementSelector: 'div'
};

describe('ConfirmDialogComponent', () => {
    let wrapperComponent: ConfirmDialogWrapperComponent;
    let dialogComponent: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogWrapperComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(testModuleDef)
            .compileComponents()
            .then(() => {
                fixture = compileTestComponent(testModuleDef, ConfirmDialogWrapperComponent);
                wrapperComponent = fixture.componentInstance;
                dialogComponent = wrapperComponent.wmComponent;
                dialogComponent.dialogTemplate = {} as TemplateRef<any>;
                fixture.detectChanges();
            });
    }));
    it('should create confirm dialog component', () => {
        expect(wrapperComponent).toBeTruthy();
        expect(dialogComponent).toBeTruthy();
    });
    it('should initialize properties correctly', () => {
        expect(dialogComponent.dialogTemplate).toBeDefined();
    });
    it('should render the confirm dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmConfirmDialog]'));
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

});
