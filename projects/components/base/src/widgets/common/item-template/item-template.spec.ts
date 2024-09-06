import { TestBed } from '@angular/core/testing';
import { ElementRef, Injector, ViewContainerRef } from '@angular/core';
import { App } from '@wm/core';
import { ItemTemplateDirective } from './item-template.directive';
import { mockApp } from '../../../test/util/component-test-util';

describe('ItemTemplateDirective', () => {
    let directive: ItemTemplateDirective;
    let mockInjector: Injector;
    let mockElementRef: ElementRef;
    let mockViewContainerRef: ViewContainerRef;

    beforeEach(() => {
        mockInjector = {
            get: jest.fn((token) => {
                if (token === ElementRef) return mockElementRef;
                if (token === App) return mockApp;
                if (token === ViewContainerRef) return mockViewContainerRef;
                return null;
            }),
            _lView: [null, null, null, null, null, null, null, null, { index: 0 }],
            _tNode: {
                attrs: ['attr1', 'value1', 'attr2', 'value2']
            }
        } as any;
        mockElementRef = { nativeElement: document.createElement('div') } as ElementRef;
        mockViewContainerRef = {} as ViewContainerRef;

        TestBed.configureTestingModule({
            declarations: [ItemTemplateDirective],
            providers: [
                { provide: Injector, useValue: mockInjector },
                { provide: ElementRef, useValue: mockElementRef },
                { provide: App, useValue: mockApp },
                { provide: ViewContainerRef, useValue: mockViewContainerRef },
                { provide: 'EXPLICIT_CONTEXT', useValue: null }
            ]
        });

        directive = new ItemTemplateDirective(
            mockInjector,
            mockElementRef,
            mockApp as unknown as App,
            null
        );
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set nativeElement from ElementRef', () => {
        expect(directive.nativeElement).toBe(mockElementRef.nativeElement);
    });

    it('should set context from injector', () => {
        expect(directive.context).toEqual({ index: 0 });
    });

    it('should return correct $index', () => {
        expect(directive.$index).toBe(0);
    });

    it('should set wmItemTemplate', () => {
        const testContent = 'test-content';
        directive.wmItemTemplate = testContent;
        expect((directive as any).widget.content).toBe(testContent);
    });

    it('should set partialParams.item in ngOnInit', () => {
        directive.userComponentParams = { dataObject: 'test-data' };
        directive.partialParams = {};
        directive.ngOnInit();
        expect(directive.partialParams.item).toBe('test-data');
    });

    it('should get attributes correctly', () => {
        mockElementRef.nativeElement.setAttribute('attr1', 'value1');
        mockElementRef.nativeElement.setAttribute('attr2', 'value2');
        const attributes = (directive as any).getAttributes();
        expect(attributes).toContain('attr1');
        expect(attributes).toContain('attr2');
    });
});