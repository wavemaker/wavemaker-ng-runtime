import { Component, NO_ERRORS_SCHEMA, ViewChild, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AlertDialogComponent } from './alert-dialog.component';
import { Context, provideAsWidgetRef } from '@wm/components/base';
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

const markup = `<div wmAlertDialog></div>`;
@Component({
    template: markup
})
class AlertDialogWrapperComponent {
    @ViewChild(AlertDialogComponent, { static: true }) wmComponent: AlertDialogComponent;
}

const testModuleDef = {
    imports: [FormsModule],
    declarations: [
        AlertDialogWrapperComponent,
        AlertDialogComponent
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        provideAsWidgetRef(AlertDialogComponent),
        { provide: Context, useFactory: () => ({}), multi: true },
        { provide: App, useValue: mockApp },
        { provide: BsModalService, useClass: MockBsModalService },
        { provide: AbstractDialogService, useClass: MockAbstractDialogService }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-alert-dialog',
    widgetSelector: '[wmAlertDialog]',
    testModuleDef: testModuleDef,
    testComponent: AlertDialogWrapperComponent,
    inputElementSelector: 'div'
};

describe('AlertDialogComponent', () => {
    let wrapperComponent: AlertDialogWrapperComponent;
    let dialogComponent: AlertDialogComponent;
    let fixture: ComponentFixture<AlertDialogWrapperComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(testModuleDef)
            .compileComponents()
            .then(() => {
                fixture = compileTestComponent(testModuleDef, AlertDialogWrapperComponent);
                wrapperComponent = fixture.componentInstance;
                dialogComponent = wrapperComponent.wmComponent;
                dialogComponent.dialogTemplate = {} as TemplateRef<any>;
                fixture.detectChanges();
            });
    }));

    it('should create alert dialog component', () => {
        expect(wrapperComponent).toBeTruthy();
        expect(dialogComponent).toBeTruthy();
    });

    it('should render the alert dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmAlertDialog]'));
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
    it('should render the dialog dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmAlertDialog]'));
        expect(dialogElement).not.toBeNull();
    });
});
