import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableColumnDirective } from './table-column.directive';
import { TableComponent } from '../table.component';
import { App, AppDefaults, FormWidgetType } from '@wm/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { fetchRelatedFieldData, getDistinctValuesForField, isDataSetWidget, getDefaultValue } from '@wm/components/base';

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    isDataSetWidget: jest.fn(),
    fetchRelatedFieldData: jest.fn(),
    getDistinctValuesForField: jest.fn(),
    getDefaultValue: jest.fn(),
}));

@Component({
    template: '<div wmTableColumn></div>'
})
class TestComponent { }

describe('TableColumnDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let directive: TableColumnDirective;
    let mockTable: Partial<TableComponent>;
    let mockAppDefaults: Partial<AppDefaults>;

    beforeEach(async () => {
        mockTable = {
            redraw: jest.fn() as any,
            registerColumns: jest.fn(),
            headerConfig: [],
            filtermode: 'multicolumn',
            registerFormField: jest.fn(),
            editmode: 'inline',
            callDataGridMethod: jest.fn(),
            ngform: {
                addControl: jest.fn(),
                markAsUntouched: jest.fn(),
                controls: {
                    testField: new FormControl(),
                    '_new_testField': new FormControl(),
                },
            } as any,
            fb: new FormBuilder(),
            rowFilter: {
                testField: {
                    value: 'initial value'
                }
            },
            datasource: {
                execute: jest.fn(() => false),
                data: [
                    { id: 1, name: 'Option 1' },
                    { id: 2, name: 'Option 2' },
                    { id: 3, name: 'Option 3' }
                ]
            }
        };
        mockAppDefaults = {
            dateFormat: 'yyyy-MM-dd',
            timeFormat: 'HH:mm:ss',
            dateTimeFormat: 'yyyy-MM-dd HH:mm:ss',
        };

        await TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [ReactiveFormsModule, TableColumnDirective],
            providers: [
                { provide: TableComponent, useValue: mockTable },
                { provide: AppDefaults, useValue: mockAppDefaults },
                { provide: App, useValue: mockApp }
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        directive = fixture.debugElement.children[0].injector.get(TableColumnDirective);
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should set up controls for inline editing', () => {
        directive.binding = 'testField';
        (directive as any)._isInlineEditable = true;
        directive.setUpControls();
        expect(mockTable.ngform.addControl).toHaveBeenCalledWith('testField', expect.any(Object));
    });

    it('should set up filter widget', () => {
        directive.filterwidget = 'text';
        directive.binding = 'testField';
        directive.filterInstance = {
            registerReadyStateListener: jest.fn(cb => cb()),
        };
        directive.setUpFilterWidget();
        expect(directive.filterInstance.placeholder).toBe('');
    });

    it('should set default date pattern when not specified', () => {
        directive.type = 'date';
        directive.formatpattern = 'toDate';
        directive.populateFieldDef();
        expect(directive.datepattern).toBe(mockAppDefaults.dateFormat);
    });

    it('should update display name on caption change', () => {
        directive.setProperty = jest.fn();
        directive.onPropertyChange('caption', 'New Caption', 'Old Caption');
        expect(directive.displayName).toBe('New Caption');
        expect(directive.setProperty).toHaveBeenCalledWith('displayName', 'New Caption');
    });

    it('should set up validators', () => {
        (directive as any).fieldValidations = { setUpValidators: jest.fn() };
        directive.setUpValidators();
        expect((directive as any).fieldValidations.setUpValidators).toHaveBeenCalled();
    });

    it('should aggregate column data', () => {
        directive.table = {
            dataset: [{ value: 1 }, { value: 2 }, { value: 3 }],
        } as any;
        directive.binding = 'value';
        expect(directive.aggregate.sum()).toBe(6);
        expect(directive.aggregate.average()).toBe(2);
        expect(directive.aggregate.count()).toBe(3);
        expect(directive.aggregate.minimum()).toBe(1);
        expect(directive.aggregate.maximum()).toBe(3);
    });

    it('should call loadFilterData on onDataSourceChange', () => {
        jest.spyOn(directive, 'loadFilterData');
        directive.onDataSourceChange();
        expect(directive.loadFilterData).toHaveBeenCalled();
    });

    it('should call loadInlineWidgetData on onDataSourceChange when in quick edit mode', () => {
        jest.spyOn(directive, 'loadInlineWidgetData');
        mockTable.editmode = 'quickedit';
        directive.onDataSourceChange();
        expect(directive.loadInlineWidgetData).toHaveBeenCalled();
    });

    it('should set the filter widget data set', () => {
        (directive as any)._filterDataSet = [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2' },
            { id: 3, name: 'Option 3' },
        ];
        directive.filterInstance = { dataset: [] };
        directive.setFilterWidgetDataSet();
        expect(directive.filterInstance.dataset).toEqual((directive as any)._filterDataSet);
    });

    it('should remove new row validations and mark form as untouched', () => {
        const markAsUntouchedSpy = jest.spyOn(mockTable.ngform, 'markAsUntouched');
        directive.removeNewRowValidations();
        expect(markAsUntouchedSpy).toHaveBeenCalled();
    });

    it('should set up inline edit control if _isInlineEditable is true and editWidgetType is not UPLOAD', () => {
        (directive as any)._isInlineEditable = true;
        directive.editWidgetType = FormWidgetType.AUTOCOMPLETE; // Not UPLOAD

        jest.spyOn(directive, 'addFormControl');
        jest.spyOn(directive, 'getFormControl').mockReturnValue(new FormControl());
        jest.spyOn(directive, 'registerDestroyListener');

        directive.setUpControls();

        expect(directive.addFormControl).toHaveBeenCalled();
        expect(directive.getFormControl).toHaveBeenCalled();
        expect(directive.registerDestroyListener).toHaveBeenCalled();
    });

    it('should set up new inline edit control if _isNewEditableRow is true', () => {
        (directive as any)._isInlineEditable = true;
        (directive as any)._isNewEditableRow = true;
        directive.editWidgetType = FormWidgetType.AUTOCOMPLETE; // Not UPLOAD

        jest.spyOn(directive, 'addFormControl');
        jest.spyOn(directive, 'getFormControl').mockReturnValue(new FormControl());
        jest.spyOn(directive, 'registerDestroyListener');

        directive.setUpControls();

        expect(directive.addFormControl).toHaveBeenCalledWith('_new');
        expect(directive.getFormControl).toHaveBeenCalledWith('_new');
        expect(directive.registerDestroyListener).toHaveBeenCalled();
    });

    it('should set up row filter control if _isRowFilter is true', () => {
        (directive as any)._isRowFilter = true;

        jest.spyOn(directive, 'addFormControl');
        jest.spyOn(directive, 'getFormControl').mockReturnValue(new FormControl());
        jest.spyOn(directive, 'registerDestroyListener');

        directive.setUpControls();

        expect(directive.addFormControl).toHaveBeenCalledWith('_filter');
        expect(directive.getFormControl).toHaveBeenCalledWith('_filter');
        expect(directive.registerDestroyListener).toHaveBeenCalled();
    });

    it('should subscribe to valueChanges of form controls and register destroy listeners', () => {
        (directive as any)._isInlineEditable = true;
        directive.editWidgetType = FormWidgetType.AUTOCOMPLETE; // Not UPLOAD
        (directive as any)._isNewEditableRow = true;
        (directive as any)._isRowFilter = true;

        const control = new FormControl();
        const newControl = new FormControl();
        const filterControl = new FormControl();

        jest.spyOn(directive, 'addFormControl');
        jest.spyOn(directive, 'getFormControl')
            .mockImplementation((type?: string) => {
                switch (type) {
                    case '_new': return newControl;
                    case '_filter': return filterControl;
                    default: return control;
                }
            });
        jest.spyOn(directive, 'registerDestroyListener');

        directive.setUpControls();

        expect(directive.getFormControl).toHaveBeenCalledTimes(3);
        expect(directive.registerDestroyListener).toHaveBeenCalledTimes(3);
    });

    describe('applyValidations', () => {
        it('should apply sync validators', () => {
            directive.getFormControl = jest.fn().mockReturnValue(new FormControl());
            (directive as any).syncValidators = [jest.fn()];
            (directive as any).fieldValidations = { setValidators: jest.fn(), setUpValidators: jest.fn() };
            directive.applyValidations();
            expect((directive as any).fieldValidations.setValidators).toHaveBeenCalledWith((directive as any).syncValidators);
            expect((directive as any).fieldValidations.setUpValidators).toHaveBeenCalled();
        });
    });

    describe('removeValidations', () => {
        it('should clear validators and update value and validity', () => {
            const mockControl = new FormControl();
            mockControl.clearValidators = jest.fn();
            mockControl.clearAsyncValidators = jest.fn();
            mockControl.updateValueAndValidity = jest.fn();
            jest.spyOn(directive, 'getFormControl').mockReturnValue(mockControl);
            directive.removeValidations();
            expect(mockControl.clearValidators).toHaveBeenCalled();
            expect(mockControl.clearAsyncValidators).toHaveBeenCalled();
            expect(mockControl.updateValueAndValidity).toHaveBeenCalled();
        });
    });

    describe('resetFilter', () => {
        it('should reset the filter control value to an empty string', () => {
            directive.filterControl = new FormControl('initial value');
            directive.resetFilter();
            expect(directive.filterControl.value).toBe('');
        });

        it('should reset the autocomplete filter instance query and queryModel', () => {
            directive.filterwidget = FormWidgetType.AUTOCOMPLETE;
            directive.filterInstance = {
                query: 'initial query',
                queryModel: 'initial queryModel'
            };
            directive.resetFilter();
            expect(directive.filterInstance.query).toBe('');
            expect(directive.filterInstance.queryModel).toBe('');
        });
    });

    describe('onFilterValueChange', () => {
        it('should update the row filter value in the table component', () => {
            directive.field = 'testField';
            directive.onFilterValueChange('new value');
            expect(mockTable.rowFilter.testField.value).toBe('new value');
        });
    });

    describe('loadInlineWidgetData', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            directive['edit-widget-type'] = 'test-widget';
            directive.binddataset = false;
            directive.readonly = false;
            directive['related-entity-name'] = 'entity';
            directive['primary-key'] = 'id';
            directive.binding = 'relatedField.dataField';
        });

        it('should not proceed if the widget is not a DataSetWidget', () => {
            (isDataSetWidget as jest.Mock).mockReturnValue(false);
            directive.loadInlineWidgetData();
            expect(isDataSetWidget).toHaveBeenCalledWith('test-widget');
            expect(fetchRelatedFieldData).not.toHaveBeenCalled();
            expect(getDistinctValuesForField).not.toHaveBeenCalled();
        });

        it('should fetch related field data when related-entity-name and primary-key are defined', () => {
            (isDataSetWidget as jest.Mock).mockReturnValue(true);
            directive.loadInlineWidgetData();
            expect(directive.isDataSetBound).toBe(true);
            expect(directive.showPendingSpinner).toBe(true);
            expect(fetchRelatedFieldData).toHaveBeenCalledWith(mockTable.datasource, (directive as any).widget, {
                relatedField: 'relatedField',
                datafield: 'dataField',
                widget: 'edit-widget-type',
            });
        });

        it('should fetch distinct values for field when dataset supports distinct API and no related-entity-name', () => {
            directive['related-entity-name'] = null;
            (isDataSetWidget as jest.Mock).mockReturnValue(true);
            (mockTable.datasource.execute as jest.Mock).mockReturnValue(true);
            directive.loadInlineWidgetData();
            expect(fetchRelatedFieldData).not.toHaveBeenCalled();
            expect(getDistinctValuesForField).toHaveBeenCalledWith(mockTable.datasource, (directive as any).widget, {
                widget: 'edit-widget-type',
            });
        });
    });


    describe('setUpFilterWidget', () => {
        beforeEach(() => {
            directive.filterInstance = {
                registerReadyStateListener: jest.fn((callback) => callback()),
                dataset: null,
                datafield: null,
                displayfield: null,
                displaylabel: null,
                searchkey: null,
                timepattern: null,
                placeholder: null,
            };
            directive.filterwidget = 'autocomplete';
            directive.binding = 'department.deptId';
            (directive as any)._filterDataSet = [{ id: 1, name: 'Option 1' }];
            directive.filterdatafield = '';
            directive.filterdisplayfield = '';
            directive.filterdisplaylabel = '';
            directive.filtersearchkey = '';
            directive.filterplaceholder = 'Enter a value';
        });

        it('should set up filter widget with dataset properties for a DataSetWidget', () => {
            (isDataSetWidget as jest.Mock).mockReturnValue(true);
            directive.setUpFilterWidget();
            const expectedField = 'deptId';

            expect(isDataSetWidget).toHaveBeenCalledWith('autocomplete');
            expect(directive.filterInstance.dataset).toEqual((directive as any)._filterDataSet);
            expect(directive.filterInstance.datafield).toEqual(expectedField);
            expect(directive.filterInstance.displayfield).toEqual(expectedField);
            expect(directive.filterInstance.displaylabel).toEqual(expectedField);
            expect(directive.filterInstance.searchkey).toEqual(expectedField);
            expect(directive.filterInstance.placeholder).toEqual('Enter a value');
        });

        it('should set the time pattern for TIME widget', () => {
            directive.filterwidget = FormWidgetType.TIME;
            directive.setUpFilterWidget();

            expect(directive.filterInstance.timepattern).toEqual('HH:mm:ss');
        });

        it('should set placeholder if not provided', () => {
            directive.filterplaceholder = '';
            directive.setUpFilterWidget();

            expect(directive.filterInstance.placeholder).toEqual('');
        });
    });

    describe('notifyChanges', () => {
        beforeEach(() => {
            (directive as any).notifyForFields = [
                { fieldValidations: { validate: jest.fn() }, fieldValidations_new: { validate: jest.fn() } },
                { fieldValidations: { validate: jest.fn() }, fieldValidations_new: { validate: jest.fn() } },
            ];
            (directive as any)._isNewEditableRow = false;
        });

        it('should notify changes for all fields without quickEdit', () => {
            directive.notifyChanges();
            (directive as any).notifyForFields.forEach(field => {
                expect(field.fieldValidations.validate).toHaveBeenCalled();
            });
        });

        it('should notify changes for all fields with quickEdit and _isNewEditableRow', () => {
            (directive as any)._isNewEditableRow = true;
            directive.notifyChanges(true);
            (directive as any).notifyForFields.forEach(field => {
                expect(field.fieldValidations_new.validate).toHaveBeenCalled();
            });
        });
    });

    describe('observeOn', () => {
        it('should clone and set the observeOnFields property', () => {
            const fields = ['field1', 'field2'];
            directive.observeOn(fields);
            expect((directive as any).observeOnFields).toEqual(fields);
        });
    });

    describe('setAsyncValidators', () => {
        it('should set asyncValidators using cloneDeep', () => {
            const validators = ['asyncValidator1', 'asyncValidator2'];
            directive.setAsyncValidators(validators);
            expect((directive as any).asyncValidators).toEqual(validators);
        });
    });

    describe('setValidators', () => {
        it('should set syncValidators using cloneDeep', () => {
            const validators = ['validator1', 'validator2'];
            directive.setValidators(validators);
            expect((directive as any).syncValidators).toEqual(validators);
        });
    });

    describe('boundFn', () => {
        it('should execute the passed function and return its result', () => {
            const fn = jest.fn(() => 'result');
            const result = directive.boundFn(fn);

            expect(fn).toHaveBeenCalled();
            expect(result).toBe('result');
        });
    });

    describe('onStatusChange', () => {
        it('should set showPendingSpinner based on status and type', () => {
            directive.onStatusChange('PENDING', 'inlineInstance');
            expect(directive['showPendingSpinner']).toBe(true);

            directive.onStatusChange('PENDING', 'quickeditInstance');
            expect(directive['showPendingSpinnerNew']).toBe(true);

            directive.onStatusChange('VALID', 'inlineInstance');
            expect(directive['showPendingSpinner']).toBe(false);

            directive.onStatusChange('VALID', 'quickeditInstance');
            expect(directive['showPendingSpinnerNew']).toBe(false);
        });
    });

    describe('setSummaryRowData', () => {
        beforeEach(() => {
            (directive as any)._invokeSummaryRowData = jest.fn();
        });

        it('should invoke _invokeSummaryRowData with an array if data is already an array', () => {
            const data = [{ id: 1, value: 'A' }, { id: 2, value: 'B' }];
            directive.setSummaryRowData(data);
            expect((directive as any)._invokeSummaryRowData).toHaveBeenCalledWith(data);
        });

        it('should invoke _invokeSummaryRowData with an array if data is not an array', () => {
            const data = { id: 1, value: 'A' };
            directive.setSummaryRowData(data);
            expect((directive as any)._invokeSummaryRowData).toHaveBeenCalledWith([data]);
        });
    });


    describe('_invokeSummaryRowData', () => {
        beforeEach(() => {
            directive.key = 'testKey';
        });

        it('should call callDataGridMethod for each item in data', () => {
            const data = [{ id: 1 }, { id: 2 }];
            directive.key = 'testKey';
            (directive as any)._invokeSummaryRowData(data);
            expect(mockTable.callDataGridMethod).toHaveBeenCalledTimes(2);
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('setSummaryRowDef', 'testKey', { id: 1 }, 0);
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('setSummaryRowDef', 'testKey', { id: 2 }, 1);
        });

        it('should handle Promises in content and call callDataGridMethod with resolved value', async () => {
            const resolvedValue = 'resolvedValue';
            const data = [Promise.resolve(resolvedValue)];

            await (directive as any)._invokeSummaryRowData(data);

            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('setSummaryRowDef', 'testKey', resolvedValue, 0, true);
        });

        it('should handle Promises in content.value and call callDataGridMethod with resolved value', async () => {
            const resolvedValue = 'resolvedValue';
            const data = [{ value: Promise.resolve(resolvedValue) }];

            await (directive as any)._invokeSummaryRowData(data);

            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('setSummaryRowDef', 'testKey', { value: resolvedValue }, 0, true);
        });
    });

    describe('setInlineWidgetProp', () => {
        beforeEach(() => {
            directive.editWidgetType = FormWidgetType.TIME;
            directive['widget'] = {};
        });

        it('should set prop to timepattern if prop is datepattern and editWidgetType is TIME', () => {
            directive.setInlineWidgetProp('widget', 'datepattern', 'HH:mm:ss');
            expect(directive['widget'].timepattern).toBe('HH:mm:ss');
        });

        it('should set the property on the widget if it is defined', () => {
            directive.setInlineWidgetProp('widget', 'someprop', 'somevalue');
            expect(directive['widget'].someprop).toBe('somevalue');
        });

        it('should not set the property if the value is undefined', () => {
            directive.setInlineWidgetProp('widget', 'someprop', undefined);
            expect(directive['widget'].someprop).toBeUndefined();
        });
    });

    describe('setUpInlineWidget', () => {
        beforeEach(() => {
            directive['widget'] = {
                registerReadyStateListener: jest.fn((cb) => cb()),
            };
            directive.dataset = { data: 'someData' };
            (directive as any)._datasource = { source: 'datasource' };
            (directive as any)._dataoptions = { options: 'dataoptions' };
        });

        it('should set dataset on the widget if it is a dataset widget', () => {
            directive['edit-widget-type'] = 'someType';
            jest.spyOn(directive, 'setInlineWidgetProp');
            jest.spyOn(directive, 'setUpInlineWidget');
            directive.setUpInlineWidget('widget');
            expect(directive['widget'].dataset).toBe(directive.dataset);
        });

        it('should set widget properties using setInlineWidgetProp', () => {
            jest.spyOn(directive, 'setInlineWidgetProp');
            directive.setUpInlineWidget('widget');
            expect(directive.setInlineWidgetProp).toHaveBeenCalled();
        });

        it('should set datasource and dataoptions on the widget', () => {
            directive.setUpInlineWidget('widget');
            expect(directive['widget'].datasource).toBe((directive as any)._datasource);
            expect(directive['widget'].dataoptions).toBe((directive as any)._dataoptions);
        });
    });

    describe('onPropertyChange', () => {
        beforeEach(() => {
            directive.setProperty = jest.fn();
            directive.group = { name: 'testGroup' } as any;
            directive.getAttr = jest.fn((attr) => {
                if (attr === 'index') return '2';
                if (attr === 'headerIndex') return '1';
                return '';
            });
            jest.clearAllMocks();
        });

        it('should update displayName and set displayName property on caption change', () => {
            directive.onPropertyChange('caption', 'New Caption', 'Old Caption');
            expect(directive.displayName).toBe('New Caption');
            expect(directive.setProperty).toHaveBeenCalledWith('displayName', 'New Caption');
        });

        it('should set the default value correctly on defaultvalue change', () => {
            (getDefaultValue as jest.Mock).mockReturnValue('defaultValue');
            directive.onPropertyChange('defaultvalue', 'New Default', 'Old Default');
            expect(directive.defaultvalue).toBe('defaultValue');
        });

        it('should update _filterDataSet and call setFilterWidgetDataSet on filterdataset change', () => {
            directive.setFilterWidgetDataSet = jest.fn();
            directive.onPropertyChange('filterdataset', 'newDataset', 'oldDataset');
            expect((directive as any)._filterDataSet).toBe('newDataset');
            expect(directive.setFilterWidgetDataSet).toHaveBeenCalled();
        });

        it('should set inline widget date pattern on editdatepattern change', () => {
            directive.setInlineWidgetProp = jest.fn();
            directive.onPropertyChange('editdatepattern', 'newPattern', 'oldPattern');
            expect(directive.setInlineWidgetProp).toHaveBeenCalledWith('inlineInstance', 'datepattern', 'newPattern');
            expect(directive.setInlineWidgetProp).toHaveBeenCalledWith('inlineInstanceNew', 'datepattern', 'newPattern');
        });

        it('should update showinfilter property on showinfilter change', () => {
            directive.onPropertyChange('showinfilter', 'true', 'false');
            expect(directive.showinfilter).toBe('true');
        });

        it('should call the super method onPropertyChange after handling the key', () => {
            const spySuperOnPropertyChange = jest.spyOn(TableColumnDirective.prototype, 'onPropertyChange');
            directive.onPropertyChange('caption', 'New Caption', 'Old Caption');
            expect(spySuperOnPropertyChange).toHaveBeenCalledWith('caption', 'New Caption', 'Old Caption');
        });
    });

    describe('setProperty', () => {
        beforeEach(() => {
            directive.field = 'testField';
            jest.clearAllMocks();
        });

        it('should set the property value correctly', () => {
            directive.setProperty('testProp', 'testValue');
            expect(directive['testProp']).toBe('testValue');
        });

        it('should call callDataGridMethod with correct arguments for displayName property', () => {
            directive.setProperty('displayName', 'New Display Name');
            expect(mockTable.callDataGridMethod).toHaveBeenCalledWith('setColumnProp', 'testField', 'displayName', 'New Display Name');
        });

        it('should call redraw with true for non-displayName properties', () => {
            directive.setProperty('nonDisplayNameProp', 'someValue');
            expect(mockTable.redraw).toHaveBeenCalledWith(true);
        });
    });

    describe('ngAfterContentInit', () => {
        it('should set up filter widget and register destroy listener if _isRowFilter is true', () => {
            (directive as any)._isRowFilter = true;
            directive._filterInstances = {
                changes: {
                    subscribe: jest.fn().mockImplementation(callback => {
                        // Call the callback immediately with a mock value for testing purposes
                        callback({ first: { widget: { registerReadyStateListener: jest.fn() } } });
                        return { unsubscribe: jest.fn() };
                    })
                }
            } as any;
            directive.registerDestroyListener = jest.fn();
            directive.ngAfterContentInit();
            expect(directive._filterInstances.changes.subscribe).toHaveBeenCalled();
            expect(directive.filterInstance.registerReadyStateListener).toHaveBeenCalled();
            expect(directive.registerDestroyListener).toHaveBeenCalled();
        });

        it('should set up inline widget and register destroy listener if _isInlineEditable is true', () => {
            (directive as any)._isInlineEditable = true;
            directive._inlineInstances = {
                changes: {
                    subscribe: jest.fn().mockImplementation(callback => {
                        callback({ first: { widget: { registerReadyStateListener: jest.fn() } } });
                        return { unsubscribe: jest.fn() };
                    })
                }
            } as any;
            (directive as any).fieldValidations = { formwidget: undefined } as any;
            directive.registerDestroyListener = jest.fn();
            directive.ngAfterContentInit();
            expect(directive._inlineInstances.changes.subscribe).toHaveBeenCalled();
            expect(directive.inlineInstance.registerReadyStateListener).toHaveBeenCalled();
            expect((directive as any).fieldValidations.formwidget).toBeTruthy();
            expect(directive.registerDestroyListener).toHaveBeenCalled();
            expect(mockTable.registerFormField).toHaveBeenCalled();
        });

        it('should set up new inline widget if _isNewEditableRow is true', () => {
            (directive as any)._isInlineEditable = true;
            (directive as any)._isNewEditableRow = true;
            directive._inlineInstancesNew = {
                changes: {
                    subscribe: jest.fn().mockImplementation(callback => {
                        callback({ first: { widget: { registerReadyStateListener: jest.fn() } } });
                        return { unsubscribe: jest.fn() };
                    })
                }
            } as any;
            (directive as any).fieldValidations_new = { formwidget: undefined } as any;
            directive.registerDestroyListener = jest.fn();
            directive.ngAfterContentInit();
            expect(directive._inlineInstancesNew.changes.subscribe).toHaveBeenCalled();
            expect(directive.inlineInstanceNew.registerReadyStateListener).toHaveBeenCalled();
            expect((directive as any).fieldValidations_new.formwidget).toBeTruthy();
            expect(directive.registerDestroyListener).toHaveBeenCalled();
        });
        it('should set the key to field or binding after ready state listener is registered', () => {
            directive.field = 'testField';
            directive.binding = 'testBinding';
            directive.registerReadyStateListener = (callback) => callback();
            directive.ngAfterContentInit();
            expect(directive.key).toBe('testField');
        });

        it('should add inline widget template reference to dynamic table', () => {
            (directive as any).table.isdynamictable = true;
            directive.table.inlineWidgetTmpl = {
                _results: [],
            } as any;
            directive.ngAfterContentInit();
            expect((directive as any).table.inlineWidgetTmpl._results).toContain(directive.inlineWidthTempRef);
        });
    });

});