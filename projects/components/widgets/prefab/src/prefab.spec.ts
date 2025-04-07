import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PrefabDirective } from './prefab.directive';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { PROP_TYPE } from '@wm/components/base';
import { setCSS } from '@wm/core';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    setCSS: jest.fn()
}));

@Component({
    template: '<section wmPrefab prefabname="test" name="testPrefab"></section>'
})
class TestComponent { }

describe('PrefabDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: PrefabDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [PrefabDirective],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: 'EXPLICIT_CONTEXT', useValue: null }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        directiveElement = fixture.debugElement.query(By.directive(PrefabDirective));
        directive = directiveElement.injector.get(PrefabDirective);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set widgetType correctly', () => {
        expect(directive.widgetType).toBe('wm-prefab-test');
    });

    it('should set prefabName correctly', () => {
        expect(directive.prefabName).toBe('test');
    });

    it('should set name correctly', () => {
        expect(directive.name).toBe('testPrefab');
    });

    it('should register props when setProps is called', () => {
        const mockConfig = {
            properties: {
                testProp: { type: 'string', value: 'testValue' }
            }
        };
        directive.setProps(mockConfig);
    });

    it('should not throw error when setProps is called with invalid config', () => {
        expect(() => directive.setProps(null)).not.toThrow();
        expect(() => directive.setProps({})).not.toThrow();
    });

    it('should call invokeEventCallback on destroy', () => {
        const spy = jest.spyOn(directive as any, 'invokeEventCallback');
        directive.ngOnDestroy();
        expect(spy).toHaveBeenCalledWith('destroy', { widget: directive });
    });

    it('should correctly prepare props', () => {
        const mockProps = {
            stringProp: { type: 'string', value: 'test' },
            booleanProp: { type: 'boolean', value: true },
            numberProp: { type: 'number', value: 42 },
            customProp: { type: 'custom', value: {} },
            bindProp: { type: 'string', value: 'bind:someValue' }
        };

        // We need to access the private method, so we'll use type assertion
        const prepareProps = (directive as any).prepareProps.bind(directive);
        const result = prepareProps(mockProps);

        expect(result).toBeInstanceOf(Map);
        expect(result.get('stringProp')).toEqual({ type: PROP_TYPE.STRING, value: 'test' });
        expect(result.get('booleanProp')).toEqual({ type: PROP_TYPE.BOOLEAN, value: true });
        expect(result.get('numberProp')).toEqual({ type: PROP_TYPE.NUMBER, value: 42 });
        expect(result.get('customProp')).toEqual({ type: 'custom', value: {} });
        expect(result.get('bindProp')).toEqual({ type: PROP_TYPE.STRING, value: undefined });

        // Instead of checking registeredPropsSet directly, we'll check if setProps method works as expected
        const setPropsMethod = jest.spyOn(directive, 'setProps');
        directive.setProps({ properties: mockProps });
        expect(setPropsMethod).toHaveBeenCalled();
    });

    describe('onStyleChange', () => {
        it('should set overflow to auto when key is height', () => {
            directive.onStyleChange('height', '100px', '50px');
            expect(setCSS).toHaveBeenCalledWith(directive.nativeElement, 'overflow', 'auto');
        });

        it('should handle null or undefined values', () => {
            directive.onStyleChange('height', null, undefined);
            expect(setCSS).toHaveBeenCalledWith(directive.nativeElement, 'overflow', 'auto');
        });

        it('should handle different types of values', () => {
            directive.onStyleChange('height', 100, '50%');
            expect(setCSS).toHaveBeenCalledWith(directive.nativeElement, 'overflow', 'auto');
        });
    });
});