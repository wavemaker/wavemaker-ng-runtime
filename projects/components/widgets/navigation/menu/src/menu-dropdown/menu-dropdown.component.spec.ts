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
});
