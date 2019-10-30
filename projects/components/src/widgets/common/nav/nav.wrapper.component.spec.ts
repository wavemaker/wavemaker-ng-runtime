import { ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { App, UserDefinedExecutionContext} from '@wm/core';
import { NavComponent} from './nav.component';
import { NavigationControlDirective } from './navigation-control.directive';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef} from '../../../test/common-widget.specs';
import { ComponentsTestModule } from '../../../test/components.test.module';
import { compileTestComponent } from '../../../test/util/component-test-util';
import { SecurityService } from '@wm/security';

const mockApp = {};
class MockSecurityService {}
const markup = ` <ul wmNav data-element-type="wmNav" data-role="page-header"  type="pills" autoclose="outsideClick" name="testNav"
                   itemlabel="label" itemlink="link" itemicon="icon" itemaction="task" isactive="active" select.event="onSelect($event, widget, $item)"></ul>`;


@Component({
    template: markup
})

class NavWrapperComponent {
    @ViewChild(NavComponent) wmComponent: NavComponent;
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
        console.log('select event triggered');
    };
    setContent = function () {
        console.log('set content triggered');
    };
}

const testModuleDef: ITestModuleDef = {
    declarations: [NavWrapperComponent, NavComponent, NavigationControlDirective],
    imports: [ComponentsTestModule],
    providers: [
        {provide: App, useValue: mockApp},
        {provide: Router, useValue: mockApp},
        {provide: UserDefinedExecutionContext, useValue: mockApp},
        {provide: SecurityService, useClass: MockSecurityService}]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-nav',
    widgetSelector: '[wmNav]',
    testModuleDef: testModuleDef,
    testComponent: NavWrapperComponent
};

// const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();
// TestBase.verifyCommonProperties();
// TestBase.verifyStyles();

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
        spyOn(wrapperComponent, 'onSelect');
        // navwidget dataset propertychangehandler is having debouncetime so using setimeout
        setTimeout(() => {
            expect(wrapperComponent.onSelect).toHaveBeenCalledTimes(1);
            expect(wmComponent.selecteditem).toEqual(wrapperComponent.testdata[0]);
            done();
        }, 100);
    });

});
