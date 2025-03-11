import { Component, NO_ERRORS_SCHEMA, ViewChild, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DialogComponent } from './dialog.component';
import { Context, provideAsDialogRef, provideAsWidgetRef } from '@wm/components/base';
import { By } from '@angular/platform-browser';
import { ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { AbstractDialogService, App } from '@wm/core';
import { BsModalService } from 'ngx-bootstrap/modal';

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

const markup = `<div wmDialog></div>`;

@Component({
    template: markup
})
class DialogWrapperComponent {
    @ViewChild(DialogComponent, { static: true }) wmComponent: DialogComponent;
}

@Component({
    selector: 'wm-form',
    template: '<form></form>'
})
class MockFormComponent {
    getNativeElement() {
        return {
            addEventListener: jest.fn()
        };
    }
    ngform = { valid: true };
    dataoutput = { username: 'test', password: 'test' };
}

@Component({
    selector: 'wm-button',
    template: '<button></button>'
})
class MockButtonComponent {
    getNativeElement() {
        return {
            getAttribute: jest.fn().mockReturnValue('loginButton'),
            classList: ['app-login-button'],
            addEventListener: jest.fn()
        };
    }
}

@Component({
    selector: 'wm-message',
    template: '<div></div>'
})
class MockMessageComponent {
    showMessage = jest.fn();
}

const testModuleDef = {
    imports: [FormsModule, DialogComponent,],
    declarations: [
        DialogWrapperComponent,
        MockFormComponent,
        MockButtonComponent,
        MockMessageComponent
    ],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        provideAsWidgetRef(DialogComponent),
        provideAsDialogRef(DialogComponent),
        { provide: Context, useFactory: () => ({}), multi: true },
        { provide: App, useValue: mockApp },
        { provide: BsModalService, useClass: MockBsModalService },
        { provide: AbstractDialogService, useClass: MockAbstractDialogService }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-dialog',
    widgetSelector: '[wmDialog]',
    testModuleDef: testModuleDef,
    testComponent: DialogWrapperComponent,
    inputElementSelector: 'div'
};

describe('DialogComponent', () => {
    let wrapperComponent: DialogWrapperComponent;
    let dialogComponent: DialogComponent;
    let fixture: ComponentFixture<DialogWrapperComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(testModuleDef)
            .compileComponents()
            .then(() => {
                fixture = compileTestComponent(testModuleDef, DialogWrapperComponent);
                wrapperComponent = fixture.componentInstance;
                dialogComponent = wrapperComponent.wmComponent;
                // Mock TemplateRefs
                dialogComponent.dialogTemplate = {} as TemplateRef<any>;
                dialogComponent.dialogBody = {} as TemplateRef<any>;
                dialogComponent.dialogFooter = {} as TemplateRef<any>;

                fixture.detectChanges();
            });
    }));

    it('should create dialog component', () => {
        expect(wrapperComponent).toBeTruthy();
        expect(dialogComponent).toBeTruthy();
    });

    it('should initialize properties correctly', () => {
        expect(dialogComponent.dialogTemplate).toBeDefined();
        expect(dialogComponent.isDialogComponent).toBe(true);
    });

    it('should render the dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmDialog]'));
        expect(dialogElement).not.toBeNull();
    });
    it('should open the dialog correctly', () => {
        const openSpy = jest.spyOn(dialogComponent, 'open');
        dialogComponent.open();
        expect(openSpy).toHaveBeenCalled();
    });
    it("should close the dialog correctly", () => {
        const closeSpy = jest.spyOn(dialogComponent, 'close');
        dialogComponent.close();
        expect(closeSpy).toHaveBeenCalled();
    });
});
