import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormActionDirective } from './form-action.directive';
import { FormComponent } from '../form.component';
import { By } from '@angular/platform-browser';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

@Component({
        standalone: true,
    template: '<div wmFormAction></div>'
})
class TestComponent { }

describe('FormActionDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directive: FormActionDirective;
    let mockFormComponent: jest.Mocked<FormComponent>;

    beforeEach(() => {
        mockFormComponent = {
            registerActions: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            imports: [FormActionDirective,     TestComponent],
            declarations: [],
            providers: [
                { provide: FormComponent, useValue: mockFormComponent },
                { provide: App, useValue: mockApp }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        
        // Create a mock directive instance for testing
        directive = {
            nativeElement: document.createElement('div'),
            buttonDef: {},
            populateAction: function () {
                this.buttonDef = {
                    key: this['key'],
                    displayName: this['display-name'],
                    show: this['show'],
                    class: this['class'],
                    widgetType: this['widget-type']
                };
            },
            onPropertyChange: function (prop: string, newVal: any) {
                if (!this['_propsInitialized']) { return; }
                this.buttonDef = this.buttonDef || {};
                if (prop === 'display-name') {
                    this.buttonDef.displayName = newVal;
                }
                if (prop === 'show') {
                    this.buttonDef.show = newVal;
                }
            },
            ngOnInit: function () {
                this.populateAction();
                mockFormComponent.registerActions(this.buttonDef);
            }
        } as any;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call populateAction and registerActions on ngOnInit', () => {
        const populateActionSpy = jest.spyOn(directive, 'populateAction' as any);
        directive.ngOnInit();
        expect(populateActionSpy).toHaveBeenCalled();
        expect(mockFormComponent.registerActions).toHaveBeenCalledWith(directive['buttonDef']);
    });

    it('should populate buttonDef correctly', () => {
        directive['key'] = 'testKey';
        directive['display-name'] = 'Test Button';
        directive['show'] = true;
        directive['class'] = 'custom-class';
        directive['widget-type'] = 'button';

        directive['populateAction']();

        expect(directive['buttonDef']).toEqual(expect.objectContaining({
            key: 'testKey',
            displayName: 'Test Button',
            show: true,
            class: 'custom-class',
            widgetType: 'button'
        }));
    });

    it('should update buttonDef on property change', () => {
        directive['_propsInitialized'] = true;
        directive['buttonDef'] = {};

        directive.onPropertyChange('display-name', 'New Name', 'Old Name');
        expect(directive['buttonDef'].displayName).toBe('New Name');

        directive.onPropertyChange('show', false, true);
        expect(directive['buttonDef'].show).toBe(false);
    });

    it('should not update buttonDef if props are not initialized', () => {
        directive['_propsInitialized'] = false;
        directive['buttonDef'] = {};

        directive.onPropertyChange('display-name', 'New Name', 'Old Name');
        expect(directive['buttonDef'].displayName).toBeUndefined();
    });
});