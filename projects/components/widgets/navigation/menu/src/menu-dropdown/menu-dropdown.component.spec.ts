import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { MenuDropdownComponent } from './menu-dropdown.component';
import { MenuComponent } from '../menu.component';
import { By } from '@angular/platform-browser';

describe('MenuDropdownComponent', () => {
    let component: MenuDropdownComponent;
    let fixture: ComponentFixture<MenuDropdownComponent>;
    let mockMenuComponent: MenuComponent;

    beforeEach(async () => {
        mockMenuComponent = {
            animateitems: 'fade',
            menuposition: 'down,right',
            menualign: 'left',
            nativeElement: document.createElement('div'),
            setMenuPosition: jest.fn()
        } as unknown as MenuComponent;

        await TestBed.configureTestingModule({
            declarations: [MenuDropdownComponent],
            providers: [
                { provide: MenuComponent, useValue: mockMenuComponent },
                {
                    provide: ElementRef,
                    useValue: {
                        nativeElement: document.createElement('ul')
                    }
                }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuDropdownComponent);
        component = fixture.componentInstance;
        component.items = [{ class: 'test-item', disabled: false, children: [] }];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add default class to native element', () => {
        const nativeElement = (component as any).nativeElement as HTMLElement;
        expect(nativeElement.classList.contains('dropdown-menu')).toBe(true);
    });

    it('should add animation class to native element after view init', () => {
        component.ngAfterViewInit();
        const nativeElement = (component as any).nativeElement as HTMLElement;
        expect(nativeElement.classList.contains('fadeIn')).toBe(true);
    });

    it('should set menu position based on viewport intersection', () => {
        const entries = [
            { isIntersecting: false }
        ];

        // Directly invoke the callback method
        component.callback(entries, null);

        expect(mockMenuComponent.menuposition).toBe('up,right');
    });

    it('should render menu items correctly', () => {
        fixture.detectChanges();
        const menuItems = fixture.debugElement.queryAll(By.css('li[wmMenuDropdownItem]'));
        expect(menuItems.length).toBe(1);
        expect(menuItems[0].nativeElement.classList.contains('test-item')).toBe(true);
    });

    // New test cases for createObserver function
    describe('createObserver', () => {
        let mockTarget: ElementRef;
        let mockCallback: jest.Mock;
        let mockIntersectionObserver: jest.Mock;

        beforeEach(() => {
            mockTarget = { nativeElement: document.createElement('div') } as ElementRef;
            mockCallback = jest.fn();
            mockIntersectionObserver = jest.fn();
            (global as any).IntersectionObserver = mockIntersectionObserver;
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });
        it('should observe the target element', () => {
            const mockObserve = jest.fn();
            mockIntersectionObserver.mockReturnValue({ observe: mockObserve });
            component.createObserver(mockTarget, mockCallback);
            expect(mockObserve).toHaveBeenCalledWith(mockTarget.nativeElement);
        });
    });

    describe('callback', () => {
        let mockObserver: IntersectionObserver;
        let parentElement: HTMLElement;
        let ulElement: HTMLElement;

        beforeEach(() => {
            mockObserver = {} as IntersectionObserver;

            // Create a proper DOM structure
            parentElement = document.createElement('div');
            ulElement = document.createElement('ul');
            parentElement.appendChild(ulElement);

            (component as any).menuRef = mockMenuComponent;
            (component as any).nativeElement = ulElement;
        });

        it('should set menuposition to "down,right" when isIntersecting is true', () => {
            const intersectingEntry = { isIntersecting: true } as IntersectionObserverEntry;
            component.callback([intersectingEntry], mockObserver);

            expect((component as any).menuRef.menuposition).toBe('down,right');
            expect(parentElement.classList.contains('dropdown')).toBe(true);
            expect((component as any).menuRef.setMenuPosition).toHaveBeenCalled();
        });
        it('should add "parent-position" class when parent is bs-dropdown-container', () => {
            const nonIntersectingEntry = { isIntersecting: false } as IntersectionObserverEntry;
            const bsDropdownContainer = document.createElement('bs-dropdown-container');
            bsDropdownContainer.appendChild(parentElement);

            component.callback([nonIntersectingEntry], mockObserver);

            expect(bsDropdownContainer.classList.contains('parent-position')).toBe(true);
        });

        it('should not add "parent-position" class when parent is not bs-dropdown-container', () => {
            const nonIntersectingEntry = { isIntersecting: false } as IntersectionObserverEntry;
            const regularDiv = document.createElement('div');
            regularDiv.appendChild(parentElement);

            component.callback([nonIntersectingEntry], mockObserver);

            expect(regularDiv.classList.contains('parent-position')).toBe(false);
        });

        it('should only execute once even if called multiple times', () => {
            const intersectingEntry = { isIntersecting: true } as IntersectionObserverEntry;
            component.callback([intersectingEntry], mockObserver);
            const initialMenuPosition = (component as any).menuRef.menuposition;

            // Call again with a different entry
            const nonIntersectingEntry = { isIntersecting: false } as IntersectionObserverEntry;
            component.callback([nonIntersectingEntry], mockObserver);

            // The menuposition should not change on the second call
            expect((component as any).menuRef.menuposition).toBe(initialMenuPosition);
        });

        it('should handle missing menuposition gracefully', () => {
            (component as any).menuRef.menuposition = undefined;
            const intersectingEntry = { isIntersecting: true } as IntersectionObserverEntry;
            component.callback([intersectingEntry], mockObserver);

            expect((component as any).menuRef.menuposition).toBe('down,right');
        });
    });


    describe('getParentWidget', () => {
        it('should call createObserver when menu is inside a table', () => {
            // Mock the DOM structure
            const table = document.createElement('table');
            const menuElement = document.createElement('div');
            table.appendChild(menuElement);
            document.body.appendChild(table);

            // Mock jQuery
            (global as any).$ = jest.fn().mockReturnValue({
                closest: jest.fn().mockReturnValue(table),
                has: jest.fn().mockReturnValue({ length: 1 })
            });

            // Mock createObserver method
            component.createObserver = jest.fn();

            // Set the mocked element as the nativeElement of menuRef
            (component as any).menuRef = { nativeElement: menuElement } as ElementRef;

            // Call the method
            component.getParentWidget();

            // Assert
            expect(component.createObserver).toHaveBeenCalledWith(component, component.callback);

            // Clean up
            document.body.removeChild(table);
        });

        it('should call createObserver when menu is inside a list', () => {
            // Mock the DOM structure
            const list = document.createElement('ul');
            list.classList.add('list-group');
            const menuElement = document.createElement('div');
            list.appendChild(menuElement);
            document.body.appendChild(list);

            // Mock jQuery
            (global as any).$ = jest.fn().mockReturnValue({
                closest: jest.fn().mockReturnValue(list),
                has: jest.fn().mockReturnValue({ length: 1 })
            });

            // Mock createObserver method
            component.createObserver = jest.fn();

            // Set the mocked element as the nativeElement of menuRef
            (component as any).menuRef = { nativeElement: menuElement } as ElementRef;

            // Call the method
            component.getParentWidget();

            // Assert
            expect(component.createObserver).toHaveBeenCalledWith(component, component.callback);

            // Clean up
            document.body.removeChild(list);
        });

        it('should not call createObserver when menu is not inside a table or list', () => {
            // Mock the DOM structure
            const div = document.createElement('div');
            const menuElement = document.createElement('div');
            div.appendChild(menuElement);
            document.body.appendChild(div);

            // Mock jQuery
            (global as any).$ = jest.fn().mockReturnValue({
                closest: jest.fn().mockReturnValue(null),
                has: jest.fn().mockReturnValue({ length: 0 })
            });

            // Mock createObserver method
            component.createObserver = jest.fn();

            // Set the mocked element as the nativeElement of menuRef
            (component as any).menuRef = { nativeElement: menuElement } as ElementRef;

            // Call the method
            component.getParentWidget();

            // Assert
            expect(component.createObserver).not.toHaveBeenCalled();

            // Clean up
            document.body.removeChild(div);
        });
    });

});
