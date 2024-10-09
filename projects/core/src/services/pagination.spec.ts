import { TestBed } from '@angular/core/testing';
import { PaginationService } from './pagination.service';
import { debounce } from 'lodash-es';

jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    debounce: jest.fn(),
}));
// data-navigator.mock.ts
export class DataNavigator {
    dn = {
        currentPage: 1
    };
    pageCount = 1;
    dataSize = 0;

    isFirstPage(): boolean {
        return this.dn.currentPage === 1;
    }

    navigatePage(direction: string): void {
        if (direction === 'next') {
            this.dn.currentPage++;
        }
    }
}

// grid-options.mock.ts
export class GridOptions {
    public deletedRowIndex = -1;
    public ACTIONS = {
        SEARCH_OR_SORT: 'SEARCH_OR_SORT',
        FILTER_CRITERIA: 'FILTER_CRITERIA',
        DATASET_UPDATE: 'DATASET_UPDATE',
        DELETE: 'DELETE',
        EDIT: 'EDIT'
    };
    public lastActionPerformed = '';
    public showviewlessbutton = false;
    public mode = '';

    isNavTypeScrollOrOndemand(): boolean {
        return true;
    }

    setDeletedRowIndex(index: number): void {
        this.deletedRowIndex = index;
    }

    setCurrentPage(): void {
        // Implementation not needed for our tests
    }

    getCurrentPage(): number {
        return 1;
    }

    setIsNextPageData(value: boolean): void {
    }

    setIsDataUpdatedByUser(value: boolean): void {
    }
}


describe('PaginationService', () => {
    let service: PaginationService;
    let dataNavigatorMock: DataNavigator;
    let gridOptionsMock: GridOptions;
    let parentMock: any;
    let $elementMock: any;
    let $rootElMock: any;
    let $firstChildMock: any;
    let $scrollParentMock: any;
    let debounceNum: number;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PaginationService]
        });
        service = TestBed.inject(PaginationService);
        dataNavigatorMock = {
            isFirstPage: jest.fn(),
            pageCount: 2,
            navigatePage: jest.fn(),
            dn: { currentPage: 1 },
            dataSize: 50
        } as any;
        $scrollParentMock = {
            0: { scrollHeight: 1000, clientHeight: 500 },
            each: jest.fn().mockReturnThis(),
            off: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
        };
        $firstChildMock = {
            length: 1,
            scrollParent: jest.fn().mockReturnValue($scrollParentMock)
        };

        $rootElMock = {
            children: jest.fn().mockReturnValue({
                first: jest.fn().mockReturnValue($firstChildMock),  // Ensure .first() returns $firstChildMock
            }),
            off: jest.fn().mockReturnThis(),
            on: jest.fn().mockReturnThis(),
        };

        $elementMock = {
            find: jest.fn().mockReturnValue($rootElMock)
        };
        gridOptionsMock = {
            isNavTypeScrollOrOndemand: jest.fn().mockReturnValue(true),
            setDeletedRowIndex: jest.fn(),
            setCurrentPage: jest.fn(),
            deletedRowIndex: -1,
            lastActionPerformed: '',
            ACTIONS: {
                SEARCH_OR_SORT: 'SEARCH_OR_SORT',
                FILTER_CRITERIA: 'FILTER_CRITERIA',
                DATASET_UPDATE: 'DATASET_UPDATE',
                DELETE: 'DELETE',
                EDIT: 'EDIT'
            },
            showviewlessbutton: false,
            mode: '',
            setIsNextPageData: jest.fn(),
            setIsDataUpdatedByUser: jest.fn(),
        } as any;

        parentMock = {
            $element: $elementMock,
            widgetType: 'wm-table',
            gridData: [],
            fieldDefs: [],
            gridOptions: gridOptionsMock,
            currentPage: 1,
            dataNavigator: dataNavigatorMock,
            pagesize: 10,
            variableInflight: false,
        } as any;
        debounceNum = 300;
        (debounce as jest.Mock).mockImplementation((fn) => fn);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('updateFieldsOnPagination', () => {
        it('should return fieldDefs and current page when no rows are deleted', () => {
            (gridOptionsMock as any).isNavTypeScrollOrOndemand.mockReturnValue(true);
            parentMock.currentPage = 1;  // Ensure the current page starts at 1
            dataNavigatorMock.dn.currentPage = 1;  // Ensure dataNavigator is also on the first page
            gridOptionsMock.deletedRowIndex = -1;

            const newVal = [{ id: 1, name: 'NewRow' }];
            const result = service.updateFieldsOnPagination(parentMock, newVal);

            expect(result[0]).toEqual(newVal);
            expect(result[1]).toBe(2);
        });

        it('should handle deleted row in wm-table', () => {
            (gridOptionsMock as any).isNavTypeScrollOrOndemand.mockReturnValue(true);
            gridOptionsMock.deletedRowIndex = 1;
            parentMock.gridData = [{ id: 1 }, { id: 2 }, { id: 3 }];

            service.updateFieldsOnPagination(parentMock, []);

            expect(parentMock.gridData.length).toBe(2);
            expect(gridOptionsMock.setDeletedRowIndex).toHaveBeenCalledWith(-1);
        });

        it('should reset fieldDefs if last action was SEARCH_OR_SORT', () => {
            (gridOptionsMock as any).isNavTypeScrollOrOndemand.mockReturnValue(true);
            gridOptionsMock.lastActionPerformed = gridOptionsMock.ACTIONS.SEARCH_OR_SORT;

            const result = service.updateFieldsOnPagination(parentMock, []);

            expect(result[0]).toEqual([]);
            expect(gridOptionsMock.setCurrentPage).toHaveBeenCalledWith(1);
        });

        it('should handle pagination when fieldDefs are undefined', () => {
            parentMock.widgetType = 'wm-list';
            parentMock.fieldDefs = undefined;
            (dataNavigatorMock as any).isFirstPage.mockReturnValue(true);  // Use dataNavigatorMock for isFirstPage

            const newVal = [{ id: 1 }];
            const result = service.updateFieldsOnPagination(parentMock, newVal);

            expect(result[1]).toBe(1);
        });

        it('should push new values to fieldDefs when on next page', () => {
            parentMock.widgetType = 'wm-table';
            parentMock.gridData = [{ id: 1 }];
            (gridOptionsMock as any).isNavTypeScrollOrOndemand.mockReturnValue(true);
            dataNavigatorMock.dn.currentPage = 2;
            parentMock.pagesize = 1;

            const newVal = [{ id: 2 }];
            const result = service.updateFieldsOnPagination(parentMock, newVal);

            expect(result[0]).toEqual([{ id: 1 }, { id: 2 }]);
            expect(result[1]).toBe(2);
        });

        it('should append unique records when action is DELETE', () => {
            gridOptionsMock.lastActionPerformed = gridOptionsMock.ACTIONS.DELETE;
            parentMock.gridData = [{ id: 1 }];
            const newVal = [{ id: 1 }, { id: 2 }];
            const getUniqueRecordsInFieldDefSpy = jest.spyOn(service, 'getUniqueRecordsInFieldDef').mockReturnValue([{ id: 1 }, { id: 2 }]);

            const result = service.updateFieldsOnPagination(parentMock, newVal);

            expect(getUniqueRecordsInFieldDefSpy).toHaveBeenCalledWith([{ id: 1 }], [{ id: 1 }, { id: 2 }]);
            expect(result[0]).toEqual([{ id: 1 }, { id: 2 }]);
        });
    });

    describe('getUniqueRecordsInFieldDef', () => {
        it('should return unique records', () => {
            const fieldDefs = [{ id: 1, name: 'Test1' }];
            const newVal = [{ id: 1, name: 'Test1' }, { id: 2, name: 'Test2' }];

            const result = service.getUniqueRecordsInFieldDef(fieldDefs, newVal);

            expect(result).toEqual([
                { id: 1, name: 'Test1' },
                { id: 2, name: 'Test2' }
            ]);
        });

        it('should return newVal when fieldDefs is empty', () => {
            const fieldDefs = [];
            const newVal = [{ id: 1, name: 'Test1' }, { id: 2, name: 'Test2' }];

            const result = service.getUniqueRecordsInFieldDef(fieldDefs, newVal);

            expect(result).toEqual(newVal);
        });
    });

    describe('setIscrollHandlers', () => {
        let elMock: any;
        let dataNavigatorMock: any;
        let debounceNum: number;

        beforeEach(() => {
            elMock = {
                iscroll: {
                    on: jest.fn(),
                    y: 0,
                    wrapper: {
                        clientHeight: 100,
                        scrollHeight: 1000
                    },
                    indicatorRefresh: jest.fn()
                }
            };
            dataNavigatorMock = {};
            debounceNum = 300;

            // Mock the debouncedFetchNextDatasetOnScroll method
            service.debouncedFetchNextDatasetOnScroll = jest.fn().mockReturnValue(jest.fn());
        });

        it('should register scrollEnd event on iscroll', () => {
            service.setIscrollHandlers(elMock, dataNavigatorMock, debounceNum);
            expect(elMock.iscroll.on).toHaveBeenCalledWith('scrollEnd', expect.any(Function));
        });

        it('should not call debouncedFetchNextDatasetOnScroll when scrolled less than 90% of total height', () => {
            service.setIscrollHandlers(elMock, dataNavigatorMock, debounceNum);
            const scrollEndCallback = elMock.iscroll.on.mock.calls[0][1];
            elMock.iscroll.y = -500; // Simulate scrolling to 50% of total height
            scrollEndCallback();
            expect(service.debouncedFetchNextDatasetOnScroll).not.toHaveBeenCalled();
        });

        it('should call indicatorRefresh if available', () => {
            service.setIscrollHandlers(elMock, dataNavigatorMock, debounceNum);
            const scrollEndCallback = elMock.iscroll.on.mock.calls[0][1];
            elMock.iscroll.y = -950; // Simulate scrolling to 95% of total height
            scrollEndCallback();
            expect(elMock.iscroll.indicatorRefresh).toHaveBeenCalled();
        });

        it('should not throw error if indicatorRefresh is not available', () => {
            elMock.iscroll.indicatorRefresh = undefined;
            expect(() => {
                service.setIscrollHandlers(elMock, dataNavigatorMock, debounceNum);
                const scrollEndCallback = elMock.iscroll.on.mock.calls[0][1];
                elMock.iscroll.y = -950; // Simulate scrolling to 95% of total height
                scrollEndCallback();
            }).not.toThrow();
        });
    });

    describe('debouncedFetchNextDatasetOnScroll', () => {
        it('should return a debounced function', () => {
            const parent = {};
            const result = service.debouncedFetchNextDatasetOnScroll(dataNavigatorMock, 300, parent);
            expect(typeof result).toBe('function');
        });

        it('should return a debounced function and call fetchNextDatasetOnScroll', () => {
            // Spy on fetchNextDatasetOnScroll to ensure it is called
            const fetchNextDatasetOnScrollSpy = jest.spyOn(service, 'fetchNextDatasetOnScroll');

            // Call debouncedFetchNextDatasetOnScroll
            const debounceNum = 300;
            const debouncedFunction = service.debouncedFetchNextDatasetOnScroll(dataNavigatorMock, debounceNum, parentMock);

            // Call the returned debounced function
            debouncedFunction();

            // Verify that fetchNextDatasetOnScroll is called with the correct arguments
            expect(fetchNextDatasetOnScrollSpy).toHaveBeenCalledWith(dataNavigatorMock, parentMock);
        });

        it('should return a function', () => {
            const debounceNum = 300;

            // Ensure the returned value is a function
            const debouncedFunction = service.debouncedFetchNextDatasetOnScroll(dataNavigatorMock, debounceNum, parentMock);
            expect(typeof debouncedFunction).toBe('function');
        });
    });

    describe('bindIScrollEvt', () => {
        let parentMock: any;
        let $elementMock: any;
        let $scrollParentMock: any;
        let appMock: any;
        let debounceNum: number;

        beforeEach(() => {
            $scrollParentMock = {
                0: {},
                closest: jest.fn().mockReturnThis()
            };
            $elementMock = {
                closest: jest.fn().mockReturnValue($scrollParentMock)
            };
            appMock = {
                subscribe: jest.fn(),
                notify: jest.fn()
            };
            parentMock = {
                $element: $elementMock,
                dataNavigator: {},
                app: appMock
            };
            debounceNum = 300;
            // Mock the setIscrollHandlers method
            service.setIscrollHandlers = jest.fn();
        });

        it('should call setIscrollHandlers when iScroll is initialized', () => {
            $scrollParentMock[0].iscroll = {};
            service.bindIScrollEvt(parentMock, debounceNum);
            expect(service.setIscrollHandlers).toHaveBeenCalledWith($scrollParentMock[0], parentMock.dataNavigator, debounceNum);
        });

        it('should subscribe to iscroll-update and notify no-iscroll when iScroll is not initialized', () => {
            const subscriptionMock = jest.fn();
            appMock.subscribe.mockReturnValue(subscriptionMock);
            service.bindIScrollEvt(parentMock, debounceNum);
            expect(appMock.subscribe).toHaveBeenCalledWith('iscroll-update', expect.any(Function));
            expect(appMock.notify).toHaveBeenCalledWith('no-iscroll', $scrollParentMock[0]);
        });

        it('should not call setIscrollHandlers when iscroll-update is triggered with non-matching element', () => {
            const subscriptionMock = jest.fn();
            appMock.subscribe.mockReturnValue(subscriptionMock);
            service.bindIScrollEvt(parentMock, debounceNum);
            const updateCallback = appMock.subscribe.mock.calls[0][1];
            updateCallback({ isSameNode: () => false });
            expect(service.setIscrollHandlers).not.toHaveBeenCalled();
            expect(subscriptionMock).not.toHaveBeenCalled();
        });
    });

    describe('bindScrollEvt', () => {
        it('should not bind scroll events if there is no first child', () => {
            // Simulate no first child element by setting the length to 0
            $firstChildMock.length = 0;

            service.bindScrollEvt(parentMock, 'tbody', debounceNum);

            // Ensure scrollParent is not called because there is no first child
            expect($firstChildMock.scrollParent).not.toHaveBeenCalled();
        });

        it('should bind scroll event to scrollable parent', () => {
            $scrollParentMock[0].scrollHeight = 1000;
            $scrollParentMock[0].clientHeight = 500;  // Simulate a scrollable condition

            service.bindScrollEvt(parentMock, 'tbody', debounceNum);

            expect($scrollParentMock.on).toHaveBeenCalledWith('scroll.scroll_evt', expect.any(Function));
        });

        it('should bind wheel event if there is no scrollable element', () => {
            // Simulate no scrollable element
            $scrollParentMock[0].scrollHeight = 500;
            $scrollParentMock[0].clientHeight = 500;  // No scrolling

            service.bindScrollEvt(parentMock, 'tbody', debounceNum);

            expect($rootElMock.on).toHaveBeenCalledWith('wheel.scroll_evt', expect.any(Function));
        });

        it('should stop event propagation for wm-table when scrolling', () => {
            service.bindScrollEvt(parentMock, 'tbody', debounceNum);

            // Simulate scroll event for wm-table
            const scrollCallback = $scrollParentMock.on.mock.calls[0][1];
            const eventMock = {
                target: $scrollParentMock[0],
                stopPropagation: jest.fn(), // Mock stopPropagation function
            };
            scrollCallback(eventMock);

            expect(eventMock.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('fetchNextDatasetOnScroll', () => {
        it('should call navigatePage on dataNavigator when variableInflight is false', () => {
            service.fetchNextDatasetOnScroll(dataNavigatorMock, parentMock);

            expect(dataNavigatorMock.navigatePage).toHaveBeenCalledWith('next');
        });

        it('should not call navigatePage on dataNavigator when variableInflight is true', () => {
            parentMock.variableInflight = true;  // Set inflight to true

            service.fetchNextDatasetOnScroll(dataNavigatorMock, parentMock);

            expect(dataNavigatorMock.navigatePage).not.toHaveBeenCalled();
        });

        it('should set isNextPageData and isDataUpdatedByUser when widgetType is wm-table', () => {
            service.fetchNextDatasetOnScroll(dataNavigatorMock, parentMock);

            expect(parentMock.gridOptions.setIsNextPageData).toHaveBeenCalledWith(true);
            expect(parentMock.gridOptions.setIsDataUpdatedByUser).toHaveBeenCalledWith(false);
        });

        it('should not call gridOptions setters when widgetType is not wm-table', () => {
            parentMock.widgetType = 'wm-list';  // Set to a non-table widget

            service.fetchNextDatasetOnScroll(dataNavigatorMock, parentMock);

            expect(parentMock.gridOptions.setIsNextPageData).not.toHaveBeenCalled();
            expect(parentMock.gridOptions.setIsDataUpdatedByUser).not.toHaveBeenCalled();
        });
    });

});