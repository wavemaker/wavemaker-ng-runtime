import { ComponentFixture } from '@angular/core/testing';
import { Component, SecurityContext, ViewChild } from "@angular/core";
import { LabelDirective } from "./label.directive";
import { App, setProperty, toggleClass } from "@wm/core";
import { SanitizePipe } from "@wm/components/base";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { By } from '@angular/platform-browser';
import { ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    setProperty: jest.fn(),
    toggleClass: jest.fn()
}));


const markup = `<label wmLabel #wm_label1="wmLabel" [attr.aria-label]="wm_label1.arialabel || 'Label text'" hint="Label text"  name="label1" paddingright="0.5em" paddingleft="0.5em"></label>`;

@Component({
    standalone: true,
    imports: [LabelDirective],
    template: markup
})
class LabelWrapperDirective {
    @ViewChild(LabelDirective, { static: true }) wmComponent: LabelDirective;
}
const testModuleDef = {
    imports: [LabelDirective, LabelWrapperDirective],
    declarations: [],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: SanitizePipe, useClass: SanitizePipe },
    ]
};

// Keep the existing TestBase calls
const componentDef = {
    $unCompiled: $(markup),
    type: 'wm-label',
    widgetSelector: '[wmLabel]',
    testModuleDef: testModuleDef,
    testComponent: LabelWrapperDirective,
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('LabelDirective', () => {
    let component: LabelWrapperDirective;
    let fixture: ComponentFixture<LabelWrapperDirective>;
    let directive: LabelDirective;
    let directiveElement: HTMLElement;

    beforeEach(async () => {
        fixture = compileTestComponent(testModuleDef, LabelWrapperDirective);
        component = fixture.componentInstance;
        directive = component.wmComponent;
        directiveElement = fixture.debugElement.query(By.directive(LabelDirective)).nativeElement;
        fixture.detectChanges();
    });

    describe('onPropertyChange', () => {
        it('should set textContent for object caption without trustAs', () => {
            const objCaption = { key: 'value' };
            directive && directive.onPropertyChange('caption', objCaption);
            expect(setProperty).toHaveBeenCalledWith(directiveElement, 'textContent', JSON.stringify(objCaption));
        });

        it('should set innerHTML for object caption with trustAs', () => {
            const objCaption = { __html: '<span>Trusted HTML</span>' };
            directiveElement.setAttribute('caption.bind', 'trustAs:html:someBinding');
            directive && directive.onPropertyChange('caption', objCaption);
            expect(setProperty).toHaveBeenCalledWith(directiveElement, 'innerHTML', '<span>Trusted HTML</span>');
        });

        it('should sanitize and set innerHTML for string caption', () => {
            const stringCaption = '<script>alert("XSS")</script>Safe text';
            const sanitizeSpy = jest.spyOn(directive['sanitizePipe'], 'transform').mockReturnValue('Safe text');
            directive && directive.onPropertyChange('caption', stringCaption);
            expect(sanitizeSpy).toHaveBeenCalledWith(stringCaption, SecurityContext.HTML);
            expect(setProperty).toHaveBeenCalledWith(directiveElement, 'innerHTML', 'Safe text');
        });

        it('should toggle required class when required property changes', () => {
            directive && directive.onPropertyChange('required', true);
            expect(toggleClass).toHaveBeenCalledWith(directiveElement, 'required', true);

            directive && directive.onPropertyChange('required', false);
            expect(toggleClass).toHaveBeenCalledWith(directiveElement, 'required', false);
        });

        it('should call super.onPropertyChange for other properties', () => {
            const superSpy = jest.spyOn(Object.getPrototypeOf(LabelDirective.prototype), 'onPropertyChange');
            directive && directive.onPropertyChange('someOtherProp', 'value');
            expect(superSpy).toHaveBeenCalledWith('someOtherProp', 'value', undefined);
        });
    });
});
