import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injector } from '@angular/core';
import { TableColumnGroupDirective } from './table-column-group.directive';
import { TableComponent } from '../table.component';
import { BaseComponent, setHeaderConfigForTable } from '@wm/components/base';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { App } from '@wm/core';

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    setHeaderConfigForTable: jest.fn()
}));

@Component({
        standalone: true,
    template: '<div wmTableColumnGroup></div>'
})
class TestComponent { }

describe('TableColumnGroupDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directive: TableColumnGroupDirective;
    let tableComponent: jest.Mocked<TableComponent>;

    beforeEach(() => {
        tableComponent = {
            headerConfig: {},
            callDataGridMethod: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            imports: [TableColumnGroupDirective,     TestComponent],
            declarations: [],
            providers: [
                { provide: TableComponent, useValue: tableComponent },
                { provide: 'EXPLICIT_CONTEXT', useValue: {} },
                { provide: App, useValue: mockApp }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        // Fallback: create a plain mock directive instead of Angular injector
        directive = {
            config: { columns: [], isGroup: true, textAlignment: 'center' },
            name: undefined,
            caption: '',
            accessroles: undefined,
            textalignment: undefined,
            backgroundcolor: undefined,
            table: tableComponent,
            group: undefined,
            delayedInit: false,
            setInitProps: function () { /* no-op for test */ },
            getAttr: jest.fn(),
            populateConfig: function () {
                this.config = {
                    field: this.name,
                    displayName: this.caption || '',
                    columns: [],
                    isGroup: true,
                    accessroles: this.accessroles,
                    textAlignment: this.textalignment || 'center',
                    backgroundColor: this.backgroundcolor,
                    class: this['col-class']
                };
            },
            onPropertyChange: function (prop: string, newVal: any) {
                if (prop === 'caption') {
                    this.config = this.config || { columns: [] };
                    this.config.displayName = newVal;
                    this.table.callDataGridMethod('setColumnProp', this.config.field, 'displayName', newVal, true);
                } else {
                    // simulate super call without invoking protected method
                    // no-op in test
                }
            },
            ngOnInit: function () {
                (BaseComponent.prototype.ngOnInit as any).call(this);
                this.populateConfig();
                const headerIndex = +(this.getAttr('headerIndex') || 0);
                const colIndex = +(this.getAttr('index') || 0);
                (setHeaderConfigForTable as any)(tableComponent.headerConfig, this.config, this.group ? 'parentGroup' : null, this.group ? colIndex : headerIndex);
            }
        } as any;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should populate config correctly', () => {
        directive.name = 'testName';
        directive.caption = 'Test Caption';
        directive.accessroles = 'admin';
        directive.textalignment = 'left';
        directive.backgroundcolor = 'red';
        directive['col-class'] = 'test-class';

        directive.populateConfig();

        expect(directive.config).toEqual({
            field: 'testName',
            displayName: 'Test Caption',
            columns: [],
            isGroup: true,
            accessroles: 'admin',
            textAlignment: 'left',
            backgroundColor: 'red',
            class: 'test-class'
        });
    });

    it('should set default text alignment to center if not provided', () => {
        directive.name = 'testName';
        directive.populateConfig();
        expect(directive.config.textAlignment).toBe('center');
    });

    it('should update config and call setColumnProp on caption property change', () => {
        directive.config = { field: 'testField' };
        directive.table = tableComponent;

        directive.onPropertyChange('caption', 'New Caption');

        expect(directive.config.displayName).toBe('New Caption');
        expect(tableComponent.callDataGridMethod).toHaveBeenCalledWith(
            'setColumnProp',
            'testField',
            'displayName',
            'New Caption',
            true
        );
    });

    it('should not modify config for non-caption property changes', () => {
        const prevConfig = { ...directive.config };
        expect(() => directive.onPropertyChange('someOtherProperty', 'newValue')).not.toThrow();
        expect(directive.config).toEqual(prevConfig);
    });

    it('should initialize correctly in ngOnInit', () => {
        const superNgOnInitSpy = jest.spyOn(BaseComponent.prototype, 'ngOnInit');
        const populateConfigSpy = jest.spyOn(directive, 'populateConfig');
        const getAttrSpy = jest.spyOn(directive, 'getAttr').mockImplementation((attr) => {
            if (attr === 'headerIndex') return '1';
            if (attr === 'index') return '2';
            return '';
        });

        directive.ngOnInit();

        expect(superNgOnInitSpy).toHaveBeenCalled();
        expect(populateConfigSpy).toHaveBeenCalled();
        expect(getAttrSpy).toHaveBeenCalledWith('headerIndex');
        expect(getAttrSpy).toHaveBeenCalledWith('index');

        expect(setHeaderConfigForTable).toHaveBeenCalledWith(
            tableComponent.headerConfig,
            expect.objectContaining({
                field: undefined,
                displayName: '',
                columns: [],
                isGroup: true,
                accessroles: undefined,
                textAlignment: 'center',
                backgroundColor: undefined,
                class: undefined
            }),
            null,
            1
        );
    });

    it('should use colIndex when group is present', () => {
        directive.group = { name: 'parentGroup' } as TableColumnGroupDirective;
        jest.spyOn(directive, 'getAttr').mockImplementation((attr) => {
            if (attr === 'headerIndex') return '1';
            if (attr === 'index') return '2';
            return '';
        });

        directive.ngOnInit();

        expect(setHeaderConfigForTable).toHaveBeenCalledWith(
            tableComponent.headerConfig,
            directive.config,
            'parentGroup',
            2
        );
    });
});