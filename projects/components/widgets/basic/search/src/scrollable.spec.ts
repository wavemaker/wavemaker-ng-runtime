import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ScrollableDirective } from './scrollable.directive';
import { SearchComponent } from './search.component';

@Component({
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
            imports: [ScrollableDirective],
            declarations: [TestComponent],
            providers: [
                { provide: SearchComponent, useValue: mockSearchComponent }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        directiveElement = fixture.debugElement.query(By.directive(ScrollableDirective));
        directive = directiveElement.injector.get(ScrollableDirective);
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