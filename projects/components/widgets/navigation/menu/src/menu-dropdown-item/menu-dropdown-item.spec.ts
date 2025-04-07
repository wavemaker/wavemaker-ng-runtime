import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { MenuDropdownItemComponent } from './menu-dropdown-item.component';
import { KEYBOARD_MOVEMENTS, MENU_POSITION, MenuComponent } from '../menu.component';
import { addClass, App, triggerItemAction, UserDefinedExecutionContext } from '@wm/core';
import { NavComponent } from '../nav/nav.component';
import { Router } from '@angular/router';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { clone } from 'lodash-es';
import { hasLinkToCurrentPage } from '@wm/components/base';
import { CommonModule } from '@angular/common';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    triggerItemAction: jest.fn(),
    addClass: jest.fn(),
    toggleClass: jest.fn()
}));
jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    hasLinkToCurrentPage: jest.fn()
}));
jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    clone: jest.fn(obj => ({ ...obj }))
}));

const MENU_LAYOUT_TYPE = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

describe('MenuDropdownItemComponent', () => {
    let component: MenuDropdownItemComponent;
    let fixture: ComponentFixture<MenuDropdownItemComponent>;
    let mockMenuComponent: any;
    let mockUserDefinedExecutionContext: any;
    let mockNavComponent: any;
    let mockElementRef: ElementRef;

    beforeEach(async () => {
        // Define global $ function for JQuery
        (global as any).$ = jest.fn().mockImplementation(selector => {
            return {
                closest: jest.fn().mockReturnValue({
                    get: jest.fn().mockReturnValue(mockElementRef.nativeElement),
                    parent: jest.fn().mockReturnValue({
                        toggleClass: jest.fn().mockReturnThis(),
                        find: jest.fn().mockReturnThis()
                    }),
                    children: jest.fn().mockReturnValue({
                        first: jest.fn().mockReturnValue([{}]),
                        last: jest.fn().mockReturnValue([{}])
                    })
                }),
                toggleClass: jest.fn(),
                find: jest.fn().mockReturnValue({
                    first: jest.fn().mockReturnValue({
                        find: jest.fn().mockReturnValue({
                            focus: jest.fn()
                        })
                    }),
                    focus: jest.fn()
                }),
                prev: jest.fn().mockReturnValue({
                    find: jest.fn().mockReturnValue({
                        focus: jest.fn()
                    })
                }),
                next: jest.fn().mockReturnValue({
                    find: jest.fn().mockReturnValue({
                        focus: jest.fn()
                    })
                })
            };
        });

        mockMenuComponent = {
            onMenuItemSelect: jest.fn(),
            route: { url: '/test' },
            menualign: 'pull-left',
            autoclose: 'outsideClick',
            linktarget: '_self',
            disableMenuContext: false,
            bsDropdown: {
                hide: jest.fn()
            },
            $element: {
                find: jest.fn().mockReturnValue({
                    children: jest.fn().mockReturnValue({
                        first: jest.fn().mockReturnValue([{}]),
                        last: jest.fn().mockReturnValue([{}])
                    })
                })
            }
        };

        mockUserDefinedExecutionContext = {};
        mockNavComponent = {};
        mockElementRef = {
            nativeElement: document.createElement('li')
        };

        await TestBed.configureTestingModule({
            imports: [CommonModule],
            declarations: [], // Don't declare standalone components
            schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA], // Add schemas to ignore unknown elements/attrs
            providers: [
                { provide: App, useValue: mockApp },
                { provide: MenuComponent, useValue: mockMenuComponent },
                { provide: UserDefinedExecutionContext, useValue: mockUserDefinedExecutionContext },
                { provide: NavComponent, useValue: mockNavComponent },
                { provide: ElementRef, useValue: mockElementRef },
                { provide: Router, useValue: { url: '/test' } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MenuDropdownItemComponent);
        component = fixture.componentInstance;
        component.item = {
            link: '/test',
            children: [],
            label: 'Test Item',
            icon: 'test-icon',
            badge: null
        };
        component.menuRef = mockMenuComponent;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with correct menu align class', () => {
        expect(component.menualign).toBe('fa-caret-right');
    });

    describe('onSelect', () => {
        let mockEvent: any;
        let mockItem: any;

        beforeEach(() => {
            mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                target: mockElementRef.nativeElement
            };
            mockItem = { link: '/test' };
            (triggerItemAction as jest.Mock).mockClear();
            (clone as jest.Mock).mockClear();

            // Mock jQuery to return the component's nativeElement
            (global as any).$ = jest.fn().mockImplementation(() => ({
                closest: jest.fn().mockReturnValue({
                    get: jest.fn().mockReturnValue((component as any).nativeElement)
                })
            }));
        });

        it('should stop propagation if autoclose is "outsideClick"', () => {
            component.menuRef.autoclose = 'outsideClick';
            component.onSelect(mockEvent, mockItem);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should prevent default event behavior', () => {
            component.onSelect(mockEvent, mockItem);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should call onMenuItemSelect with correct arguments', () => {
            component.onSelect(mockEvent, mockItem);
            expect(mockMenuComponent.onMenuItemSelect).toHaveBeenCalledWith({
                $event: mockEvent,
                $item: mockItem
            });
        });

        it('should clone the item before triggering action', () => {
            component.onSelect(mockEvent, mockItem);
            expect(clone).toHaveBeenCalledWith(mockItem);
        });

        it('should use item target if provided', () => {
            const itemWithTarget = { ...mockItem, target: '_blank' };
            component.onSelect(mockEvent, itemWithTarget);
            expect(triggerItemAction).toHaveBeenCalledWith(
                component,
                expect.objectContaining({
                    link: '/test',
                    target: '_blank'
                })
            );
        });

        it('should use menuRef.linktarget if item target is not provided', () => {
            component.menuRef.linktarget = '_top';
            component.onSelect(mockEvent, mockItem);
            expect(triggerItemAction).toHaveBeenCalledWith(
                component,
                expect.objectContaining({
                    link: '/test',
                    target: '_top'
                })
            );
        });

        it('should trigger item action with the component and selected item', () => {
            component.onSelect(mockEvent, mockItem);
            expect(triggerItemAction).toHaveBeenCalledWith(
                component,
                expect.objectContaining({
                    link: '/test',
                    target: '_self'
                })
            );
        });
    });

    describe('getInitialKeyMovements', () => {
        it('should return modified key movements for HORIZONTAL layout', () => {
            component.menuRef.menulayout = MENU_LAYOUT_TYPE.HORIZONTAL;
            const result = component.getInitialKeyMovements();
            const expected = {
                ...KEYBOARD_MOVEMENTS,
                MOVE_UP: 'LEFT-ARROW',
                MOVE_LEFT: 'UP-ARROW',
                MOVE_RIGHT: 'DOWN-ARROW',
                MOVE_DOWN: 'RIGHT-ARROW'
            };
            expect(result).toEqual(expected);
        });

        it('should return modified key movements for DOWN_LEFT menu position', () => {
            component.menuRef.menulayout = MENU_LAYOUT_TYPE.VERTICAL;
            component.menuRef.menuposition = MENU_POSITION.DOWN_LEFT;
            const result = component.getInitialKeyMovements();
            const expected = {
                ...KEYBOARD_MOVEMENTS,
                MOVE_LEFT: 'RIGHT-ARROW',
                MOVE_RIGHT: 'LEFT-ARROW'
            };
            expect(result).toEqual(expected);
        });

        it('should return modified key movements for UP_LEFT menu position', () => {
            component.menuRef.menulayout = MENU_LAYOUT_TYPE.VERTICAL;
            component.menuRef.menuposition = MENU_POSITION.UP_LEFT;
            const result = component.getInitialKeyMovements();
            const expected = {
                ...KEYBOARD_MOVEMENTS,
                MOVE_LEFT: 'RIGHT-ARROW',
                MOVE_RIGHT: 'LEFT-ARROW'
            };
            expect(result).toEqual(expected);
        });

        it('should return modified key movements for inline menu position', () => {
            component.menuRef.menulayout = MENU_LAYOUT_TYPE.VERTICAL;
            component.menuRef.menuposition = 'inline';
            const result = component.getInitialKeyMovements();
            const expected = {
                ...KEYBOARD_MOVEMENTS,
                MOVE_UP: 'LEFT-ARROW',
                MOVE_LEFT: 'UP-ARROW',
                MOVE_RIGHT: 'DOWN-ARROW',
                MOVE_DOWN: 'RIGHT-ARROW'
            };
            expect(result).toEqual(expected);
        });

        it('should return default key movements for other cases', () => {
            component.menuRef.menulayout = MENU_LAYOUT_TYPE.VERTICAL;
            component.menuRef.menuposition = 'DOWN_RIGHT';
            const result = component.getInitialKeyMovements();
            expect(result).toEqual(KEYBOARD_MOVEMENTS);
        });
    });

    describe('ngOnInit', () => {
        it('should add active class if parentNav is present and hasLinkToCurrentPage is true', () => {
            component['parentNav'] = mockNavComponent as NavComponent;
            (hasLinkToCurrentPage as jest.Mock).mockReturnValue(true);
            component.ngOnInit();
            expect(addClass).toHaveBeenCalledWith((component as any).nativeElement, 'active');
        });
    });
});