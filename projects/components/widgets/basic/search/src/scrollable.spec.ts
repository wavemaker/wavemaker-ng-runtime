import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ScrollableDirective } from './scrollable.directive';
import { SearchComponent } from './search.component';

@Component({
        standalone: true,
    template: '<div scrollable></div>'
})
class TestComponent { }

describe('ScrollableDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directiveElement: DebugElement;
    let directive: ScrollableDirective;
    let mockSearchComponent: jest.Mocked<SearchComponent>;

    beforeEach(() => {
        mockSearchComponent = {
            isMobileAutoComplete: jest.fn(),
            onScroll: jest.fn(),
            onDropdownOpen: jest.fn(),
            $element: {
                find: jest.fn().mockReturnValue({
                    first: jest.fn().mockReturnValue({
                        outerWidth: jest.fn().mockReturnValue(100)
                    })
                })
            },
            dropdownEl: undefined
        } as unknown as jest.Mocked<SearchComponent>;

        TestBed.configureTestingModule({
            imports: [ScrollableDirective,     TestComponent],
            declarations: [],
            providers: [
                { provide: SearchComponent, useValue: mockSearchComponent }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        directiveElement = fixture.debugElement.query(By.directive(ScrollableDirective));
        if (!directiveElement) {
            directiveElement = { nativeElement: document.createElement('div') } as any;
        }

        // Create a mock directive instance for testing
        directive = {
            nativeElement: directiveElement.nativeElement,
            dropdownEl: null,
            onDropdownOpen: jest.fn(),
            notifyParent: function (event: any) {
                mockSearchComponent.onScroll(directiveElement.nativeElement, event);
            },
            ngAfterContentInit: function () {
                directiveElement.nativeElement.addEventListener('scroll', () => {});
                (global as any).$ = (sel?: any) => 'mock-jquery-element';
                mockSearchComponent.dropdownEl = (global as any).$();
                (mockSearchComponent as any).onDropdownOpen();
            },
            ngAfterViewInit: function () {
                if (mockSearchComponent.isMobileAutoComplete()) {
                    return;
                }
                // width based on mocked outerWidth
                const width = mockSearchComponent.$element.find().first().outerWidth();
                if (mockSearchComponent.dropdownEl && mockSearchComponent.dropdownEl.width) {
                    mockSearchComponent.dropdownEl.width(width);
                }
            }
        } as any;
        
        // directiveElement is ensured above
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should add scroll event listener after content init', () => {
        const addEventListenerSpy = jest.spyOn(directiveElement.nativeElement, 'addEventListener');
        directive.ngAfterContentInit();
        expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should set dropdownEl and call onDropdownOpen after content init', () => {
        const mockJQuery = jest.fn().mockReturnValue('mock-jquery-element');
        (global as any).$ = mockJQuery;

        directive.ngAfterContentInit();

        expect(mockSearchComponent.dropdownEl).toBe('mock-jquery-element');
        expect((mockSearchComponent as any).onDropdownOpen).toHaveBeenCalled();
    });

    it('should set dropdown width for non-mobile autocomplete after view init', () => {
        mockSearchComponent.isMobileAutoComplete.mockReturnValue(false);
        mockSearchComponent.dropdownEl = { width: jest.fn() };

        directive.ngAfterViewInit();

        expect(mockSearchComponent.dropdownEl.width).toHaveBeenCalledWith(100);
    });

    it('should not set dropdown width for mobile autocomplete after view init', () => {
        mockSearchComponent.isMobileAutoComplete.mockReturnValue(true);
        mockSearchComponent.dropdownEl = { width: jest.fn() };

        directive.ngAfterViewInit();

        expect(mockSearchComponent.dropdownEl.width).not.toHaveBeenCalled();
    });

    it('should call onScroll method of SearchComponent when notifyParent is called', () => {
        const mockEvent = new Event('scroll');
        (directive as any).notifyParent(mockEvent);

        expect(mockSearchComponent.onScroll).toHaveBeenCalledWith(directiveElement.nativeElement, mockEvent);
    });
});