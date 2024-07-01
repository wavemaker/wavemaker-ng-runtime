import { Component, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from './breadcrumb.component';
import { AbstractHttpService, App } from '@wm/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { By } from '@angular/platform-browser';
import { SecurityService } from '@wm/security';
import { ComponentTestBase, ITestComponentDef } from 'projects/components/base/src/test/common-widget.specs';

const markup = `<div wmBreadcrumb hint="breadcrumb" tabindex="1" name="breadcrumb1" aria-label="breadcrumb"></div>`;

@Component({
    template: markup
})
class BreadcrumbWrapperComponent {
    @ViewChild(BreadcrumbComponent, { static: true }) wmComponent: BreadcrumbComponent;
}

const testModuleDef = {
    imports: [FormsModule],
    declarations: [BreadcrumbWrapperComponent, BreadcrumbComponent],
    schemas: [NO_ERRORS_SCHEMA],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: Location, useValue: { path: jest.fn().mockReturnValue('/test-route') } },
        { provide: SecurityService, useClass: SecurityService },
        { provide: AbstractHttpService, useClass: AbstractHttpService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } }
    ]
};
const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-breadcrumb',
    widgetSelector: '[wmBreadcrumb]',
    testModuleDef: testModuleDef,
    testComponent: BreadcrumbWrapperComponent,
    inputElementSelector: 'div'
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('BreadcrumbComponent', () => {
    let wrapperComponent: BreadcrumbWrapperComponent;
    let breadcrumbComponent: BreadcrumbComponent;
    let fixture: ComponentFixture<BreadcrumbWrapperComponent>;
    let router: Router;
    let location: Location;

    beforeEach(waitForAsync(() => {
        fixture = TestBed.configureTestingModule(testModuleDef).createComponent(BreadcrumbWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        breadcrumbComponent = wrapperComponent.wmComponent;
        router = TestBed.inject(Router);
        location = TestBed.inject(Location);
        fixture.detectChanges();
    }));

    it('should create breadcrumb component', () => {
        expect(wrapperComponent).toBeTruthy();
        expect(breadcrumbComponent).toBeTruthy();
    });

    it('should initialize properties correctly', () => {
        expect(breadcrumbComponent.nodes).toBeDefined();
        expect(breadcrumbComponent.widgetProps.has('itemid')).toBe(true);
        expect(breadcrumbComponent.widgetProps.has('binditemid')).toBe(false);
    });

    it('should render breadcrumb items', () => {
        breadcrumbComponent.nodes = [
            { label: 'Home', link: '#/home', class: 'breadcrumb-item', icon: 'home-icon', children: [] },
            { label: 'About', link: '#/about', class: 'breadcrumb-item', icon: 'about-icon', children: [] }
        ];
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('li'));
        expect(items.length).toBe(2);

        const firstItem = items[0].nativeElement;
        expect(firstItem.textContent).toContain('Home');
    });
});
