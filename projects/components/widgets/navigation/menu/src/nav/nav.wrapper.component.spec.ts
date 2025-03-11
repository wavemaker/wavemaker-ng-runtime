import { ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { App, UserDefinedExecutionContext } from '@wm/core';
import { NavComponent } from './nav.component';
import { NavigationControlDirective } from './navigation-control.directive';
import { ITestComponentDef, ITestModuleDef, ComponentTestBase } from '../../../../../base/src/test/common-widget.specs';
import { compileTestComponent, mockApp } from '../../../../../base/src/test/util/component-test-util';
import { SecurityService } from '@wm/security';
import { NavNode } from '@wm/components/base';
import { omit } from 'lodash-es';

class MockSecurityService { }
const markup = ` <ul wmNav data-element-type="wmNav" data-role="page-header"  type="pills" autoclose="outsideClick" name="testNav"
                   itemlabel="label" itemlink="link" itemicon="icon" itemaction="task" isactive="active" select.event="onSelect($event, widget, $item)"></ul>`;


@Component({
    template: markup
})

class NavWrapperComponent {
    @ViewChild(NavComponent, /* TODO: add static flag */ { static: true }) wmComponent: NavComponent;
    public testdata = [
        {
            label: 'Home',
            icon: 'wi wi-home',
            link: '',
            task: 'setContent()',
            role: 'user',
            badge: 1,
            active: true
        },
        {
            label: 'Departments',
            icon: 'wi wi-industry',
            link: '#/FicoScenario',
            task: '',
            role: 'admin',
            badge: 3,
            active: false
        },
        {
            label: 'Business',
            icon: 'wi wi-business',
            link: '#/bus',
            task: '',
            role: 'admin',
            active: false
        }
    ];
    onSelect = function ($event, widget, $item) {
        // console.log('select event triggered');
    };
    setContent = function () {
        // console.log('set content triggered');
    };
}

const testModuleDef: ITestModuleDef = {
    declarations: [NavWrapperComponent,],
    imports: [NavComponent, NavigationControlDirective],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: Router, useValue: mockApp },
        { provide: UserDefinedExecutionContext, useValue: mockApp },
        { provide: SecurityService, useClass: MockSecurityService }]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-nav',
    widgetSelector: '[wmNav]',
    testModuleDef: testModuleDef,
    testComponent: NavWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
// TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe('Nav Component', () => {
    let fixture: ComponentFixture<NavWrapperComponent>;
    let wrapperComponent: NavWrapperComponent;
    let wmComponent: NavComponent;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, NavWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        wmComponent.dataset = wrapperComponent.testdata;
        wmComponent.onPropertyChange('dataset', wmComponent.dataset, undefined);
        fixture.detectChanges();
    });
    it('should create the Nav compoent', () => {
        expect(wrapperComponent).toBeTruthy();
    });
    it('should trigger select event callback and should contain selecteditem as item having isactive true', (done) => {
        jest.spyOn(wrapperComponent, 'onSelect');
        // navwidget dataset propertychangehandler is having debouncetime so using setimeout
        setTimeout(() => {
            expect(wrapperComponent.onSelect).toHaveBeenCalledTimes(1);
            expect(wmComponent.selecteditem).toEqual(wrapperComponent.testdata[0]);
            done();
        }, 100);
    });

    // Updated test cases for onNavSelect function
    describe('onNavSelect function', () => {
        it('should update selecteditem and invoke select event callback', () => {
            const mockEvent = new Event('click');
            const mockItem = { value: wrapperComponent.testdata[1] };
            jest.spyOn(mockEvent, 'preventDefault');
            jest.spyOn(wmComponent, 'invokeEventCallback');
            wmComponent.onNavSelect(mockEvent, mockItem);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(wmComponent.selecteditem).toEqual(mockItem.value);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('select', {
                $event: mockEvent,
                $item: mockItem.value
            });
        });

        it('should remove _selected property from previously selected item', () => {
            const previouslySelectedItem: any = { ...wrapperComponent.testdata[0], _selected: true };
            wmComponent.nodes = [previouslySelectedItem, ...wrapperComponent.testdata.slice(1)];
            const mockEvent = new Event('click');
            const mockItem = { value: wrapperComponent.testdata[1] };
            wmComponent.onNavSelect(mockEvent, mockItem);
            expect(previouslySelectedItem._selected).toBeUndefined();
        });
    });

    // New test cases for onMenuItemSelect function
    describe('onMenuItemSelect function', () => {
        it('should update selecteditem and invoke select event callback', () => {
            const mockEvent = new Event('click');
            const mockWidget = {};
            const mockMenuItem: NavNode = {
                label: 'Test Item',
                icon: 'test-icon',
                link: 'test-link',
                children: [],
                value: 'test-value'
            };
            jest.spyOn(wmComponent, 'invokeEventCallback');
            wmComponent.onMenuItemSelect(mockEvent, mockWidget, mockMenuItem);
            expect(wmComponent.selecteditem).toEqual(omit(mockMenuItem, ['children', 'value']));
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('select', {
                $event: mockEvent,
                $item: wmComponent.selecteditem
            });
        });

        it('should remove children and value properties from selecteditem', () => {
            const mockEvent = new Event('click');
            const mockWidget = {};
            const mockMenuItem: NavNode = {
                label: 'Test Item',
                icon: 'test-icon',
                link: 'test-link',
                children: [{ label: 'Child Item' }],
                value: 'test-value'
            };

            wmComponent.onMenuItemSelect(mockEvent, mockWidget, mockMenuItem);

            expect(wmComponent.selecteditem).not.toHaveProperty('children');
            expect(wmComponent.selecteditem).not.toHaveProperty('value');
            expect(wmComponent.selecteditem).toHaveProperty('label', 'Test Item');
            expect(wmComponent.selecteditem).toHaveProperty('icon', 'test-icon');
            expect(wmComponent.selecteditem).toHaveProperty('link', 'test-link');
        });

        it('should work correctly with menu items that don\'t have children or value properties', () => {
            const mockEvent = new Event('click');
            const mockWidget = {};
            const mockMenuItem: NavNode = {
                label: 'Simple Item',
                link: 'simple-link'
            };

            wmComponent.onMenuItemSelect(mockEvent, mockWidget, mockMenuItem);

            expect(wmComponent.selecteditem).toEqual(mockMenuItem);
        });
    });
});
