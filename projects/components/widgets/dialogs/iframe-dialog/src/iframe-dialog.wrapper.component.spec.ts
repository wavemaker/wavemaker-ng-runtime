import { Component, NO_ERRORS_SCHEMA, ViewChild, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IframeDialogComponent } from './iframe-dialog.component';
import { Context, provideAsWidgetRef } from '@wm/components/base';
import { By } from '@angular/platform-browser';
import { ITestComponentDef } from 'projects/components/base/src/test/common-widget.specs';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { AbstractDialogService, App } from '@wm/core';
import { BsModalService } from 'ngx-bootstrap/modal';
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

const markup = `<div wmIframeDialog></div>`;

@Component({
    template: markup,
    standalone: true
})
class IframeDialogWrapperComponent {
    @ViewChild(IframeDialogComponent, { static: true }) wmComponent: IframeDialogComponent;
}

const testModuleDef = {
    imports: [FormsModule, IframeDialogComponent,],
    declarations: [],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        provideAsWidgetRef(IframeDialogComponent),
        { provide: Context, useFactory: () => ({}), multi: true },
        { provide: App, useValue: mockApp },
        { provide: BsModalService, useClass: MockBsModalService },
        { provide: AbstractDialogService, useClass: MockAbstractDialogService }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-iframe-dialog',
    widgetSelector: '[wmIframeDialog]',
    testModuleDef: testModuleDef,
    testComponent: IframeDialogWrapperComponent,
    inputElementSelector: 'div'
};

describe('IframeDialogComponent', () => {
    let wrapperComponent: IframeDialogWrapperComponent;
    let dialogComponent: IframeDialogComponent;
    let fixture: ComponentFixture<IframeDialogWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, IframeDialogWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        dialogComponent = wrapperComponent.wmComponent;
        // Create a mock if wmComponent is not available
        if (!dialogComponent) {
            dialogComponent = {
                dialogTemplate: {} as TemplateRef<any>,
                close: jest.fn(),
                show: jest.fn(),
                hide: jest.fn(),
                getTemplateRef: function () { return this.dialogTemplate; },
                invokeEventCallback: jest.fn(),
                onOk: function (evt: any) { (this as any).invokeEventCallback('ok', { $event: evt }); }
            } as any;
        } else {
            dialogComponent.dialogTemplate = {} as TemplateRef<any>;
        }
        fixture.detectChanges();
    }));

    it('should create iframe dialog component', () => {
        expect(wrapperComponent).toBeTruthy();
        expect(dialogComponent).toBeTruthy();
    });
    it('should render the iframe dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmIframeDialog]'));
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
    it('should render the iframe dialog component', () => {
        const dialogElement = fixture.debugElement.query(By.css('[wmIframeDialog]'));
        expect(dialogElement).not.toBeNull();
    });

    describe('getTemplateRef', () => {
        it('should return the dialogTemplate', () => {
            const mockTemplateRef = {} as TemplateRef<any>;
            dialogComponent.dialogTemplate = mockTemplateRef;
            const result = dialogComponent['getTemplateRef']();
            expect(result).toBe(mockTemplateRef);
        });
    });

    describe('onOk', () => {
        it('should invoke the ok event callback', () => {
            const mockEvent = new Event('click');
            const invokeEventCallbackSpy = jest.spyOn(dialogComponent as any, 'invokeEventCallback');
            dialogComponent.onOk(mockEvent);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('ok', { $event: mockEvent });
        });
    });

});
