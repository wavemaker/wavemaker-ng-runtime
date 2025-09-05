import { Component, ViewChild } from "@angular/core";
import { AnchorComponent, disableContextMenu } from "./anchor.component";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, getHtmlSelectorElement, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { App, EventNotifier } from '@wm/core';

const markup = `<a wmAnchor data-identifier="anchor" #wm_anchor1="wmAnchor" [attr.aria-label]="wm_anchor1.arialabel || wm_anchor1.caption || 'Link'" hint="Link" hyperlink="http://www.google.com/doodle4google/images/splashes/featured.png" tabindex="0" badgevalue="1" name="anchor1"></a>`;

@Component({
    template: markup
})
class AnchorWrapperComponent {
    @ViewChild(AnchorComponent, { static: true }) wmComponent: AnchorComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [AnchorComponent],
    declarations: [AnchorWrapperComponent,],
    providers: [
        { provide: App, useValue: mockApp },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-anchor',
    widgetSelector: '[wmAnchor]',
    testModuleDef: testModuleDef,
    testComponent: AnchorWrapperComponent,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe("AnchorComponent", () => {
    let wrapperComponent: AnchorWrapperComponent;
    let wmComponent: AnchorComponent;
    let fixture: ComponentFixture<AnchorWrapperComponent>;
    let hyperlink = "http://www.google.com/doodle4google/images/splashes/featured.png";
    let mockApp: jest.Mocked<App>;
    let mockEventNotifier: jest.Mocked<EventNotifier>;

    beforeEach(() => {
        mockApp = {
            subscribe: jest.fn(),
            activePageName: 'TestPage'
        } as unknown as jest.Mocked<App>;

        mockEventNotifier = {
            subscribe: jest.fn(),
            notify: jest.fn(),
            destroy: jest.fn()
        } as unknown as jest.Mocked<EventNotifier>;

        fixture = compileTestComponent(testModuleDef, AnchorWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        (wmComponent as any)._eventNotifier = mockEventNotifier;
        (wmComponent as any).app = mockApp;
        fixture.detectChanges();
    });

    it("should create anchor component", () => {
        expect(wmComponent).toBeTruthy();
    });

    it("should have badge value", () => {
        expect(wmComponent.badgevalue).toBe("1");
    });

    it("should have tabindex", () => {
        let tabindex = getHtmlSelectorElement(fixture, 'a').nativeElement.attributes.getNamedItem('tabindex');
        expect(parseInt(tabindex.value)).toBe(0);
    });

    it("should have identifier", () => {
        let identifier = getHtmlSelectorElement(fixture, 'a').nativeElement.attributes.getNamedItem('data-identifier');
        expect(identifier.value).toBe("anchor");
    });

    it("should have hyperlink", () => {
        expect(wmComponent.hyperlink).toBe(hyperlink);
    });

    it("should trigger onPropertyChange", () => {
        jest.spyOn(wmComponent, 'onPropertyChange');
        wmComponent.onPropertyChange("hyperlink", hyperlink, hyperlink);
        expect(wmComponent.hyperlink).toBe(hyperlink);
    });

    it("should trigger onPropertyChange without nv value", () => {
        jest.spyOn(wmComponent, 'onPropertyChange');
        wmComponent.onPropertyChange("hyperlink", "", hyperlink);
        expect(wmComponent.hyperlink).toBe(hyperlink);
    });

    it("should trigger onPropertyChange with encodeurl", () => {
        wmComponent.encodeurl = true;
        jest.spyOn(wmComponent, 'onPropertyChange');
        wmComponent.onPropertyChange("hyperlink", hyperlink, hyperlink);
        expect(wmComponent.hyperlink).toBe(hyperlink);
    });

    it("should trigger onPropertyChange with www.", () => {
        jest.spyOn(wmComponent, 'onPropertyChange');
        wmComponent.onPropertyChange("hyperlink", "www.google.com", hyperlink);
        expect(wmComponent.hyperlink).toBe(hyperlink);
    });

    it("should trigger ngOnAttach", () => {
        jest.spyOn(wmComponent, 'ngOnAttach');
        wmComponent.ngOnAttach();
        expect(wmComponent.nativeElement.getAttribute('aria-label')).toBe("Link");
    });

    it("should onActive callback", () => {
        jest.spyOn(wmComponent, 'onActive');
        wmComponent.onActive(() => { });
        expect(mockEventNotifier.subscribe).toHaveBeenCalledWith('on-active', expect.any(Function));
    });

    describe('processEventAttr', () => {
        it('should not set hasNavigationToCurrentPageExpr when navigating to different page', () => {
            (wmComponent as any).processEventAttr('click', 'Actions.goToPage_OtherPage.invoke()');
            expect((wmComponent as any).hasNavigationToCurrentPageExpr).toBeFalsy();
        });

        it('should set hasGoToPageExpr and goToPageName', () => {
            (wmComponent as any).processEventAttr('click', 'Actions.goToPage_SomePage.invoke()');
            expect((wmComponent as any).hasGoToPageExpr).toBeTruthy();
            expect((wmComponent as any).goToPageName).toBe('SomePage');
        });
    });

    describe('init', () => {
        it('should notify "on-active" when conditions are met', () => {
            (wmComponent as any).hasNavigationToCurrentPageExpr = true;
            wmComponent.init();
            expect(mockEventNotifier.notify).toHaveBeenCalledWith("on-active", {});
        });
    });

    describe('ngAfterViewInit', () => {
        it('should subscribe to "highlightActiveLink" when hasGoToPageExpr is true', () => {
            (wmComponent as any).hasGoToPageExpr = true;
            wmComponent.ngAfterViewInit();
            expect(mockApp.subscribe).toHaveBeenCalledWith("highlightActiveLink", expect.any(Function));
        });
    });

    describe('ngOnDestroy', () => {
        it('should destroy eventNotifier and cancel subscription', () => {
            const mockCancelSubscription = jest.fn();
            (wmComponent as any).cancelSubscription = mockCancelSubscription;
            wmComponent.ngOnDestroy();
            expect(mockEventNotifier.destroy).toHaveBeenCalled();
            expect(mockCancelSubscription).toHaveBeenCalled();
        });
    });

    describe('handleEvent', () => {
        let mockNode: HTMLElement;
        let mockEventCallback: jest.Mock;
        let mockEvent: Event;
        let superHandleEventSpy: jest.SpyInstance;

        beforeEach(() => {
            mockNode = document.createElement('a');
            mockEventCallback = jest.fn();
            mockEvent = new Event('click');
            Object.defineProperty(mockEvent, 'preventDefault', { value: jest.fn() });

            superHandleEventSpy = jest.spyOn(Object.getPrototypeOf(AnchorComponent.prototype), 'handleEvent')
                .mockImplementation((node, eventName, handler: any) => {
                    // Simulate the event handler being called
                    handler(mockEvent);
                });
        });

        afterEach(() => {
            superHandleEventSpy.mockRestore();
        });

        it('should call super.handleEvent with correct parameters', () => {
            (wmComponent as any).handleEvent(mockNode, 'click', mockEventCallback, {}, 'testMeta');

            expect(superHandleEventSpy).toHaveBeenCalledWith(
                mockNode,
                'click',
                expect.any(Function),
                {},
                'testMeta'
            );
        });

        it('should prevent default if hasGoToPageExpr is true and $event is provided', () => {
            (wmComponent as any).hasGoToPageExpr = true;
            const locals = { $event: mockEvent };

            (wmComponent as any).handleEvent(mockNode, 'click', mockEventCallback, locals);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEventCallback).toHaveBeenCalled();
        });

        it('should not prevent default if hasGoToPageExpr is false', () => {
            (wmComponent as any).hasGoToPageExpr = false;
            const locals = { $event: mockEvent };

            (wmComponent as any).handleEvent(mockNode, 'click', mockEventCallback, locals);

            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
            expect(mockEventCallback).toHaveBeenCalled();
        });

        it('should not prevent default if $event is not provided', () => {
            (wmComponent as any).hasGoToPageExpr = true;
            const locals = {};

            (wmComponent as any).handleEvent(mockNode, 'click', mockEventCallback, locals);

            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
            expect(mockEventCallback).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        let superAfterViewInitSpy: jest.SpyInstance;
        let initSpy: jest.SpyInstance;

        beforeEach(() => {
            superAfterViewInitSpy = jest.spyOn(Object.getPrototypeOf(AnchorComponent.prototype), 'ngAfterViewInit');
            initSpy = jest.spyOn(wmComponent as any, 'init').mockImplementation();
            (wmComponent as any).nativeElement = document.createElement('a');
        });

        afterEach(() => {
            superAfterViewInitSpy.mockRestore();
            initSpy.mockRestore();
        });

        it('should call super.ngAfterViewInit and init', () => {
            wmComponent.ngAfterViewInit();

            expect(superAfterViewInitSpy).toHaveBeenCalled();
            expect(initSpy).toHaveBeenCalled();
        });

        it('should not subscribe to highlightActiveLink if hasGoToPageExpr is false', () => {
            (wmComponent as any).hasGoToPageExpr = false;
            wmComponent.ngAfterViewInit();

            expect(mockApp.subscribe).not.toHaveBeenCalled();
        });

        it('should subscribe to highlightActiveLink if hasGoToPageExpr is true', () => {
            (wmComponent as any).hasGoToPageExpr = true;
            wmComponent.ngAfterViewInit();

            expect(mockApp.subscribe).toHaveBeenCalledWith('highlightActiveLink', expect.any(Function));
        });

        describe('highlightActiveLink subscription', () => {
            beforeEach(() => {
                (wmComponent as any).hasGoToPageExpr = true;
                (wmComponent as any).goToPageName = 'TestPage';
                wmComponent.ngAfterViewInit();
            });

            it('should remove active class and aria-current when navigating away from current page', () => {
                const callback = mockApp.subscribe.mock.calls[0][1];
                (wmComponent as any).hasNavigationToCurrentPageExpr = true;
                (wmComponent as any).app.activePageName = 'OtherPage';

                callback({ pageName: 'OtherPage' });

                expect((wmComponent as any).hasNavigationToCurrentPageExpr).toBeFalsy();
                expect((wmComponent as any).nativeElement.classList.contains('active')).toBeFalsy();
                expect((wmComponent as any).nativeElement.getAttribute('aria-current')).toBeNull();
            });

            it('should add active class and aria-current when navigating to the target page', () => {
                const callback = mockApp.subscribe.mock.calls[0][1];

                callback({ pageName: 'TestPage' });

                expect((wmComponent as any).hasNavigationToCurrentPageExpr).toBeTruthy();
            });
        });
    });


    describe('disableContextMenu', () => {
        it('should call preventDefault on the passed event', () => {
            // Create a mock event object with a preventDefault method
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as Event;

            // Call the function with the mock event
            disableContextMenu(mockEvent);

            // Assert that preventDefault was called
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should not throw an error when called with a valid event', () => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as Event;

            expect(() => disableContextMenu(mockEvent)).not.toThrow();
        });
    });
});
