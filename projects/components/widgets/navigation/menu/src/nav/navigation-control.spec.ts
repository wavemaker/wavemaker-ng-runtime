import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NavigationControlDirective, disableContextMenu } from './navigation-control.directive';

@Component({
    template: '<a [wmNavigationControl]="link" [disableMenuContext]="disableMenu">Test Link</a>',
    standalone: false
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
            declarations: [TestComponent],
            imports: [NavigationControlDirective],
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement.query(By.directive(NavigationControlDirective));
        nativeElement = debugElement.nativeElement;
    });

    it('should create an instance', () => {
        const directive = new NavigationControlDirective(debugElement);
        expect(directive).toBeTruthy();
    });

    it('should add contextmenu event listener when link is not provided', () => {
        const spy = jest.spyOn(nativeElement, 'addEventListener');
        component.link = '';
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledWith('contextmenu', disableContextMenu);
    });

    it('should remove contextmenu event listener when link is provided and disableMenuContext is false', () => {
        const spy = jest.spyOn(nativeElement, 'removeEventListener');
        component.link = 'https://example.com';
        component.disableMenu = false;
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledWith('contextmenu', disableContextMenu);
    });

    it('should prevent default action on contextmenu event when disableContextMenu is true', () => {
        const event = new Event('contextmenu');
        const spy = jest.spyOn(event, 'preventDefault');

        disableContextMenu(event);

        expect(spy).toHaveBeenCalled();
    });
});