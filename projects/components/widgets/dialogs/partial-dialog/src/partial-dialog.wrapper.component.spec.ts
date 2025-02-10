import { Component, NO_ERRORS_SCHEMA, ViewChild, TemplateRef, ContentChild, ElementRef } from '@angular/core';
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
    imports: [PartialDialogComponent],
    declarations: [
        PartialDialogWrapperComponent,
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

    describe('setPartialLoadListener', () => {
        it('should set up a listener for partialLoaded event and update properties', () => {
            const mockWidget = {
                Widgets: { testWidget: {} },
                Variables: { testVar: {} },
                Actions: { testAction: {} }
            };
            dialogComponent.partialRef = {
                nativeElement: { widget: mockWidget }
            } as ElementRef;
            let subscriberCallback: Function;
            const mockSubscribe = jest.fn().mockImplementation((event, callback) => {
                subscriberCallback = callback;
                return () => { }; // This mocks the cancelSubscription function
            });
            (dialogComponent as any).app = { subscribe: mockSubscribe } as any;
            (dialogComponent as any).setPartialLoadListener();
            expect(mockSubscribe).toHaveBeenCalledWith('partialLoaded', expect.any(Function));
            // Simulate the 'partialLoaded' event
            subscriberCallback();
            expect((dialogComponent as any).Widgets).toEqual(mockWidget.Widgets);
            expect((dialogComponent as any).Variables).toEqual(mockWidget.Variables);
            expect((dialogComponent as any).Actions).toEqual(mockWidget.Actions);
        });
    });
    describe('open', () => {
        it('should call super.open and setPartialLoadListener', () => {
            const superOpenSpy = jest.spyOn(BaseDialog.prototype, 'open');
            const setPartialLoadListenerSpy = jest.spyOn(dialogComponent as any, 'setPartialLoadListener');
            dialogComponent.open({ testInitState: true });
            expect(superOpenSpy).toHaveBeenCalledWith({ testInitState: true });
            expect(setPartialLoadListenerSpy).toHaveBeenCalled();
        });
    });
    describe('onOk', () => {
        it('should call invokeEventCallback with "ok" and the event object', () => {
            const mockEvent = new Event('click');
            const invokeEventCallbackSpy = jest.spyOn(dialogComponent, 'invokeEventCallback' as any);
            dialogComponent.onOk(mockEvent);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('ok', { $event: mockEvent });
        });

        it('should handle null event gracefully', () => {
            const invokeEventCallbackSpy = jest.spyOn(dialogComponent, 'invokeEventCallback' as any);
            dialogComponent.onOk(null);
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('ok', { $event: null });
        });
    });
});
