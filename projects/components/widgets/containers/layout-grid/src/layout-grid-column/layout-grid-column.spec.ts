import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { LayoutGridColumnDirective } from './layout-grid-column.directive';
import { Viewport } from '@wm/core';
import * as coreModule from '@wm/core';
import * as baseModule from '@wm/components/base';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

// Mock the external dependencies
jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    isMobileApp: jest.fn(),
    setCSS: jest.fn(),
    switchClass: jest.fn(),
    Viewport: jest.fn()
}));

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    styler: jest.fn(),
    APPLY_STYLES_TYPE: { CONTAINER: 'container' }
}));

// Create a test component
@Component({
    template: '<div wmLayoutGridColumn height="100px"></div>'
})
class TestComponent {
    @ViewChild(LayoutGridColumnDirective, { static: true }) gridColumnDirective: LayoutGridColumnDirective;
}

describe('LayoutGridColumnDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directive: LayoutGridColumnDirective;
    let viewportMock: jest.Mocked<Viewport>;

    beforeEach(() => {
        viewportMock = {
            isMobileType: false
        } as any;

        TestBed.configureTestingModule({
            declarations: [TestComponent, LayoutGridColumnDirective],
            providers: [
                { provide: Viewport, useValue: viewportMock },
                { provide: 'EXPLICIT_CONTEXT', useValue: null },
                { provide: coreModule.App, useValue:  mockApp }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // Trigger initial data binding
        directive = component.gridColumnDirective;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set overflow to auto when height is provided', () => {
        const setCSSSpy = jest.spyOn(coreModule, 'setCSS');
        expect(setCSSSpy).toHaveBeenCalledWith(expect.any(Element), 'overflow', 'auto');
    });

    it('should call styler with correct parameters', () => {
        const stylerSpy = jest.spyOn(baseModule, 'styler');
        expect(stylerSpy).toHaveBeenCalledWith(expect.any(Element), directive, 'container');
    });

    describe('onPropertyChange', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should handle xscolumnwidth change for mobile app', () => {
            const isMobileAppSpy = jest.spyOn(coreModule, 'isMobileApp').mockReturnValue(true);
            viewportMock.isMobileType = true;
            directive.onPropertyChange('xscolumnwidth', '6', '4');

            expect(isMobileAppSpy).toHaveBeenCalled();
            expect(coreModule.switchClass).toHaveBeenCalledWith(expect.any(Element), 'col-xs-6', 'col-xs-4');
        });

        it('should handle columnwidth change for non-mobile app', () => {
            jest.spyOn(coreModule, 'isMobileApp').mockReturnValue(false);
            directive.onPropertyChange('columnwidth', '6', '4');

            expect(coreModule.switchClass).toHaveBeenCalledWith(expect.any(Element), 'col-sm-6', 'col-sm-4');
        });

        it('should handle columnwidth change for mobile app without xscolumnwidth', () => {
            jest.spyOn(coreModule, 'isMobileApp').mockReturnValue(true);
            viewportMock.isMobileType = true;
            jest.spyOn(directive, 'getAttr').mockReturnValue(undefined);
            directive.onPropertyChange('columnwidth', '6', '4');

            expect(coreModule.switchClass).toHaveBeenCalledWith(expect.any(Element), 'col-xs-6', 'col-xs-4');
        });

        it('should handle columnwidth change for mobile app with xscolumnwidth', () => {
            jest.spyOn(coreModule, 'isMobileApp').mockReturnValue(true);
            viewportMock.isMobileType = true;
            jest.spyOn(directive, 'getAttr').mockReturnValue('5');
            directive.onPropertyChange('columnwidth', '6', '4');

            expect(coreModule.switchClass).not.toHaveBeenCalled();
        });
    });
});