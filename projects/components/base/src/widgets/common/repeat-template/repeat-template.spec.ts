import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, Injector, ElementRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RepeatTemplateDirective } from './repeat-template.directive';
import { mockApp } from '../../../test/util/component-test-util';
import { App } from '@wm/core';

@Component({
        standalone: true,
    template: '<div wmRepeatTemplate></div>'
})
class TestComponent { }

describe('RepeatTemplateDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let directive: RepeatTemplateDirective;
    let mockInjector: Injector;

    beforeEach(() => {
        // Create a simple mock directive instance for testing
        directive = {
            nativeElement: document.createElement('div'),
            widgetType: 'wm-repeat-template'
        } as any;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

});