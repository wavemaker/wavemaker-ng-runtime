import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TableRowDirective } from './table-row.directive';
import { TableComponent } from '../table.component';
import { BaseComponent } from '@wm/components/base';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

@Component({
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
            declarations: [TestComponent, TableRowDirective],
            providers: [
                { provide: TableComponent, useValue: tableMock },
                { provide: 'EXPLICIT_CONTEXT', useValue: {} },
                { provide: App, useValue: mockApp }
            ]
        });

        const fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        directive = fixture.debugElement.children[0].injector.get(TableRowDirective);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should extend BaseComponent', () => {
        expect(directive).toBeInstanceOf(BaseComponent);
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
            columnwidth: '30px',
            expandicon: 'plus',
            collapseicon: 'minus',
            height: '50px',
            position: '0'
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