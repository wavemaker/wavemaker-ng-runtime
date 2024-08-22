import { TestBed } from '@angular/core/testing';
import { PaginationService } from './pagination.service';

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
    private isNextPageData = false;
    private isDataUpdatedByUser = true;
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

    setCurrentPage(page: number): void {
        // Implementation not needed for our tests
    }

    getCurrentPage(): number {
        return 1;
    }

    setIsNextPageData(value: boolean): void {
        this.isNextPageData = value;
    }

    setIsDataUpdatedByUser(value: boolean): void {
        this.isDataUpdatedByUser = value;
    }
}


describe('PaginationService', () => {
    let service: PaginationService;
    let dataNavigatorMock: DataNavigator;
    let gridOptionsMock: GridOptions;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [PaginationService]
        });
        service = TestBed.inject(PaginationService);
        dataNavigatorMock = new DataNavigator();
        gridOptionsMock = new GridOptions();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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

    describe('debouncedFetchNextDatasetOnScroll', () => {
        it('should return a debounced function', () => {
            const result = service.debouncedFetchNextDatasetOnScroll(dataNavigatorMock, 300, {});
            expect(typeof result).toBe('function');
        });
    });

    describe('fetchNextDatasetOnScroll', () => {
        it('should call navigatePage on dataNavigator when not in flight', () => {
            const parent = {
                variableInflight: false,
                widgetType: 'wm-table',
                gridOptions: gridOptionsMock
            };
            jest.spyOn(dataNavigatorMock, 'navigatePage');
            jest.spyOn(gridOptionsMock, 'setIsNextPageData');
            jest.spyOn(gridOptionsMock, 'setIsDataUpdatedByUser');

            service.fetchNextDatasetOnScroll(dataNavigatorMock, parent);

            expect(dataNavigatorMock.navigatePage).toHaveBeenCalledWith('next');
            expect(gridOptionsMock.setIsNextPageData).toHaveBeenCalledWith(true);
            expect(gridOptionsMock.setIsDataUpdatedByUser).toHaveBeenCalledWith(false);
        });

        it('should not call navigatePage when in flight', () => {
            const parent = {
                variableInflight: true,
                widgetType: 'wm-table',
                gridOptions: gridOptionsMock
            };
            jest.spyOn(dataNavigatorMock, 'navigatePage');

            service.fetchNextDatasetOnScroll(dataNavigatorMock, parent);

            expect(dataNavigatorMock.navigatePage).not.toHaveBeenCalled();
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

        it('should call fetchNextDatasetOnScroll with correct parameters', (done) => {
            const parent = {};
            const fetchNextDatasetOnScrollSpy = jest.spyOn(service, 'fetchNextDatasetOnScroll');
            const debouncedFn = service.debouncedFetchNextDatasetOnScroll(dataNavigatorMock, 50, parent);
            debouncedFn();
            setTimeout(() => {
                expect(fetchNextDatasetOnScrollSpy).toHaveBeenCalledWith(dataNavigatorMock, parent);
                done();
            }, 100);
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
        let parentMock;
        let $elementMock;
        let $rootElMock;
        let $firstChildMock;
        let $scrollParentMock;

        beforeEach(() => {
            $scrollParentMock = {
                0: document,
                each: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis()
            };

            $firstChildMock = {
                length: 1,
                scrollParent: jest.fn().mockReturnValue($scrollParentMock)
            };

            $rootElMock = {
                children: jest.fn().mockReturnValue({
                    first: jest.fn().mockReturnValue($firstChildMock)
                }),
                on: jest.fn().mockReturnThis(),
                off: jest.fn().mockReturnThis()
            };

            $elementMock = {
                find: jest.fn().mockReturnValue($rootElMock)
            };

            parentMock = {
                dataNavigator: dataNavigatorMock,
                $element: $elementMock,
                widgetType: 'wm-table',
                gridOptions: {
                    isNavTypeScrollOrOndemand: jest.fn().mockReturnValue(true)
                }
            };

            // Mock jQuery
            (global as any).$ = jest.fn().mockReturnValue({
                scrollTop: jest.fn()
            });
        });

        it('should not bind events if there is no first child', () => {
            $firstChildMock.length = 0;
            service.bindScrollEvt(parentMock, 'tbody', 300);
            expect($firstChildMock.scrollParent).not.toHaveBeenCalled();
        });
        it('should bind wheel event if there is no scrollable element', () => {
            $scrollParentMock[0] = { scrollHeight: 100, clientHeight: 100 };
            service.bindScrollEvt(parentMock, 'tbody', 300);
            expect($rootElMock.on).toHaveBeenCalledWith('wheel.scroll_evt', expect.any(Function));
        });
    });
});