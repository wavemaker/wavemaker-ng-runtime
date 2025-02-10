import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NavItemDirective } from './nav-item.directive';
import { AnchorComponent } from '@wm/components/basic';
import { App, removeClass } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

const markup = `<ul>
    <li wmNavItem>
      <a wmAnchor>Link 1</a>
    </li>
    <li wmNavItem>
      <a wmAnchor>Link 2</a>
    </li>
  </ul>`

@Component({
    template: markup
})
class TestComponent { }

describe('NavItemDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let navItemElements: DebugElement[];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AnchorComponent],
            declarations: [TestComponent, NavItemDirective],
            providers: [
                { provide: 'EXPLICIT_CONTEXT', useValue: null },
                { provide: App, useValue: mockApp }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        navItemElements = fixture.debugElement.queryAll(By.directive(NavItemDirective));
    });

    it('should create nav items', () => {
        expect(navItemElements.length).toBe(2);
    });

    it('should call innerLink.onActive in ngAfterViewInit', () => {
        const directive = navItemElements[0].injector.get(NavItemDirective);
        const mockInnerLink = { onActive: jest.fn() };
        directive['innerLink'] = mockInnerLink as any;
        directive.ngAfterViewInit();
        expect(mockInnerLink.onActive).toHaveBeenCalled();
    });

    describe('makeActive', () => {
        let directive: NavItemDirective;
        let parentElement: HTMLElement;
        let jQueryMock: jest.Mock;
        beforeEach(() => {
            directive = navItemElements[0].injector.get(NavItemDirective);
            parentElement = navItemElements[0].nativeElement.parentNode;
            const removeClassMock = jest.fn();
            const findMock = jest.fn().mockReturnValue({ removeClass: removeClassMock });
            jQueryMock = jest.fn().mockReturnValue({ find: findMock });
            (window as any).$ = jQueryMock;
            directive.isAttached = true;
        });

        it('should remove active class from other active items', () => {
            directive.makeActive();
            expect(jQueryMock).toHaveBeenCalledWith(parentElement);
            expect(jQueryMock(parentElement).find).toHaveBeenCalledWith('> li.active');
            expect(jQueryMock(parentElement).find('> li.active').removeClass).toHaveBeenCalledWith('active');
        });

        it('should not add active class to current item if not attached', () => {
            (directive as any).isAttached = false;
            const addClassSpy = jest.spyOn(directive['nativeElement'].classList, 'add');
            directive.makeActive();
            expect(addClassSpy).not.toHaveBeenCalled();
        });
    });

    describe('ngOnDetach', () => {
        let directive: NavItemDirective;

        beforeEach(() => {
            directive = navItemElements[0].injector.get(NavItemDirective);
        });

        it('should remove the "active" class from the native element', () => {
            // Arrange
            const nativeElement = navItemElements[0].nativeElement;
            nativeElement.classList.add('active');
            // Act
            directive.ngOnDetach();
            // Assert
            expect(nativeElement.classList.contains('active')).toBeFalsy();
        });

        it('should call super.ngOnDetach', () => {
            // Arrange
            const superSpy = jest.spyOn(Object.getPrototypeOf(NavItemDirective.prototype), 'ngOnDetach');

            // Act
            directive.ngOnDetach();

            // Assert
            expect(superSpy).toHaveBeenCalled();
        });
    });

    describe('ngAfterViewInit', () => {
        it('should call innerLink.onActive in ngAfterViewInit when innerLink is defined', () => {
            const directive = navItemElements[0].injector.get(NavItemDirective);
            const mockInnerLink = { onActive: jest.fn() };
            directive['innerLink'] = mockInnerLink as any;

            // Spy on the makeActive function
            const makeActiveSpy = jest.spyOn(directive, 'makeActive');

            // Call ngAfterViewInit and trigger the onActive callback
            directive.ngAfterViewInit();

            // Simulate the onActive callback being triggered
            expect(mockInnerLink.onActive).toHaveBeenCalledWith(expect.any(Function));

            // Call the function that was passed to onActive
            const callback = mockInnerLink.onActive.mock.calls[0][0];
            callback(); // Manually invoke the callback

            // Ensure that makeActive is called when the callback is triggered
            expect(makeActiveSpy).toHaveBeenCalled();
        });

        it('should not throw when innerLink is undefined', () => {
            const directive = navItemElements[0].injector.get(NavItemDirective);
            directive['innerLink'] = undefined;
            expect(() => directive.ngAfterViewInit()).not.toThrow();
        });
    });

});