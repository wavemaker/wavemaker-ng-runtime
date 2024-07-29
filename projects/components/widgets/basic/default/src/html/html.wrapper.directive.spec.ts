import { Component, SecurityContext, ViewChild } from "@angular/core";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { HtmlDirective } from "./html.directive";
import { App } from "@wm/core";
import { SanitizePipe } from "@wm/components/base";
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { By } from "@angular/platform-browser";

const markup = `<div wmHtml #wm_html2="wmHtml" [attr.aria-label]="wm_html2.hint || 'HTML content'" hint="HTML content"  name="html1">`;

@Component({
    template: markup
})
class HtmlWrapperDirective {
    @ViewChild(HtmlDirective, { static: true }) wmComponent: HtmlDirective;
}

const testModuleDef: ITestModuleDef = {
    imports: [],
    declarations: [HtmlWrapperDirective, HtmlDirective],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: SanitizePipe, useClass: SanitizePipe },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-html',
    widgetSelector: '[wmHtml]',
    testModuleDef: testModuleDef,
    testComponent: HtmlWrapperDirective,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();


describe('HtmlDirective', () => {
    let component: HtmlWrapperDirective;
    let fixture: ComponentFixture<HtmlWrapperDirective>;
    let directiveElement: HTMLElement;
    let directive: HtmlDirective;

    beforeEach(async () => {
        fixture = compileTestComponent(testModuleDef, HtmlWrapperDirective);
        component = fixture.componentInstance;
        directiveElement = fixture.debugElement.query(By.directive(HtmlDirective)).nativeElement;
        directive = fixture.debugElement.query(By.directive(HtmlDirective)).injector.get(HtmlDirective);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    describe('onPropertyChange', () => {
        it('should set innerHTML directly for trusted content', () => {
            const trustedContent = { changingThisBreaksApplicationSecurity: '<p>Trusted content</p>' };
            directiveElement.setAttribute('content.bind', 'trustAs:html:someBinding');
            const setPropertySpy = jest.spyOn(require('@wm/core'), 'setProperty');
            directive.onPropertyChange('content', trustedContent);
            expect(setPropertySpy).toHaveBeenCalledWith(directiveElement, 'innerHTML', '<p>Trusted content</p>');
        });

        it('should sanitize content when not trusted', () => {
            const unsafeContent = '<script>alert("XSS")</script><p>Safe content</p>';
            const sanitizePipeSpy = jest.spyOn(directive['sanitizePipe'], 'transform');
            const setPropertySpy = jest.spyOn(require('@wm/core'), 'setProperty');
            directive.onPropertyChange('content', unsafeContent);
            expect(sanitizePipeSpy).toHaveBeenCalledWith(unsafeContent, SecurityContext.HTML);
            expect(setPropertySpy).toHaveBeenCalled();
            expect(setPropertySpy.mock.calls[0][1]).toBe('innerHTML');
            expect(setPropertySpy.mock.calls[0][2]).not.toContain('<script>');
        });

        it('should handle non-content property changes', () => {
            const superOnPropertyChangeSpy = jest.spyOn(Object.getPrototypeOf(HtmlDirective.prototype), 'onPropertyChange');
            directive.onPropertyChange('someOtherProperty', 'newValue', 'oldValue');
            expect(superOnPropertyChangeSpy).toHaveBeenCalledWith('someOtherProperty', 'newValue', 'oldValue');
        });
        it('should handle empty string content', () => {
            directiveElement.innerHTML = '<p>Initial content</p>';
            const setPropertySpy = jest.spyOn(require('@wm/core'), 'setProperty');
            directive.onPropertyChange('content', '');
            expect(setPropertySpy).toHaveBeenCalledWith(directiveElement, 'innerHTML', '');
        });

        it('should handle numeric content', () => {
            const setPropertySpy = jest.spyOn(require('@wm/core'), 'setProperty');
            directive.onPropertyChange('content', 12345);
            expect(setPropertySpy).toHaveBeenCalledWith(directiveElement, 'innerHTML', '12345');
        });
    });

    
});