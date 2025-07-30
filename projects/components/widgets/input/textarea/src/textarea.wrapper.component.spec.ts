import { Component, ViewChild } from "@angular/core";
import { TextareaComponent } from "./textarea.component";
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { FormsModule, NgModel } from "@angular/forms";
import { App, AppDefaults } from "@wm/core";
import { ToDatePipe } from "@wm/components/base";
import { DatePipe } from "@angular/common";
import { ComponentFixture } from "@angular/core/testing";
import { compileTestComponent, mockApp } from "projects/components/base/src/test/util/component-test-util";
import { By } from "@angular/platform-browser";

const markup = `<wm-textarea name="textarea1" hint="textarea field">`;

@Component({
    template: markup
})
class TextareaWrapperComponent {
    @ViewChild(TextareaComponent, { static: true }) wmComponent: TextareaComponent;
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, TextareaComponent],
    declarations: [TextareaWrapperComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-textarea',
    widgetSelector: '[wmTextarea]',
    testModuleDef: testModuleDef,
    testComponent: TextareaWrapperComponent,
    inputElementSelector: 'textarea'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyAccessibility();

describe('TextareaComponent', () => {
    let wmComponent: TextareaComponent;
    let fixture: ComponentFixture<TextareaWrapperComponent>, testElement;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, TextareaWrapperComponent);
        fixture.detectChanges();
        wmComponent = fixture.componentInstance.wmComponent;
    });

    it('should create the component', () => {
        expect(wmComponent).toBeTruthy();
    });

    it('should update charlength on input change', () => {
        const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
        textarea.value = 'test input';
        textarea.dispatchEvent(new Event('input'));

        expect(wmComponent.charlength).toBe(10);
    });

    it('should reflect initial input value in charlength', () => {
        wmComponent.inputEl.nativeElement.value = 'initial';
        wmComponent.onInputChange();
        expect(wmComponent.charlength).toBe(7);
    });

    it('should set required attribute', () => {
        wmComponent.required = true;
        fixture.detectChanges();
        const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
        expect(textarea.required).toBeTruthy();
    });

    it('should set placeholder attribute', () => {
        wmComponent.placeholder = 'Enter text';
        fixture.detectChanges();
        const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
        expect(textarea.placeholder).toBe('Enter text');
    });

    it('should set readonly attribute', () => {
        wmComponent.readonly = true;
        fixture.detectChanges();
        const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
        expect(textarea.readOnly).toBeTruthy();
    });
});
