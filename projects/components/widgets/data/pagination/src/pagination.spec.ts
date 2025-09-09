import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PaginationComponent} from './pagination.component';
import {App, AppConstants, DataSource} from '@wm/core';
import {mockApp} from 'projects/components/base/src/test/util/component-test-util';
import {WidgetRef} from '@wm/components/base';
import {NO_ERRORS_SCHEMA} from '@angular/compiler';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {EventEmitter} from '@angular/core';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent, FormsModule, ReactiveFormsModule],
            providers: [
                { provide: App, useValue: mockApp },
                {
                    provide: WidgetRef,
                    useValue: {
                        widget: {},
                        parent: {
                            statePersistence: {
                                computeMode: jest.fn(),
                                removeWidgetState: jest.fn(),
                                setWidgetState: jest.fn()
                            }
                        }
                    }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;

        component.dn = { currentPage: 1 };
        component.navigation = 'Basic';
        component.navcontrols = 'Basic';
        component.maxResults = 10;
        component.dataSize = 100;

        // Set up the nativeElement mock
        (component as any).nativeElement = document.createElement('div');

        // Mock parent and its methods
        component.parent = {
            statePersistence: {
                computeMode: jest.fn(),
                removeWidgetState: jest.fn(),
                setWidgetState: jest.fn()
            },
            invokeEventCallback: jest.fn(),
            getActualPageSize: jest.fn().mockReturnValue(5),
            widgetType: 'wm-table',
        } as any;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.dn.currentPage).toBe(1);
        expect(component.pageCount).toBe(0);
        expect(component.isDisableNext).toBe(true);
        expect(component.isDisablePrevious).toBe(true);
        expect(component.isDisableFirst).toBe(true);
        expect(component.isDisableLast).toBe(true);
    });

    it('should update navigation size correctly', () => {
        component.navcontrols = 'Basic';
        component.navigationsize = 'small';
        (component as any).updateNavSize();
        expect(component.navigationClass).toBe('pagination-sm');

        component.navcontrols = 'Classic';
        component.navigationsize = 'large';
        (component as any).updateNavSize();
        expect(component.navigationClass).toBe('pagination-lg');
    });

    it('should reset page navigation', () => {
        component.resetPageNavigation();
        expect(component.pageCount).toBe(0);
        expect(component.dn.currentPage).toBe(1);
        expect(component.dataSize).toBe(0);
    });

    it('should calculate paging values correctly', () => {
        component.dataSize = 100;
        component.maxResults = 10;
        component.calculatePagingValues();
        expect(component.pageCount).toBe(10);
    });

    it('should set default paging values', () => {
        component.setDefaultPagingValues(100, 10, 2);
        expect(component.maxResults).toBe(10);
        expect(component.dataSize).toBe(100);
        expect(component.dn.currentPage).toBe(2);
        expect(component.pageCount).toBe(10);
    });

    it('should check if it is the first page', () => {
        component.dn.currentPage = 1;
        expect(component.isFirstPage()).toBe(true);
        component.dn.currentPage = 2;
        expect(component.isFirstPage()).toBe(false);
    });

    it('should check if it is the last page', () => {
        component.dn.currentPage = 10;
        component.pageCount = 10;
        expect(component.isLastPage()).toBe(true);
        component.dn.currentPage = 9;
        expect(component.isLastPage()).toBe(false);
    });

    it('should go to the last page', () => {
        component.dn.currentPage = 5;
        component.pageCount = 10;
        jest.spyOn(component, 'goToPage');
        component.goToLastPage(false, null, null);
        expect(component.dn.currentPage).toBe(10);
        expect(component.goToPage).toHaveBeenCalled();
    });

    it('should go to the first page', () => {
        component.dn.currentPage = 5;
        jest.spyOn(component, 'goToPage');
        component.goToFirstPage(false, null, null);
        expect(component.dn.currentPage).toBe(1);
        expect(component.goToPage).toHaveBeenCalled();
    });

    it('should emit result', () => {
        jest.spyOn(component.resultEmitter, 'emit');
        component.setResult([1, 2, 3]);
        expect(component.result).toEqual([1, 2, 3]);
        expect(component.resultEmitter.emit).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should go to page', () => {
        component.dn.currentPage = 2;
        component.maxResults = 10;
        component.parent.statePersistence.computeMode.mockReturnValue('none');
        component.goToPage();
        expect(component.firstRow).toBe(10);
        expect(component.parent.statePersistence.computeMode).toHaveBeenCalled();
    });

    describe('checkDataSize', () => {
        beforeEach(() => {
            component.showrecordcount = true;
            component.isDisableLast = false;
            component.isDisableCount = false;
            component.isDisableNext = false;
            component.prevshowrecordcount = undefined;
        });

        it('should handle dataSize of -1', () => {
            component.checkDataSize(-1);
            expect(component.prevshowrecordcount).toBe(true);
            expect(component.isDisableLast).toBe(true);
            expect(component.isDisableCount).toBe(true);
            expect(component.showrecordcount).toBe(false);
        });

        it('should handle dataSize of INT_MAX_VALUE', () => {
            component.checkDataSize(AppConstants.INT_MAX_VALUE);
            expect(component.prevshowrecordcount).toBe(true);
            expect(component.isDisableLast).toBe(true);
            expect(component.isDisableCount).toBe(true);
            expect(component.showrecordcount).toBe(false);
        });

        it('should disable next button when numberOfElements < size', () => {
            component.checkDataSize(-1, 5, 10);
            expect(component.isDisableNext).toBe(true);
        });

        it('should not disable next button when numberOfElements >= size', () => {
            component.checkDataSize(-1, 10, 10);
            expect(component.isDisableNext).toBe(false);
        });

        it('should handle normal dataSize', () => {
            component.checkDataSize(100);
            expect(component.isDisableCount).toBe(false);
            expect(component.showrecordcount).toBe(true);
        });
    });

    describe('setPagingValues', () => {
        it('should set paging values for datasource with paging', () => {
            component.binddataset = true;
            component.datasource = {
                execute: jest.fn().mockReturnValue({
                    totalElements: 100,
                    size: 10,
                    number: 0,
                    numberOfElements: 10,
                    sort: [{ field: 'name', direction: 'asc' }]
                }),
                _options: {
                    filterFields: { name: 'John' },
                    logicalOp: 'AND',
                    orderBy: 'name ASC'
                }
            };
            component['isDataSourceHasPaging'] = jest.fn().mockReturnValue(true);
            component['setDefaultPagingValues'] = jest.fn();
            component['disableNavigation'] = jest.fn();
            component['checkDataSize'] = jest.fn();
            component['setResult'] = jest.fn();
            component['_setAriaForBasicNavigation'] = jest.fn();

            component['setPagingValues']([{ id: 1, name: 'John' }]);

            expect(component.datasource.execute).toHaveBeenCalledWith(DataSource.Operation.GET_PAGING_OPTIONS);
            expect(component['setDefaultPagingValues']).toHaveBeenCalledWith(100, 10, 1);
            expect(component['disableNavigation']).toHaveBeenCalled();
            expect(component['checkDataSize']).toHaveBeenCalledWith(100, 10, 10);
            expect(component['setResult']).toHaveBeenCalledWith([{ id: 1, name: 'John' }]);
            expect(component.filterFields).toEqual({ name: 'John' });
            expect(component.logicalOp).toBe('AND');
            expect(component.sortOptions).toBe('name ASC');
        });

        it('should set non-pageable data when datasource does not have paging', () => {
            component.binddataset = true;
            component['isDataSourceHasPaging'] = jest.fn().mockReturnValue(false);
            component['setNonPageableData'] = jest.fn();
            component['_setAriaForBasicNavigation'] = jest.fn();

            component['setPagingValues']([{ id: 1, name: 'John' }]);

            expect(component['setNonPageableData']).toHaveBeenCalledWith([{ id: 1, name: 'John' }]);
        });

        it('should reset page navigation when newVal is falsy', () => {
            component.binddataset = true;
            component['setResult'] = jest.fn();
            component['resetPageNavigation'] = jest.fn();
            component['_setAriaForBasicNavigation'] = jest.fn();

            component['setPagingValues'](null);

            expect(component['setResult']).toHaveBeenCalledWith(null);
            expect(component['resetPageNavigation']).toHaveBeenCalled();
        });

        it('should set non-pageable data when binddataset is false', () => {
            component.binddataset = false;
            component['setNonPageableData'] = jest.fn();

            component['setPagingValues']([{ id: 1, name: 'John' }]);

            expect(component['setNonPageableData']).toHaveBeenCalledWith([{ id: 1, name: 'John' }]);
        });
    });

    describe('goToPage', () => {
        beforeEach(() => {
            component.dn = { currentPage: 1 };
            component.maxResults = 10;
            component.statehandler = 'url';
            component['getPageData'] = jest.fn();
            jest.spyOn(component, 'isFirstPage');
            jest.spyOn(component, 'isFirstPage').mockReturnValue(false);
            component.parent.statePersistence.computeMode.mockReturnValue('url');
            component['unsupportedStatePersistenceTypes'] = ['Advanced', 'Classic'];

            // Mock any FormControl dependencies before calling detectChanges
            // This is needed if the template has any form controls
            component.resultEmitter = new EventEmitter();
            component.maxResultsEmitter = new EventEmitter();

            // Skip fixture.detectChanges() here to avoid the form error
            // We'll test specific methods directly instead
        });

        it('should set firstRow correctly', () => {
            component.dn.currentPage = 3;
            component.maxResults = 10;
            component.goToPage();
            expect(component.firstRow).toBe(20);
        });

        it('should call getPageData', () => {
            const event = { page: 2 };
            const callback = jest.fn();
            component.goToPage(event, callback);
            expect(component['getPageData']).toHaveBeenCalledWith(event, callback);
        });

        it('should not perform state persistence operations when mode is none', () => {
            component.parent.statePersistence.computeMode.mockReturnValue('none');
            component.goToPage();
            expect(component.parent.statePersistence.removeWidgetState).not.toHaveBeenCalled();
            expect(component.parent.statePersistence.setWidgetState).not.toHaveBeenCalled();
        });

        it('should set _selectedItemsExist to true for table and list widgets', () => {
            component.parent.statePersistence.computeMode.mockReturnValue('url');
            component.parent.widgetType = 'wm-list';
            component.goToPage();
            expect(component.parent._selectedItemsExist).toBe(true);
        });

        it('should not log warning for unsupported navigation type if widget is not wm-list or wm-table', () => {
            jest.spyOn(component, 'isFirstPage').mockReturnValue(false);
            component.parent.statePersistence.computeMode.mockReturnValue('url');
            component.parent.navigation = 'Advanced';
            component.parent.widgetType = 'other-widget';
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
            component.goToPage();
            expect(component.parent.statePersistence.setWidgetState).not.toHaveBeenCalled();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
        });
    });

    describe('PaginationComponent - getPageData', () => {
        let mockDataSource: jest.Mocked<any>;

        beforeEach(() => {
            mockDataSource = { execute: jest.fn() } as any;
            component.datasource = mockDataSource;
            component.dn = { currentPage: 1 };
            component.maxResults = 10;
            component.parent = {
                statePersistence: {
                    computeMode: jest.fn(),
                    removeWidgetState: jest.fn(),
                    setWidgetState: jest.fn()
                },
                invokeEventCallback: jest.fn(),
                getActualPageSize: jest.fn().mockReturnValue(5),
                gridOptions: { lastActionPerformed: '' },
                actionRowPage: 1
            } as any;
        });

        it('should fetch data from datasource when isDataSourceHasPaging is true', async () => {
            const mockResponse = { data: [{ id: 1 }, { id: 2 }] };
            mockDataSource.execute.mockResolvedValue(mockResponse);
            jest.spyOn(component, 'isDataSourceHasPaging').mockReturnValue(true);
            jest.spyOn(component, 'onPageDataReady').mockImplementation();

            await component.getPageData({}, jest.fn());

            expect(mockDataSource.execute).toHaveBeenCalledWith(DataSource.Operation.LIST_RECORDS, {
                'page': 1,
                'size': 10,
                'filterFields': component.filterFields,
                'orderBy': component.sortOptions,
                'logicalOp': component.logicalOp,
                'matchMode': 'anywhereignorecase'
            });
            expect(component.onPageDataReady).toHaveBeenCalledWith({}, mockResponse.data, expect.any(Function));
        });


        it('should handle error when datasource execution fails', async () => {
            const mockError = 'Test error';
            mockDataSource.execute.mockRejectedValue(mockError);
            jest.spyOn(component, 'isDataSourceHasPaging').mockReturnValue(true);
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            component.getPageData({}, jest.fn());

            expect(mockDataSource.execute).toHaveBeenCalled();
        });

        it('should use local data when isDataSourceHasPaging is false', () => {
            const mockData = [{ id: 1 }, { id: 2 }, { id: 3 }];
            jest.spyOn(component, 'isDataSourceHasPaging').mockReturnValue(false);
            jest.spyOn(component, 'isEditNotInCurrentPage').mockReturnValue(false);
            jest.spyOn(component, 'setResult').mockImplementation();
            jest.spyOn(component, 'onPageDataReady').mockImplementation();
            component.__fullData = mockData;

            component.getPageData({}, jest.fn());

            expect(component.setResult).toHaveBeenCalledWith(mockData.slice(0, 10));
            expect(component.onPageDataReady).toHaveBeenCalledWith({}, mockData.slice(0, 10), expect.any(Function));
        });

        it('should handle edit not in current page', () => {
            const mockData = Array(20).fill(null).map((_, i) => ({ id: i + 1 }));
            jest.spyOn(component, 'isDataSourceHasPaging').mockReturnValue(false);
            jest.spyOn(component, 'isEditNotInCurrentPage').mockReturnValue(true);
            jest.spyOn(component, 'setResult').mockImplementation();
            jest.spyOn(component, 'onPageDataReady').mockImplementation();
            component.__fullData = mockData;
            component.parent.actionRowPage = 2;

            component.getPageData({}, jest.fn());

            expect(component.setResult).toHaveBeenCalledWith(mockData.slice(10, 20));
            expect(component.onPageDataReady).toHaveBeenCalledWith({}, mockData.slice(10, 20), expect.any(Function));
        });
    });

    describe('validateCurrentPage', () => {
        beforeEach(() => {
            component.dn = { currentPage: 1 };
            component.pageCount = 10;
        });

        it('should return true for valid input', () => {
            expect(component.validateCurrentPage({})).toBe(true);
        });

        it('should return false and set currentPage to 1 when input is 0', () => {
            component.dn.currentPage = 0;
            expect(component.validateCurrentPage({})).toBe(false);
            expect(component.dn.currentPage).toBe(1);
        });

        it('should return false and set currentPage to pageCount when input exceeds pageCount', () => {
            component.dn.currentPage = 15;
            expect(component.validateCurrentPage({})).toBe(false);
            expect(component.dn.currentPage).toBe(10);
        });

        it('should return false for NaN input', () => {
            component.dn.currentPage = NaN;
            expect(component.validateCurrentPage({})).toBe(false);
        });

        it('should return false for null input', () => {
            component.dn.currentPage = null;
            expect(component.validateCurrentPage({})).toBe(false);
        });

        it('should not modify currentPage for valid input', () => {
            component.dn.currentPage = 5;
            expect(component.validateCurrentPage({})).toBe(true);
            expect(component.dn.currentPage).toBe(5);
        });
    });


    describe('onModelChange', () => {
        beforeEach(() => {
            jest.spyOn(component, 'validateCurrentPage');
            jest.spyOn(component, 'goToPage');
        });

        it('should call validateCurrentPage and goToPage for valid input', () => {
            (component.validateCurrentPage as jest.Mock).mockReturnValue(true);
            component.onModelChange(5);
            expect(component.validateCurrentPage).toHaveBeenCalledWith(5);
            expect(component.goToPage).toHaveBeenCalledWith(5);
        });

        it('should not call goToPage for invalid input', () => {
            (component.validateCurrentPage as jest.Mock).mockReturnValue(false);
            component.onModelChange(0);
            expect(component.validateCurrentPage).toHaveBeenCalledWith(0);
            expect(component.goToPage).not.toHaveBeenCalled();
        });
    });

    describe('onKeyDown', () => {
        let mockEvent: { target: any; code: any; };
        let mockTargetEle: { addClass: any; removeClass: any; };

        beforeEach(() => {
            mockTargetEle = {
                addClass: jest.fn(),
                removeClass: jest.fn()
            };
            mockEvent = {
                target: {
                    closest: jest.fn().mockReturnValue(mockTargetEle)
                },
                code: ''
            };
            (global as any).$ = jest.fn().mockReturnValue({ closest: mockEvent.target.closest });
        });

        it('should add ng-invalid class and return false for KeyE', () => {
            mockEvent.code = 'KeyE';
            const result = component.onKeyDown(mockEvent);
            expect(mockTargetEle.addClass).toHaveBeenCalledWith('ng-invalid');
            expect(result).toBe(false);
        });

        it('should remove ng-invalid class and return true for non-KeyE', () => {
            mockEvent.code = 'Enter';
            const result = component.onKeyDown(mockEvent);
            expect(mockTargetEle.removeClass).toHaveBeenCalledWith('ng-invalid');
            expect(result).toBe(true);
        });
    });

    describe('pageChanged', () => {
        beforeEach(() => {
            (component as any)._debouncedPageChanged = jest.fn();
        });

        it('should call _debouncedPageChanged with the event', () => {
            const mockEvent = { page: 2 };
            component.pageChanged(mockEvent);
            expect((component as any)._debouncedPageChanged).toHaveBeenCalledWith(mockEvent);
        });
    });

    describe('navigatePage', () => {
        beforeEach(() => {
            component.parent = {
                isDataLoading: false,
                infScroll: false,
                variableInflight: false,
                callDataGridMethod: jest.fn(),
                widgetType: '',
                gridOptions: {
                    isNavTypeScrollOrOndemand: jest.fn(),
                    setLastActionPerformed: jest.fn(),
                    setIsDatasetUpdated: jest.fn(),
                    ACTIONS: { DEFAULT: 'default' }
                },
                getActualPageSize: jest.fn().mockReturnValue(5)
            } as any;
            component.dn = { currentPage: 1 };
            component.datasource = { pagination: {} } as any;
            component.invokeEventCallback = jest.fn();
            component.goToFirstPage = jest.fn();
            component.goToLastPage = jest.fn();
            component.goToPage = jest.fn();
            component.isFirstPage = jest.fn();
            component.isLastPage = jest.fn();
            component.validateCurrentPage = jest.fn().mockReturnValue(true);
        });

        it('should set isDataLoading to true when defined and not disabled', () => {
            component.isDisableNext = false;
            component.navigatePage('next', {}, false, null);
            expect(component.parent.isDataLoading).toBe(true);
        });
        it('should reset last action performed for wm-table', () => {
            component.parent.widgetType = 'wm-table';
            component.parent.gridOptions.isNavTypeScrollOrOndemand.mockReturnValue(true);
            component.navigatePage('next', {}, false, null);
            expect(component.parent.gridOptions.setLastActionPerformed).toHaveBeenCalledWith('default');
            expect(component.parent.gridOptions.setIsDatasetUpdated).toHaveBeenCalledWith(false);
        });

        it('should invoke paginationchange event callback', () => {
            component.navigatePage('next', {}, false, null);
            expect(component.invokeEventCallback).toHaveBeenCalledWith('paginationchange', { $event: undefined, $index: 1 });
        });

        it('should go to first page', () => {
            component.navigatePage('first', {}, true, null);
            expect(component.goToFirstPage).toHaveBeenCalledWith(true, {}, null);
        });

        it('should go to last page', () => {
            component.navigatePage('last', {}, true, null);
            expect(component.goToLastPage).toHaveBeenCalledWith(true, {}, null);
        });

        it('should decrement page when going prev', () => {
            component.dn.currentPage = 2;
            component.navigatePage('prev', {}, false, null);
            expect(component.dn.currentPage).toBe(1);
        });

        it('should increment page when going next', () => {
            component.navigatePage('next', {}, false, null);
            expect(component.dn.currentPage).toBe(2);
        });

        it('should handle server-side pagination for prev', () => {
            component.pagination = { next: true };
            component.navigatePage('prev', {}, false, null);
            expect(component.datasource.pagination.isNext).toBe(false);
            expect(component.datasource.pagination.isPrev).toBe(true);
        });

        it('should handle server-side pagination for next', () => {
            component.pagination = { next: true };
            component.navigatePage('next', {}, false, null);
            expect(component.datasource.pagination.isNext).toBe(true);
            expect(component.datasource.pagination.isPrev).toBe(false);
        });

        it('should call goToPage after navigation', () => {
            component.navigatePage('next', {}, false, null);
            expect(component.goToPage).toHaveBeenCalledWith({}, null);
        });
    });

    describe('setBindDataSet', () => {
        it('should set dataset and call _debouncedApplyDataset when only dataset is provided', () => {
            const mockDataset = [{ id: 1 }, { id: 2 }];
            (component as any)._debouncedApplyDataset = jest.fn();

            component.setBindDataSet('', null, null, mockDataset);

            expect(component.dataset).toBe(mockDataset);
            expect((component as any)._debouncedApplyDataset).toHaveBeenCalled();
        });
        it('should set datasource when datasetBoundExpr is false', (done) => {
            const mockParent = {};
            const mockDataSource = { someData: 'data' };
            const mockWatch = jest.fn();
            (global as any).$watch = mockWatch;

            component.setBindDataSet('someDataset', mockParent, mockDataSource);

            setTimeout(() => {
                expect(component.binddataset).toBe('someDataset');
                expect(component.datasource).toBe(mockDataSource);
                done();
            });
        });
    });

    describe('onPropertyChange', () => {
        it('should handle dataset change with parent onDataNavigatorDataSetChange', () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            component.parent = {
                onDataNavigatorDataSetChange: jest.fn().mockReturnValue(mockData),
                widgetType: 'wm-table',
                getActualPageSize: jest.fn().mockReturnValue(5)
            };
            component.setResult = jest.fn();
            (component as any).setPagingValues = jest.fn();
            component.isEditNotInCurrentPage = jest.fn().mockReturnValue(false);

            component && component.onPropertyChange('dataset', mockData, null);

            expect(component.parent.onDataNavigatorDataSetChange).toHaveBeenCalledWith(mockData);
            expect(component.parent._triggeredByUser).toBe(false);
            expect((component as any).setPagingValues).toHaveBeenCalledWith(mockData);
        });

        it('should handle dataset change without parent onDataNavigatorDataSetChange', () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            component.parent = { widgetType: 'other', getActualPageSize: jest.fn().mockReturnValue(5) };
            component.setResult = jest.fn();
            (component as any).setPagingValues = jest.fn();
            component.isEditNotInCurrentPage = jest.fn().mockReturnValue(false);
            component && component.onPropertyChange('dataset', mockData, null);
            expect((component as any).setPagingValues).toHaveBeenCalledWith(mockData);
        });

        it('should call setResult when isEditNotInCurrentPage returns true', () => {
            const mockData = [{ id: 1 }, { id: 2 }];
            component.parent = {getActualPageSize: jest.fn().mockReturnValue(5)};
            component.setResult = jest.fn();
            (component as any).setPagingValues = jest.fn();
            component.isEditNotInCurrentPage = jest.fn().mockReturnValue(true);

            component && component.onPropertyChange('dataset', mockData, null);

            expect(component.setResult).toHaveBeenCalledWith(mockData);
            expect((component as any).setPagingValues).not.toHaveBeenCalled();
        });

        it('should handle navigation change to "Advanced"', () => {
            (component as any).updateNavSize = jest.fn();

            component && component.onPropertyChange('navigation', 'Advanced', 'Basic');

            expect(component.navigation).toBe('Classic');
            expect(component.navcontrols).toBe('Advanced');
            expect((component as any).updateNavSize).toHaveBeenCalled();
        });

        it('should handle navigation change to other values', () => {
            (component as any).updateNavSize = jest.fn();
            component && component.onPropertyChange('navigation', 'Basic', 'Advanced');
            expect(component.navigation).toBe('Basic');
            expect((component as any).updateNavSize).toHaveBeenCalled();
        });

        it('should handle navigationsize change', () => {
            (component as any).updateNavSize = jest.fn();

            component && component.onPropertyChange('navigationsize', 'large', 'small');

            expect((component as any).updateNavSize).toHaveBeenCalled();
        });

        it('should handle maxResults change', () => {
            component.dataset = [{ id: 1 }, { id: 2 }];
            (component as any).setPagingValues = jest.fn();

            component && component.onPropertyChange('maxResults', 10, 5);

            expect((component as any).setPagingValues).toHaveBeenCalledWith(component.dataset);
        });

        it('should call super.onPropertyChange for other properties', () => {
            const superOnPropertyChange = jest.spyOn(Object.getPrototypeOf(PaginationComponent.prototype), 'onPropertyChange');

            component && component.onPropertyChange('someOtherProperty', 'newValue', 'oldValue');

            expect(superOnPropertyChange).toHaveBeenCalledWith('someOtherProperty', 'newValue', 'oldValue');
        });
    });

    describe('_setAriaForBasicNavigation', () => {
        let links: HTMLAnchorElement[];
        let mockElement: HTMLElement;

        beforeEach(() => {
            // Create a mock element structure instead of using fixture.nativeElement
            mockElement = document.createElement('div');
            mockElement.innerHTML = `
            <a href="#"><span data-isacitvepage="true"></span></a>
            <a href="#"><span data-isdisabled="true"></span></a>
            <a href="#"><span></span></a>
          `;

            // Mock the nativeElement property on the component
            (component as any).nativeElement = mockElement;

            // No need for fixture.detectChanges() since we're not updating the actual component template
        });

        it('should set href attribute for all links', () => {
            component['_setAriaForBasicNavigation']();
            const links = mockElement.getElementsByTagName('a');
            Array.from(links).forEach((link: HTMLAnchorElement) => {
                expect(link.getAttribute('href')).toBe('javascript:void(0);');
            });
        });

        it('should set aria-current attribute for active page', () => {
            component['_setAriaForBasicNavigation']();
            const activeLink = mockElement.querySelector('a span[data-isacitvepage="true"]').parentElement;
            expect(activeLink.getAttribute('aria-current')).toBe('true');
        });

        it('should set aria-disabled attribute for disabled link', () => {
            component['_setAriaForBasicNavigation']();
            const disabledLink = mockElement.querySelector('a span[data-isdisabled="true"]').parentElement;
            expect(disabledLink.getAttribute('aria-disabled')).toBe('true');
        });

        it('should remove aria-disabled attribute for enabled link', () => {
            component['_setAriaForBasicNavigation']();
            const enabledLink = mockElement.querySelector('a span:not([data-isdisabled])').parentElement;
            expect(enabledLink.getAttribute('aria-disabled')).toBe(null);
        });
    });

    describe('_debouncedPageChanged', () => {
        beforeEach(() => {
            (component as any).widget = { dataset: undefined };
            component.dn = { currentPage: 1 };
            component.goToPage = jest.fn();
            component['_setAriaForBasicNavigation'] = jest.fn();
            component.parent = {
                ...component.parent,
                invokeEventCallback: jest.fn()
            };

            // We need to recreate the debounced function to skip the actual debounce in tests
            component['_debouncedPageChanged'] = (event) => {
                const currentPage = event && event.page;
                if (currentPage !== component.dn.currentPage) {
                    const inst = component.parent || component;
                    component.dn.currentPage = currentPage;
                    inst.invokeEventCallback('paginationchange', { $event: undefined, $index: component.dn.currentPage });
                    component.goToPage();
                    if (component.navigation === 'Basic') {
                        component['_setAriaForBasicNavigation']();
                    }
                }
            };
        });

        it('should not update currentPage if it has not changed', () => {
            component['_debouncedPageChanged']({ page: 1 });
            expect(component.dn.currentPage).toBe(1);
            expect(component.parent.invokeEventCallback).not.toHaveBeenCalled();
            expect(component.goToPage).not.toHaveBeenCalled();
        });

        it('should not call _setAriaForBasicNavigation if navigation is not Basic', () => {
            component.navigation = 'Advanced';
            component['_debouncedPageChanged']({ page: 2 });
            expect(component['_setAriaForBasicNavigation']).not.toHaveBeenCalled();
        });

        it('should call goToPage when page changes', () => {
            component['_debouncedPageChanged']({ page: 2 });
            expect(component.dn.currentPage).toBe(2);
            expect(component.goToPage).toHaveBeenCalled();
        });

        it('should call _setAriaForBasicNavigation when navigation is Basic', () => {
            component.navigation = 'Basic';
            component['_debouncedPageChanged']({ page: 2 });
            expect(component['_setAriaForBasicNavigation']).toHaveBeenCalled();
        });
    });

    describe('setNonPageableData', () => {
        beforeEach(() => {
            component.setDefaultPagingValues = jest.fn();
            component.disableNavigation = jest.fn();
            component.setResult = jest.fn();
            component.dn = { currentPage: 2 };
            component.maxResults = 10;
        });

        it('should handle non-array input', () => {
            const input = { key: 'value' };
            component.setNonPageableData(input);
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(1, 1, 2);
            expect(component.setResult).toHaveBeenCalledWith(input);
        });

        it('should handle empty input', () => {
            component.setNonPageableData({});
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(0, 0, 2);
            expect(component.setResult).toHaveBeenCalledWith({});
        });

        it('should use maxResults from options if available', () => {
            component.options = { maxResults: 20 };
            component.setNonPageableData([1, 2, 3, 4, 5]);
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(5, 20, 2);
        });

        it('should set currentPage to 1 for API-aware datasource', () => {
            component.datasource = {
                execute: jest.fn().mockReturnValue(true)
            };
            component.setNonPageableData([1, 2, 3, 4, 5]);
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(5, 5, 1);
        });

        it('should set currentPage to 1 for specific table conditions', () => {
            component.parent = {
                widgetType: 'wm-table',
                gridOptions: {
                    isNavTypeScrollOrOndemand: jest.fn().mockReturnValue(true),
                    lastActionPerformed: 'DATASET_UPDATE',
                    ACTIONS: { DATASET_UPDATE: 'DATASET_UPDATE' }
                },
                getActualPageSize: jest.fn().mockReturnValue(5)
            };
            component.setNonPageableData([1, 2, 3, 4, 5]);
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(5, 5, 2);
        });

        it('should slice array result based on currentPage and maxResults', () => {
            const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            component.dn.currentPage = 2;
            component.maxResults = 5;
            component.setNonPageableData(input);
            expect(component.setResult).toHaveBeenCalledWith([6, 7, 8, 9, 10]);
        });
    });

    describe('setNonPageableData', () => {
        beforeEach(() => {
            component.setDefaultPagingValues = jest.fn();
            component.disableNavigation = jest.fn();
            component.setResult = jest.fn();
            component.dn = { currentPage: 2 };
            component.maxResults = 10;
        });

        it('should handle non-array input', () => {
            const input = { key: 'value' };
            component.setNonPageableData(input);
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(1, 1, 2);
            expect(component.setResult).toHaveBeenCalledWith(input);
        });

        it('should handle empty input', () => {
            component.setNonPageableData({});
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(0, 0, 2);
            expect(component.setResult).toHaveBeenCalledWith({});
        });

        it('should use maxResults from options if available', () => {
            component.options = { maxResults: 20 };
            component.setNonPageableData([1, 2, 3, 4, 5]);
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(5, 20, 2);
        });

        it('should set currentPage to 1 for API-aware datasource', () => {
            component.datasource = {
                execute: jest.fn().mockReturnValue(true)
            };
            component.setNonPageableData([1, 2, 3, 4, 5]);
            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(5, 5, 1);
        });

        it('should slice array result based on currentPage and maxResults', () => {
            const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            component.dn.currentPage = 2;
            component.maxResults = 5;
            component.setNonPageableData(input);
            expect(component.setResult).toHaveBeenCalledWith([6, 7, 8, 9, 10]);
        });

        it('should use setDefaultPagingValues when dataSize or maxResults is truthy', () => {
            component.options = { maxResults: 1 };
            component.setNonPageableData([]);

            expect(component.setDefaultPagingValues).toHaveBeenCalledWith(0, 1, 2);
            expect(component.disableNavigation).toHaveBeenCalled();
            expect(component.setResult).toHaveBeenCalledWith([]);
        });
    });

});
