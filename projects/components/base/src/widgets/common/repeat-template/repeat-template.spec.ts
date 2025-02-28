import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Injector } from '@angular/core';
import { RepeatTemplateDirective } from './repeat-template.directive';
import { mockApp } from '../../../test/util/component-test-util';
import { App } from '@wm/core';

@Component({
    template: '<div wmRepeatTemplate></div>'
})
class TestComponent { }

describe('RepeatTemplateDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let directive: RepeatTemplateDirective;
    let mockInjector: Injector;

    beforeEach(() => {
        mockInjector = {
            get: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            imports: [RepeatTemplateDirective],
            declarations: [TestComponent],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: Injector, useValue: mockInjector },
                { provide: 'EXPLICIT_CONTEXT', useValue: null }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        directive = fixture.debugElement.children[0].injector.get(RepeatTemplateDirective);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

});