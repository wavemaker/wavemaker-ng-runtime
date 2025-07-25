import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {DatasetAwareFormComponent} from './dataset-aware-form.component';
import {Component, Injector} from '@angular/core';
import {groupData, ToDatePipe} from '@wm/components/base';
import {App, AppDefaults} from '@wm/core';
import {mockApp} from 'projects/components/base/src/test/util/component-test-util';

jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    groupData: jest.fn().mockReturnValue([{ group: 'Group 1', items: [] }]),
    handleHeaderClick: jest.fn(),
    toggleAllHeaders: jest.fn()
}));
jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    debounce: jest.fn(fn => fn)
}));
@Component({
    selector: 'test-dataset-aware-form',
    template: '<div></div>'
})
class TestComponent extends DatasetAwareFormComponent {
    constructor(inj: Injector) {
        super(inj, { widgetType: 'wm-input', widgetSubType: 'wm-form-field-text' }, null);
    }
}

describe('DatasetAwareFormComponent', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [
                { provide: Injector, useValue: { get: jest.fn() } },
                { provide: ToDatePipe, useValue: {} },
                { provide: AppDefaults, useValue: {} },
                { provide: App, useValue: mockApp }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('modelByKey', () => {
        it('should call selectByKey when set', () => {
            const spy = jest.spyOn(component as any, 'selectByKey');
            component.modelByKey = 'testKey';
            expect(spy).toHaveBeenCalledWith('testKey');
        });
    });

    describe('datavalue', () => {
        it('should call selectByValue when set', () => {
            const spy = jest.spyOn(component as any, 'selectByValue');
            component.datavalue = 'testValue';
            expect(spy).toHaveBeenCalledWith('testValue');
        });

        it('should extract array for multiple values', () => {
            component.multiple = true;
            const spy = jest.spyOn(component as any, 'selectByValue');
            component.datavalue = 'value1,value2';
            expect(spy).toHaveBeenCalledWith(['value1', 'value2']);
        });
    });

    describe('selectByKey', () => {
        beforeEach(() => {
            component.datasetItems = [
                { key: 'key1', value: 'value1', label: 'Label 1' },
                { key: 'key2', value: 'value2', label: 'Label 2' }
            ];
        });

        it('should set _modelByValue for single selection', () => {
            (component as any).selectByKey('key1');
            expect(component['_modelByValue']).toBe('value1');
        });

        it('should set _modelByValue for multiple selection', () => {
            component.multiple = true;
            (component as any).selectByKey(['key1', 'key2']);
            expect(component['_modelByValue']).toEqual(['value1', 'value2']);
        });
    });

    describe('selectByValue', () => {
        beforeEach(() => {
            component.datasetItems = [
                { key: 'key1', value: 'value1', label: 'Label 1' },
                { key: 'key2', value: 'value2', label: 'Label 2' }
            ];
        });

        it('should set _modelByKey for single selection', () => {
            (component as any).selectByValue('value1');
            expect(component['_modelByKey']).toBe('key1');
        });

        it('should set _modelByKey for multiple selection', () => {
            component.multiple = true;
            component.acceptsArray = true;
            (component as any).selectByValue(['value1', 'value2']);
            expect(component['_modelByKey']).toEqual(['key1', 'key2']);
        });
    });

    describe('initDatasetItems', () => {
        it('should initialize datasetItems from dataset', () => {
            component.dataset = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ];
            component.datafield = 'id';
            component.displayfield = 'name';
            (component as any).initDatasetItems();
            expect(component.datasetItems.length).toBe(2);
            expect(component.datasetItems[0].key).toBe(1);
            expect(component.datasetItems[0].label).toBe('Item 1');
        });

        it('should handle empty dataset', () => {
            component.dataset = [];
            (component as any).initDatasetItems();
            expect(component.datasetItems.length).toBe(0);
        });
    });

    describe('onPropertyChange', () => {
        it('should call initDatasetItems for relevant property changes', () => {
            const spy = jest.spyOn(component as any, '_debouncedInitDatasetItems');
            component.onPropertyChange('dataset', [{ id: 1, name: 'New Item' }], []);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('setTemplate', () => {
        it('should set content to partialName', () => {
            (component as any).setTemplate('testPartial');
            expect(component.content).toBe('testPartial');
        });

        it('should set prefabName if viewParent has prefabName', () => {
            (component as any).viewParent = { prefabName: 'testPrefab' };
            (component as any).setTemplate('testPartial');
            expect((component as any)['prefabName']).toBe('testPrefab');
        });
    });

    describe('getGroupedData', () => {
        it('should return empty array if datasetItems is empty', () => {
            component.datasetItems = [];
            const result = (component as any).getGroupedData();
            expect(result).toEqual([]);
        });

        it('should call groupData if datasetItems is not empty', () => {
            component.datasetItems = [{
                key: 'item1', value: 'value1',
                label: 'value1'
            }];
            component.groupby = 'someField';
            const result = (component as any).getGroupedData();
            expect(groupData).toHaveBeenCalled();
            expect(result).toEqual([{ group: 'Group 1', items: [] }]);
        });
    });

    describe('datasetSubscription', () => {
        it('should subscribe to dataset$ and update groupedData', () => {
            const getGroupedDataSpy = jest.spyOn(component as any, 'getGroupedData').mockReturnValue(['groupedItem']);
            const registerDestroyListenerSpy = jest.spyOn(component as any, 'registerDestroyListener');

            (component as any).datasetSubscription();
            (component as any).dataset$.next();

            expect(component.groupedData).toEqual(['groupedItem']);
            expect(getGroupedDataSpy).toHaveBeenCalled();
            expect(registerDestroyListenerSpy).toHaveBeenCalled();
        });

        it('should subscribe to dataset$ and update groupedData', () => {
            const getGroupedDataSpy = jest.spyOn(component as any, 'getGroupedData').mockReturnValue(['groupedItem']);
            const registerDestroyListenerSpy = jest.spyOn(component as any, 'registerDestroyListener');

            (component as any).datasetSubscription();
            (component as any).dataset$.next();

            expect(component.groupedData).toEqual(['groupedItem']);
            expect(getGroupedDataSpy).toHaveBeenCalled();
            expect(registerDestroyListenerSpy).toHaveBeenCalled();
        });

        it('should register unsubscribe function with registerDestroyListener', () => {
            const unsubscribeSpy = jest.fn();
            jest.spyOn(component['dataset$'], 'subscribe').mockReturnValue({ unsubscribe: unsubscribeSpy } as any);

            let registeredFunction;
            jest.spyOn(component as any, 'registerDestroyListener').mockImplementation((fn) => {
                registeredFunction = fn;
            });

            (component as any).datasetSubscription();

            expect(registeredFunction).toBeDefined();
            registeredFunction();
            expect(unsubscribeSpy).toHaveBeenCalled();
        });
    });

    describe('setGroupData', () => {
        it('should call datasetSubscription and set groupedData', () => {
            const datasetSubscriptionSpy = jest.spyOn(component as any, 'datasetSubscription');
            const getGroupedDataSpy = jest.spyOn(component as any, 'getGroupedData').mockReturnValue(['groupedItem']);

            (component as any).setGroupData();

            expect(datasetSubscriptionSpy).toHaveBeenCalled();
            expect(getGroupedDataSpy).toHaveBeenCalled();
            expect(component.groupedData).toEqual(['groupedItem']);
        });
    });

    describe('_debounceDatavalueUpdation', () => {
        beforeEach(() => {
            jest.spyOn(component as any, 'initDisplayValues').mockImplementation(() => { });
        });

        it('should set toBeProcessedDatavalue and clear _modelByValue when _modelByKey is undefined', fakeAsync(() => {
            (component as any)._modelByKey = undefined;
            (component as any)._debounceDatavalueUpdation('testValue');
            tick(150);

            expect(component['toBeProcessedDatavalue']).toBe('testValue');
            expect(component['_modelByValue']).toBe('');
            expect(component['initDisplayValues']).toHaveBeenCalled();
        }));

        it('should set toBeProcessedDatavalue and clear _modelByValue when _modelByKey is an empty array', fakeAsync(() => {
            (component as any)._modelByKey = [];
            (component as any)._debounceDatavalueUpdation('testValue');
            tick(150);

            expect(component['toBeProcessedDatavalue']).toBe('testValue');
            expect(component['_modelByValue']).toBe('');
            expect(component['initDisplayValues']).toHaveBeenCalled();
        }));

        it('should set _modelByValue to first array item when multiple is false and toBeProcessedDatavalue is an array', fakeAsync(() => {
            (component as any)._modelByKey = ['key1'];
            component.multiple = false;
            component['toBeProcessedDatavalue'] = ['value1', 'value2'];
            (component as any)._modelByValue = undefined;
            (component as any)._debounceDatavalueUpdation('newValue');
            tick(150);

            expect(component['_modelByValue']).toBe('value1');
            expect(component['toBeProcessedDatavalue']).toBeUndefined();
            expect(component['initDisplayValues']).toHaveBeenCalled();
        }));

        it('should set _modelByValue to toBeProcessedDatavalue when multiple is true', fakeAsync(() => {
            (component as any)._modelByKey = ['key1', 'key2'];
            component.multiple = true;
            component['toBeProcessedDatavalue'] = ['value1', 'value2'];
            (component as any)._modelByValue = undefined;
            (component as any)._debounceDatavalueUpdation('newValue');
            tick(150);

            expect(component['_modelByValue']).toEqual(['value1', 'value2']);
            expect(component['toBeProcessedDatavalue']).toBeUndefined();
            expect(component['initDisplayValues']).toHaveBeenCalled();
        }));

        it('should not update _modelByValue if it is already defined', fakeAsync(() => {
            (component as any)._modelByKey = ['key1'];
            component['toBeProcessedDatavalue'] = 'value1';
            (component as any)._modelByValue = 'existingValue';
            (component as any)._debounceDatavalueUpdation('newValue');
            tick(150);

            expect(component['_modelByValue']).toBe('existingValue');
            expect(component['toBeProcessedDatavalue']).toBeUndefined();
            expect(component['initDisplayValues']).toHaveBeenCalled();
        }));
    });

    describe('onPropertyChange', () => {
        beforeEach(() => {
            jest.spyOn(component as any, '_debouncedInitDatasetItems').mockImplementation(() => { });
            jest.spyOn(component as any, '_onChange').mockImplementation(() => { });
            jest.spyOn(component as any, 'setGroupData').mockImplementation(() => { });
        });

        it('should call _debouncedInitDatasetItems for relevant properties', () => {
            const relevantProps = ['dataset', 'datafield', 'displayfield', 'displaylabel', 'displayexpression', 'orderby', 'usekeys'];

            relevantProps.forEach(prop => {
                component.onPropertyChange(prop, 'newValue', 'oldValue');
                expect(component['_debouncedInitDatasetItems']).toHaveBeenCalled();
            });
        });

        it('should call _onChange for required and datavalue properties', () => {
            component.onPropertyChange('required', true, false);
            expect(component['_onChange']).toHaveBeenCalledWith(component.datavalue);

            component.onPropertyChange('datavalue', 'newValue', 'oldValue');
            expect(component['_onChange']).toHaveBeenCalledWith(component.datavalue);
        });

        it('should call setGroupData for groupby and match properties if widgetType is not wm-search or wm-chips', () => {
            Object.defineProperty(component, 'widgetType', { writable: true, value: 'other-widget' });
            component.onPropertyChange('groupby', 'newValue', 'oldValue');
            expect(component['setGroupData']).toHaveBeenCalled();

            component.onPropertyChange('match', 'newValue', 'oldValue');
            expect(component['setGroupData']).toHaveBeenCalled();
        });

        it('should not call setGroupData for groupby and match properties if widgetType is wm-search or wm-chips', () => {
            Object.defineProperty(component, 'widgetType', { writable: true, value: 'wm-search' });
            component.onPropertyChange('groupby', 'newValue', 'oldValue');
            expect(component['setGroupData']).not.toHaveBeenCalled();
            Object.defineProperty(component, 'widgetType', { writable: true, value: 'wm-chips' });
            component.onPropertyChange('match', 'newValue', 'oldValue');
            expect(component['setGroupData']).not.toHaveBeenCalled();
        });
    });
});
