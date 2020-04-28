import { async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { App, } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { SliderComponent } from './slider.component';
import { compileTestComponent, getHtmlSelectorElement } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { FormsModule, NgModel } from '@angular/forms';


const mockApp = {};

const markup = `<div wmSlider 
                    ngModel  
                    name="slider1" 
                    class="test" 
                    width="600" 
                    height="40" 
                    margin="24px"
                    tabindex="1" 
                    minvalue="100" 
                    maxvalue="200" 
                    hint="qwerty" 
                    ngModel >
                    </div> `;
 
@Component({
    template: markup
})
class SliderWrapperComponent {
    @ViewChild(SliderComponent)
    wmComponent: SliderComponent;
    @ViewChild(NgModel) ngModel: NgModel;
}

const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule,
    ],
    declarations: [SliderComponent, SliderWrapperComponent ],
    providers: [
        {provide: App, useValue: mockApp},
        { provide: ComponentFixtureAutoDetect, useValue: true }
    ],
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'div',
    inputElementSelector: 'input',
    widgetSelector: '[wmSlider]',
    testModuleDef: testModuleDef,
    testComponent: SliderWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe('SliderComponent', () => {
    let sliderWrapperComponent: SliderWrapperComponent;
    let wmComponent: SliderComponent;
    let fixture: ComponentFixture<SliderWrapperComponent>;

    beforeEach(async(() => {
        fixture = compileTestComponent(testModuleDef, SliderWrapperComponent);
        sliderWrapperComponent = fixture.componentInstance;
        wmComponent = sliderWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the popover Component', () => {
        expect(sliderWrapperComponent).toBeTruthy();
    });

});

