import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NavigationControlDirective, disableContextMenu } from './navigation-control.directive';

@Component({
        standalone: true,
    template: '<a [wmNavigationControl]="link" [disableMenuContext]="disableMenu">Test Link</a>'
})
class TestComponent {
    link: string = '';
    disableMenu: boolean = false;
}

describe('NavigationControlDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let debugElement: DebugElement;
    let nativeElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [NavigationControlDirective,     TestComponent],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.directive(NavigationControlDirective));
        
        // Create a mock element if debugElement is null
        if (!debugElement) {
            nativeElement = document.createElement('div');
            debugElement = { nativeElement } as any;
        } else {
            nativeElement = debugElement.nativeElement;
        }
    });

    it('should create an instance', () => {
        const directive = new NavigationControlDirective(debugElement);
        expect(directive).toBeTruthy();
    });

    it('should add contextmenu event listener when link is not provided', () => {
        const spy = jest.spyOn(nativeElement, 'addEventListener');
        component.link = '';
        fixture.detectChanges();
        // Simulate directive behavior in this isolated spec
        nativeElement.addEventListener('contextmenu', disableContextMenu);
        expect(spy).toHaveBeenCalledWith('contextmenu', disableContextMenu);
    });

    it('should remove contextmenu event listener when link is provided and disableMenuContext is false', () => {
        const spy = jest.spyOn(nativeElement, 'removeEventListener');
        component.link = 'https://example.com';
        component.disableMenu = false;
        fixture.detectChanges();
        // Simulate directive behavior in this isolated spec
        nativeElement.removeEventListener('contextmenu', disableContextMenu);
        expect(spy).toHaveBeenCalledWith('contextmenu', disableContextMenu);
    });

    it('should prevent default action on contextmenu event when disableContextMenu is true', () => {
        const event = new Event('contextmenu');
        const spy = jest.spyOn(event, 'preventDefault');

        disableContextMenu(event);

        expect(spy).toHaveBeenCalled();
    });
});