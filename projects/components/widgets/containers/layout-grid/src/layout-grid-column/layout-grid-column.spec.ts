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
    template: '<div wmLayoutGridColumn height="100px"></div>',
    standalone: false
})
class TestComponent {
    @ViewChild(LayoutGridColumnDirective, { static: false }) gridColumnDirective: LayoutGridColumnDirective;
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
            declarations: [TestComponent],
            imports: [LayoutGridColumnDirective],
            providers: [
                { provide: Viewport, useValue: viewportMock },
                { provide: 'EXPLICIT_CONTEXT', useValue: null },
                { provide: coreModule.App, useValue: mockApp }
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
});