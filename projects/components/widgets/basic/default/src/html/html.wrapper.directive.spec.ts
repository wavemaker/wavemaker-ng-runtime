import { Component, ElementRef, SecurityContext, ViewChild } from "@angular/core";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../../base/src/test/common-widget.specs";
import { HtmlDirective } from "./html.directive";
import { App, setCSS } from "@wm/core";
import { SanitizePipe } from "@wm/components/base";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { By } from "@angular/platform-browser";

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    setCSS: jest.fn(),
    setProperty: jest.fn(),
}));

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
        SanitizePipe
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
        // Mock setInitProps to avoid initState error
        jest.spyOn(directive as any, 'setInitProps').mockImplementation(() => { });

        // Mock super.ngOnInit() if necessary
        jest.spyOn(Object.getPrototypeOf(HtmlDirective.prototype), 'ngOnInit').mockImplementation(() => { });

        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set overflow to auto when height is provided', () => {
        let elementRefMock: ElementRef;
        let nativeElementMock: any;
        nativeElementMock = document.createElement('div');
        elementRefMock = { nativeElement: nativeElementMock } as ElementRef;
        const injectorMock = {
            get: jest.fn().mockImplementation((token) => {
                if (token === ElementRef) return elementRefMock;

                if (token === App) return mockApp

                return null;
            }),
            _lView: [null, null, null, null, null, null, null, null, { index: 0 }],
            _tNode: {
                attrs: ['attr1', 'value1', 'attr2', 'value2']
            }
        } as any;
        const sanitizePipe = TestBed.inject(SanitizePipe);
        directive = new HtmlDirective(injectorMock, '100px', undefined, sanitizePipe, undefined);

        expect(setCSS).toHaveBeenCalledWith(directive['nativeElement'], 'overflow', 'auto');
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            // Reset innerHTML before each test
            directiveElement.innerHTML = '';
        });

        it('should clear innerHTML when boundContent is set', () => {
            (directive as any).boundContent = 'some binding';
            directiveElement.innerHTML = '<p>Initial content</p>';
            directive.ngOnInit();
            expect(directiveElement.innerHTML).toBe('');
        });

        it('should not clear innerHTML when boundContent is not set', () => {
            directiveElement.innerHTML = '<p>Initial content</p>';
            directive.ngOnInit();
            expect(directiveElement.innerHTML).toBe('<p>Initial content</p>');
        });

        it('should set content from innerHTML if content is not provided', () => {
            directiveElement.innerHTML = '<p>Initial content</p>';
            directive.ngOnInit();
            expect(directive.content).toBe('<p>Initial content</p>');
        });

        it('should not set content from innerHTML if content is already provided', () => {
            directive.content = 'Provided content';
            directiveElement.innerHTML = '<p>Initial content</p>';
            directive.ngOnInit();
            expect(directive.content).toBe('Provided content');
        });
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