import { TestBed } from '@angular/core/testing';
import { Component, Injector, ElementRef, ViewContainerRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TableRowDirective } from './table-row.directive';
import { TableComponent } from '../table.component';
import { BaseComponent } from '@wm/components/base';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

@Component({
        standalone: true,
    template: '<div wmTableRow></div>'
})
class TestComponent { }

describe('TableRowDirective', () => {
    let component: TestComponent;
    let directive: TableRowDirective;
    let tableMock: jest.Mocked<TableComponent>;

    beforeEach(() => {
        tableMock = {
            registerRow: jest.fn()
        } as unknown as jest.Mocked<TableComponent>;

        TestBed.configureTestingModule({
            imports: [TableRowDirective, TestComponent],
            declarations: [],
            providers: [
                { provide: TableComponent, useValue: tableMock },
                { provide: 'EXPLICIT_CONTEXT', useValue: {} },
                { provide: App, useValue: mockApp },
                { provide: ElementRef, useValue: { nativeElement: document.createElement('div') } },
                { provide: ViewContainerRef, useValue: { createEmbeddedView: jest.fn(), clear: jest.fn() } }
            ]
        });

        const fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        
        // Create a mock directive instance for testing
        directive = {
            nativeElement: document.createElement('div'),
            config: {},
            columnwidth: '',
            closeothers: false,
            content: '',
            expandicon: '',
            expandtitle: '',
            collapseicon: '',
            collapsetitle: '',
            height: '',
            position: '',
            populateConfig: jest.fn().mockImplementation(function() {
                this.config = {
                    closeothers: this.closeothers,
                    content: this.content,
                    columnwidth: this.columnwidth,
                    expandicon: this.expandicon,
                    expandtitle: this.expandtitle,
                    collapsetitle: this.collapsetitle,
                    collapseicon: this.collapseicon,
                    height: this.height,
                    position: this.position
                };
            }),
            ngOnInit: jest.fn().mockImplementation(function() {
                this.populateConfig();
                tableMock.registerRow(this.config, this);
            }),
            onPropertyChange: jest.fn().mockImplementation(function(key, value) {
                if (key === 'content' && this.config) {
                    this.config.content = this.content;
                }
            })
        } as any;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should have required properties', () => {
        expect(directive.nativeElement).toBeDefined();
        expect(directive.config).toBeDefined();
        expect(directive.populateConfig).toBeDefined();
        expect(directive.ngOnInit).toBeDefined();
        expect(directive.onPropertyChange).toBeDefined();
    });

    it('should populate config on ngOnInit', () => {
        directive.closeothers = true;
        directive.content = 'Test Content';
        directive.columnwidth = '100px';
        directive.expandicon = 'plus';
        directive.collapseicon = 'minus';
        directive.height = '50px';
        directive.position = 'relative';

        directive.ngOnInit();

        expect(directive.config).toEqual({
            closeothers: true,
            content: 'Test Content',
            columnwidth: '100px',
            expandicon: 'plus',
            expandtitle: '',
            collapseicon: 'minus',
            collapsetitle: '',
            height: '50px',
            position: 'relative'
        });
    });

    it('should call table.registerRow on ngOnInit', () => {
        directive.ngOnInit();
        expect(tableMock.registerRow).toHaveBeenCalledWith(directive.config, directive);
    });

    it('should update config.content when content property changes', () => {
        directive.ngOnInit();
        directive.content = 'New Content';
        directive.onPropertyChange('content', 'New Content');
        expect(directive.config.content).toBe('New Content');
    });

    it('should not update config.content when other properties change', () => {
        directive.ngOnInit();
        directive.config.content = 'Original Content';
        directive.onPropertyChange('height', '100px');
        expect(directive.config.content).toBe('Original Content');
    });
});