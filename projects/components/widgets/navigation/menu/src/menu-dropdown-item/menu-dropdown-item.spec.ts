import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { MenuDropdownItemComponent } from './menu-dropdown-item.component';
import { KEYBOARD_MOVEMENTS, MENU_POSITION, MenuComponent } from '../menu.component';
import { addClass, App, triggerItemAction, UserDefinedExecutionContext } from '@wm/core';
import { NavComponent } from '../nav/nav.component';
import { Router } from '@angular/router';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { clone } from 'lodash-es';
import { hasLinkToCurrentPage } from '@wm/components/base';

// Mock the triggerItemAction function
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
    let mockMenuComponent: jest.Mocked<MenuComponent>;
    let mockUserDefinedExecutionContext: jest.Mocked<UserDefinedExecutionContext>;
    let mockNavComponent: jest.Mocked<NavComponent>;
    let mockElementRef: ElementRef;

    beforeEach(async () => {
        mockMenuComponent = {
            onMenuItemSelect: jest.fn(),
            route: { url: '/test' },
            menualign: 'pull-left',
            autoclose: 'outsideClick',
            linktarget: '_self'
        } as unknown as jest.Mocked<MenuComponent>;

        mockUserDefinedExecutionContext = {} as jest.Mocked<UserDefinedExecutionContext>;
        mockNavComponent = {} as jest.Mocked<NavComponent>;
        mockElementRef = {
            nativeElement: document.createElement('li')
        };

        await TestBed.configureTestingModule({
            declarations: [MenuDropdownItemComponent],
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
        component.item = { link: '/test', children: [] };
        component.menuRef = mockMenuComponent;
        (component as any).nativeElement = mockElementRef.nativeElement;
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
        let mockClosest: jest.Mock;

        beforeEach(() => {
            mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                target: mockElementRef.nativeElement
            };
            mockClosest = jest.fn().mockReturnValue({ get: jest.fn() });
            mockItem = { link: '/test' };
            (triggerItemAction as jest.Mock).mockClear();
            (clone as jest.Mock).mockClear();

            // Mock the closest method
            ($ as any) = jest.fn().mockReturnValue({
                closest: jest.fn().mockReturnValue({
                    get: jest.fn().mockReturnValue(mockElementRef.nativeElement)
                })
            });
        });

        it('should not stop propagation if autoclose is not "outsideClick"', () => {
            mockEvent.target = (component as any).nativeElement;
            component.menuRef.autoclose = 'clickAway';
            component.onSelect(mockEvent, mockItem);
            expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        });
        it('should stop propagation if autoclose is "outsideClick"', () => {
            component.menuRef.autoclose = 'outsideClick';
            component.onSelect(mockEvent, mockItem);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should not stop propagation if autoclose is not "outsideClick"', () => {
            component.menuRef.autoclose = 'clickAway';
            component.onSelect(mockEvent, mockItem);
            expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
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
                    ...itemWithTarget,
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
                    ...mockItem,
                    target: '_top'
                })
            );
        });

        it('should trigger item action with the component and selected item', () => {
            component.onSelect(mockEvent, mockItem);
            expect(triggerItemAction).toHaveBeenCalledWith(
                component,
                expect.objectContaining({
                    ...mockItem,
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
            expect(addClass).toHaveBeenCalledWith(mockElementRef.nativeElement, 'active');
        });
    });

});