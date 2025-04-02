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
            imports: [TableColumnGroupDirective],
            declarations: [TestComponent],
            providers: [
                { provide: TableComponent, useValue: tableComponent },
                { provide: 'EXPLICIT_CONTEXT', useValue: {} },
                { provide: App, useValue: mockApp }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        directive = fixture.debugElement.children[0].injector.get(TableColumnGroupDirective);
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

    it('should call super.onPropertyChange for non-caption property changes', () => {
        const superOnPropertyChangeSpy = jest.spyOn(BaseComponent.prototype, 'onPropertyChange' as any);

        directive.onPropertyChange('someOtherProperty', 'newValue');

        expect(superOnPropertyChangeSpy).toHaveBeenCalledWith('someOtherProperty', 'newValue', undefined);
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