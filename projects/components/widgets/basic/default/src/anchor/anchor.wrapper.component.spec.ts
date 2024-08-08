import { Component, ViewChild } from "@angular/core";
import { AnchorComponent } from "./anchor.component";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { ComponentsTestModule } from "../../../../../base/src/test/components.test.module";
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, getHtmlSelectorElement } from "projects/components/base/src/test/util/component-test-util";
import { App, EventNotifier, addClass } from '@wm/core';

const markup = `<a wmAnchor data-identifier="anchor" #wm_anchor1="wmAnchor" [attr.aria-label]="wm_anchor1.hint || wm_anchor1.caption || 'Link'" hint="Link" hyperlink="http://www.google.com/doodle4google/images/splashes/featured.png" tabindex="0" badgevalue="1" name="anchor1"></a>`;

@Component({
    template: markup
})
class AnchorWrapperComponent {
    @ViewChild(AnchorComponent, { static: true }) wmComponent: AnchorComponent
}

const testModuleDef: ITestModuleDef = {
    imports: [ComponentsTestModule],
    declarations: [AnchorWrapperComponent, AnchorComponent],
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

});