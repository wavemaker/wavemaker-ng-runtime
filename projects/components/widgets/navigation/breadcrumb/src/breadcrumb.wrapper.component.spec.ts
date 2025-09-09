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

const markup = `<div wmBreadcrumb name="breadcrumb1" aria-label="breadcrumb"></div>`;

@Component({
    template: markup,
    standalone: true
})
class BreadcrumbWrapperComponent {
    @ViewChild(BreadcrumbComponent, { static: true }) wmComponent: BreadcrumbComponent;
}

const testModuleDef = {
    imports: [FormsModule, BreadcrumbComponent,],
    declarations: [],
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
        jest.spyOn(breadcrumbComponent, 'invokeEventCallback').mockReturnValue(true);
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

    describe('getPath', () => {
        it('should return the correct path for a given key', () => {
            const nodes = [
                { id: 'home', label: 'Home', children: [] },
                {
                    id: 'about', label: 'About', children: [
                        { id: 'team', label: 'Team', children: [] },
                        { id: 'contact', label: 'Contact', children: [] }
                    ]
                }
            ];

            const result = breadcrumbComponent['getPath']({ key: 'team', isPathFound: false }, nodes);
            expect(result).toEqual([
                { id: 'about', label: 'About', children: expect.any(Array) },
                { id: 'team', label: 'Team', children: [] }
            ]);
        });

        it('should return an empty array if the key is not found', () => {
            const nodes = [
                { id: 'home', label: 'Home', children: [] },
                { id: 'about', label: 'About', children: [] }
            ];

            const result = breadcrumbComponent['getPath']({ key: 'nonexistent', isPathFound: false }, nodes);
            expect(result).toEqual([]);
        });
    });

    describe('getCurrentRoute', () => {
        it('should return the current route', () => {
            const result = breadcrumbComponent['getCurrentRoute']();
            expect(result).toBe('test-route');
        });
    });
    describe('resetNodes', () => {
        it('should call super.resetNodes and update nodes if itemid is set', () => {
            const superResetNodesSpy = jest.spyOn(Object.getPrototypeOf(BreadcrumbComponent.prototype), 'resetNodes');
            const getPathSpy = jest.spyOn<any, any>(breadcrumbComponent, 'getPath').mockReturnValue([]);
            breadcrumbComponent.itemid = 'someId';
            breadcrumbComponent.nodes = [{ id: 'test-route', label: 'Test', children: [] }];
            breadcrumbComponent['resetNodes']();
            expect(superResetNodesSpy).toHaveBeenCalled();
            expect(getPathSpy).toHaveBeenCalled();
            expect(breadcrumbComponent.nodes).toEqual([]);
        });

        it('should not update nodes if itemid is not set', () => {
            const superResetNodesSpy = jest.spyOn(Object.getPrototypeOf(BreadcrumbComponent.prototype), 'resetNodes');
            const getPathSpy = jest.spyOn<any, any>(breadcrumbComponent, 'getPath');

            breadcrumbComponent.itemid = '';
            breadcrumbComponent.nodes = [{
                value: {},
                label: ''
            }];
            breadcrumbComponent['resetNodes']();
            expect(superResetNodesSpy).toHaveBeenCalled();
            expect(getPathSpy).not.toHaveBeenCalled();
            expect(breadcrumbComponent.nodes).toEqual([{ children: [], value: {} }]);
        });
    });

    describe('onItemClick', () => {
        it('should call preventDefault on the event', () => {
            const event = new Event('click');
            const preventDefault = jest.spyOn(event, 'preventDefault');
            const item = { value: { link: '#/test', target: '_self' } };

            breadcrumbComponent.onItemClick(event, item);

            expect(preventDefault).toHaveBeenCalled();
        });

        it('should not navigate when itemLink is falsy', () => {
            const event = new Event('click');
            const item = { value: { link: '', target: '_self' } };

            breadcrumbComponent.onItemClick(event, item);

            expect(router.navigate).not.toHaveBeenCalled();
        });
        it('should not navigate when invokeEventCallback returns false', () => {
            const event = new Event('click');
            const item = { value: { link: '#/test', target: '_self' } };

            (breadcrumbComponent.invokeEventCallback as jest.Mock).mockReturnValueOnce(false);

            breadcrumbComponent.onItemClick(event, item);

            expect(router.navigate).not.toHaveBeenCalled();
        });

        it('should call invokeEventCallback with correct parameters', () => {
            const event = new Event('click');
            const item = { value: { link: '#/test', target: '_self' } };

            breadcrumbComponent.onItemClick(event, item);

            expect(breadcrumbComponent.invokeEventCallback).toHaveBeenCalledWith('beforenavigate', { $item: item.value, $event: event });
        });
        it('should not navigate if beforenavigate event returns false', () => {
            const event = new Event('click');
            const item = { value: { link: '#/test', target: '_self' } };

            jest.spyOn(breadcrumbComponent, 'invokeEventCallback').mockReturnValue(false);

            breadcrumbComponent.onItemClick(event, item);

            expect(router.navigate).not.toHaveBeenCalled();
        });

        it('should not navigate when itemLink is falsy or canNavigate is false', () => {
            const event = new Event('click');
            const preventDefault = jest.spyOn(event, 'preventDefault');

            // Test case 1: itemLink is falsy
            let item = { value: { link: '', target: '_self' } };
            breadcrumbComponent.onItemClick(event, item);
            expect(preventDefault).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();

            // Reset mocks
            preventDefault.mockClear();
            (router.navigate as jest.Mock).mockClear();

            // Test case 2: canNavigate is false
            item = { value: { link: '#/test', target: '_self' } };
            (breadcrumbComponent.invokeEventCallback as jest.Mock).mockReturnValueOnce(false);
            breadcrumbComponent.onItemClick(event, item);
            expect(preventDefault).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
        });
    });
});