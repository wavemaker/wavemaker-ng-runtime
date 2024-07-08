import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar.component'; // Make sure to replace these with actual paths
import { App } from '@wm/core';
import { ITestModuleDef, ITestComponentDef, ComponentTestBase } from 'projects/components/base/src/test/common-widget.specs';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

const markup = `<div wmNavbar aria-label="breadcrumb" name="navbar1"></div>`;

@Component({
    template: markup
})
class NavbarWrapperComponent {
    @ViewChild(NavbarComponent, { static: true }) wmComponent: NavbarComponent;
}

const testModuleDef: ITestModuleDef = {
    imports: [FormsModule],
    declarations: [NavbarWrapperComponent, NavbarComponent],
    providers: [
        { provide: App, useValue: mockApp },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-navbar',
    widgetSelector: '[wmNavbar]',
    testModuleDef: testModuleDef,
    testComponent: NavbarWrapperComponent,
    inputElementSelector: 'input'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('Navbar component', () => {
    let wrapperComponent: NavbarWrapperComponent;
    let navbarComponent: NavbarComponent;
    let fixture: ComponentFixture<NavbarWrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = TestBed.configureTestingModule(testModuleDef).createComponent(NavbarWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        navbarComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create navbar component', () => {
        expect(wrapperComponent).toBeTruthy();
    });
});
