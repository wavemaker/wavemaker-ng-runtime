import { Component, ViewChild } from '@angular/core';
import { SwitchComponent } from './switch.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../../base/src/test/common-widget.specs';
import { FormsModule } from '@angular/forms';
import { async, ComponentFixture } from '@angular/core/testing';
import { compileTestComponent } from '../../../../../base/src/test/util/component-test-util';
import { App } from '@wm/core';

let mockApp = {};
const markup = `<div wmSwitch datavalue="yes" show="true" width="800" height="200" hint="test switch" tabindex="1" disabled="false" name="switch1"></div>`;

@Component({
    template: markup
})
class SwitchWrapperComponent {
    @ViewChild(SwitchComponent) wmComponent: SwitchComponent;
}
const testModuleDef: ITestModuleDef = {
    imports: [
        FormsModule
    ],
    declarations: [SwitchWrapperComponent, SwitchComponent],
    providers: [
        { provide: App, useValue: mockApp }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-switch',
    widgetSelector: '[wmSwitch]',
    testModuleDef: testModuleDef,
    testComponent: SwitchWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe('wm-switch: Component specific tests: ', () => {
    let wrapperComponent: SwitchWrapperComponent;
    let wmComponent: SwitchComponent;
    let fixture: ComponentFixture<SwitchWrapperComponent>;

    beforeEach(async(async() => {
        fixture  = compileTestComponent(testModuleDef, SwitchWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create switch compoent', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should have datavalue as yes by default', () => {
        expect(wmComponent.datavalue).toBe('yes');
    });

    it('should have datavalue as no', async(done) => {
        setDatavalue(fixture, done, 'no', 'no');
    });

    it('should have datavalue as yes when switch is in disabled state', async(done) => {
        wmComponent.setProperty('disabled', true);
        fixture.detectChanges();
        setDatavalue(fixture, done, 'no', 'yes');
    });

    function setDatavalue(fixture, done, value, expectedDatavalue) {
        fixture.whenStable().then(() => {
            // datasetitems has debounce time as 150ms so adding settimeout
            setTimeout(() => {
                done();
                fixture.detectChanges();
                fixture.nativeElement.querySelector('a[name="wm-switch-' + value + '"]').click();
                expect(wmComponent.datavalue).toBe(expectedDatavalue);
            }, 200);
        });
    }
})


