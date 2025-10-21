import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component, ViewChild } from "@angular/core";
import { CompositeDirective } from "./composite.directive";
import { App } from "@wm/core";
import { WidgetRef } from '@wm/components/base';
import { compileTestComponent, mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef } from 'projects/components/base/src/test/common-widget.specs';

const markup = `<div wmComposite #wm_composite
     hint="Composite content" name="composite1" captionposition="left" [attr.required]="true">
</div>`;

@Component({
    template: markup
})
class CompositeWrapperComponent {
    @ViewChild(CompositeDirective, { static: false }) wmComponent: CompositeDirective;
}

const testModuleDef = {
    declarations: [],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: WidgetRef, useValue: { widget: {} } }
    ],
    imports: [CompositeDirective,
        CompositeWrapperComponent],
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-html',
    widgetSelector: '[wmHtml]',
    testModuleDef: testModuleDef,
    testComponent: CompositeWrapperComponent,
};
const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();
// TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();
describe('CompositeDirective', () => {
    let wrapperComponent: CompositeWrapperComponent;
    let component: CompositeDirective;
    let fixture: ComponentFixture<CompositeWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, CompositeWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        component = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have default classes', () => {
        expect(component.nativeElement.classList.contains('form-group')).toBeTruthy();
        expect(component.nativeElement.classList.contains('app-composite-widget')).toBeTruthy();
        expect(component.nativeElement.classList.contains('clearfix')).toBeTruthy();
    });

    it('should set required property', () => {
        component.onPropertyChange('required', true, false);
        expect(component.required).toBeTruthy();
    });

    it('should assign required to sub-components', (done) => {
        const mockComponentRef = { widget: { required: false } };
        component['componentRefs'] = [mockComponentRef];
        component.onPropertyChange('required', true, false);

        setTimeout(() => {
            expect(mockComponentRef.widget.required).toBeTruthy();
            done();
        }, 100);
    });

    it('should call addForIdAttributes in ngAfterViewInit', () => {
        const addForIdAttributesSpy = jest.spyOn(require('@wm/core'), 'addForIdAttributes');
        component.ngAfterViewInit();
        expect(addForIdAttributesSpy).toHaveBeenCalledWith(component.nativeElement);
    });
});
