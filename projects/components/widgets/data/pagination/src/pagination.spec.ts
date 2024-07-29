import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { App, AppConstants } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { WidgetRef } from '@wm/components/base';
import { NO_ERRORS_SCHEMA } from '@angular/compiler';
describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PaginationComponent],
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
        // Mock parent and its methods
        component.parent = {
            statePersistence: {
                computeMode: jest.fn(),
                removeWidgetState: jest.fn(),
                setWidgetState: jest.fn()
            },
            invokeEventCallback: jest.fn()
        } as any;
        fixture.detectChanges();
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
});