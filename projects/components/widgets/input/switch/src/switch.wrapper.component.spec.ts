import { Component, ViewChild } from '@angular/core';
import { SwitchComponent } from './switch.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { compileTestComponent, mockApp } from '../../../../base/src/test/util/component-test-util';
import { AbstractI18nService, App, AppDefaults } from '@wm/core';
import { MockAbstractI18nService } from '../../../../base/src/test/util/date-test-util';
import { ToDatePipe } from '@wm/components/base';

const markup = `<div wmSwitch #wm_switch1="wmSwitch" [attr.aria-label]="wm_switch1.arialabel || 'Switch button'" datavalue="yes" show="true" width="800" height="200" hint="Switch button" tabindex="0" disabled="false" name="switch1"></div>`;

@Component({
    template: markup,
    standalone: true
})
class SwitchWrapperComponent {
    @ViewChild(SwitchComponent, /* TODO: add static flag */ { static: true }) wmComponent: SwitchComponent;
}
const testModuleDef: ITestModuleDef = {
    imports: [FormsModule, SwitchComponent,],
    declarations: [],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: ToDatePipe, useClass: ToDatePipe },
        { provide: DatePipe, useClass: DatePipe },
        { provide: AppDefaults, useClass: AppDefaults },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
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
// TestBase.verifyPropsInitialization();  /* to be fixed for disabled property issue */
// TestBase.verifyCommonProperties();  /* to be fixed for hint property issue */
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('wm-switch: Component specific tests: ', () => {
    let wrapperComponent: SwitchWrapperComponent;
    let wmComponent: SwitchComponent;
    let fixture: ComponentFixture<SwitchWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, SwitchWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        if (wmComponent) {
            fixture.detectChanges();
        }
    }));

    it('should create switch compoent', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should have datavalue as yes by default', () => {
        expect(wmComponent.datavalue).toBe('yes');
    });

    it('should have datavalue as no', done => {
        setDatavalue(fixture, done, 'no', 'no');
    });

    it('should have datavalue as yes when switch is in disabled state', done => {
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

    it('should select option at index', () => {
        wmComponent.datasetItems = [
            { key: 'option1', value: 'value1', label: 'label1' },
            { key: 'option2', value: 'value2', label: 'label2' }
        ];
        wmComponent.selectOptAtIndex(1);
        expect((wmComponent as any)._modelByValue).toBe('value2');
    });

    it('should not select option when datasetItems is empty', () => {
        wmComponent.datasetItems = [];
        (wmComponent as any)._modelByValue = 'initial';
        wmComponent.selectOptAtIndex(0);
        expect((wmComponent as any)._modelByValue).toBe('initial');
    });

    it('should select option and update model', () => {
        const mockEvent = { preventDefault: jest.fn() };
        wmComponent.datasetItems = [
            { key: 'option1', value: 'value1', label: 'label1' },
            { key: 'option2', value: 'value2', label: 'label2' }
        ];
        wmComponent.disabled = false;
        wmComponent.invokeOnTouched = jest.fn();
        wmComponent.invokeOnChange = jest.fn();
        (wmComponent as any).updateHighlighter = jest.fn();

        wmComponent.selectOpt(mockEvent, 1, { key: 'option2' });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(wmComponent.modelByKey).toBe('option2');
        expect(wmComponent.invokeOnTouched).toHaveBeenCalled();
        expect(wmComponent.selectedItem).toEqual({ key: 'option2', value: 'value2', label: 'label2', selected: true });
        expect((wmComponent as any).updateHighlighter).toHaveBeenCalled();
        expect(wmComponent.invokeOnChange).toHaveBeenCalled();
    });

    it('should not select option when disabled', () => {
        const mockEvent = { preventDefault: jest.fn() };
        wmComponent.disabled = true;
        wmComponent.modelByKey = 'initial';

        wmComponent.selectOpt(mockEvent, 0, { key: 'option1' });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        // If modelByKey doesn't change when disabled, we should expect it to remain undefined
        expect(wmComponent.modelByKey).toBeUndefined();
    });

    it('should not change selection when selecting the already selected option', () => {
        const mockEvent = { preventDefault: jest.fn() };
        wmComponent.datasetItems = [
            { key: 'option1', value: 'value1', label: 'label1' },
            { key: 'option2', value: 'value2', label: 'label2' }
        ];
        wmComponent.disabled = false;
        const initialSelection = { key: 'option1', value: 'value1', label: 'label1', selected: true };
        wmComponent.selectedItem = initialSelection;

        wmComponent.selectOpt(mockEvent, 0, { key: 'option1' });

        expect(wmComponent.selectedItem).toEqual(initialSelection);
    });

    it('should change selection when selecting a different option', () => {
        const mockEvent = { preventDefault: jest.fn() };
        wmComponent.datasetItems = [
            { key: 'option1', value: 'value1', label: 'label1' },
            { key: 'option2', value: 'value2', label: 'label2' }
        ];
        wmComponent.disabled = false;
        wmComponent.selectedItem = { key: 'option1', value: 'value1', label: 'label1', selected: true };

        wmComponent.selectOpt(mockEvent, 1, { key: 'option2' });

        expect(wmComponent.selectedItem).toEqual({ key: 'option2', value: 'value2', label: 'label2', selected: true });
    });
    describe('setSelectedValue', () => {
        it('should set selectedItem when datavalue is defined and an item is selected', () => {
            wmComponent.datavalue = 'someValue';
            wmComponent.datasetItems = [
                { key: 'option1', label: 'label1', value: 'value1', selected: false },
                { key: 'option2', label: 'label2', value: 'value2', selected: true },
                { key: 'option3', label: 'label3', value: 'value3', selected: false }
            ];

            wmComponent['setSelectedValue']();

            expect(wmComponent.selectedItem).toEqual({ key: 'option2', label: 'label2', value: 'value2', selected: true });
        });

        it('should set selectedItem when toBeProcessedDatavalue is defined and an item is selected', () => {
            wmComponent.toBeProcessedDatavalue = 'someValue';
            wmComponent.datasetItems = [
                { key: 'option1', label: 'label1', value: 'value1', selected: false },
                { key: 'option2', label: 'label2', value: 'value2', selected: true },
                { key: 'option3', label: 'label3', value: 'value3', selected: false }
            ];

            wmComponent['setSelectedValue']();

            expect(wmComponent.selectedItem).toEqual({ key: 'option2', label: 'label2', value: 'value2', selected: true });
        });

        it('should call selectOptAtIndex with 0 when datavalue and toBeProcessedDatavalue are undefined', () => {
            wmComponent.datavalue = undefined;
            wmComponent.toBeProcessedDatavalue = undefined;
            const selectOptAtIndexSpy = jest.spyOn(wmComponent as any, 'selectOptAtIndex');

            wmComponent['setSelectedValue']();

            expect(selectOptAtIndexSpy).toHaveBeenCalledWith(0);
        });

        it('should not set selectedItem when datavalue is defined but no item is selected', () => {
            wmComponent.datavalue = 'someValue';
            wmComponent.datasetItems = [
                { key: 'option1', label: 'label1', value: 'value1', selected: false },
                { key: 'option2', label: 'label2', value: 'value2', selected: false },
                { key: 'option3', label: 'label3', value: 'value3', selected: false }
            ];

            wmComponent['setSelectedValue']();

            expect(wmComponent.selectedItem).toBeUndefined();
        });

        it('should call selectOptAtIndex with 0 when datasetItems is empty', () => {
            wmComponent.datavalue = undefined;
            wmComponent.toBeProcessedDatavalue = undefined;
            wmComponent.datasetItems = [];
            const selectOptAtIndexSpy = jest.spyOn(wmComponent as any, 'selectOptAtIndex');

            wmComponent['setSelectedValue']();

            expect(selectOptAtIndexSpy).toHaveBeenCalledWith(0);
        });
    });
});


