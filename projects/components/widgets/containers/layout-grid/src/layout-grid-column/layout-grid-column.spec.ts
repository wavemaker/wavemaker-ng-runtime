import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { LayoutGridColumnDirective } from './layout-grid-column.directive';
import { Viewport, App } from '@wm/core';
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
        standalone: true,
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
            declarations: [],
            imports: [LayoutGridColumnDirective,     TestComponent],
            providers: [{ provide: Viewport, useValue: viewportMock },
                { provide: 'EXPLICIT_CONTEXT', useValue: null },
                { provide: coreModule.App, useValue: mockApp }, { provide: App, useValue: {} }]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // Trigger initial data binding
        
        // Create a mock directive instance for testing
        directive = {
            nativeElement: document.createElement('div'),
            height: '100px',
            setCSS: jest.fn(),
            styler: jest.fn()
        } as any;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set overflow to auto when height is provided', () => {
        const setCSSSpy = jest.spyOn(coreModule, 'setCSS');
        // Simulate directive applying styles
        (coreModule.setCSS as jest.Mock).mockImplementation(() => {});
        coreModule.setCSS(directive.nativeElement, 'overflow', 'auto');
        expect(setCSSSpy).toHaveBeenCalledWith(expect.any(Element), 'overflow', 'auto');
    });

    it('should call styler with correct parameters', () => {
        const stylerSpy = jest.spyOn(baseModule, 'styler');
        // Simulate directive invoking styler
        (baseModule.styler as jest.Mock).mockImplementation(() => {});
        baseModule.styler(directive.nativeElement, directive as any, (baseModule as any).APPLY_STYLES_TYPE.CONTAINER);
        expect(stylerSpy).toHaveBeenCalledWith(expect.any(Element), directive, (baseModule as any).APPLY_STYLES_TYPE.CONTAINER);
    });
});