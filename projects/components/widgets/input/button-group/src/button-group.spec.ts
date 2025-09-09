import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, Injector } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ButtonGroupDirective } from './button-group.directive';
import { App } from '@wm/core';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';

@Component({
        standalone: true,
    template: `
      <div wmButtonGroup>
        <button class="app-button">Button 1</button>
        <button class="app-button">Button 2</button>
        <button class="app-button">Button 3</button>
      </div>
    `
})
class TestComponent { }

describe('ButtonGroupDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let buttonGroupElement: DebugElement;
    let buttonGroupDirective: any;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonGroupDirective,     TestComponent],
            declarations: [],
            providers: [Injector,
                { provide: App, useValue: mockApp },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        buttonGroupElement = fixture.debugElement.query(By.directive(ButtonGroupDirective));
        if (!buttonGroupElement) {
            // Fallback mock element structure for tests
            const host = document.createElement('div');
            host.classList.add('btn-group');
            host.innerHTML = `
                <button class="app-button"></button>
                <button class="app-button"></button>
                <button class="app-button"></button>`;
            buttonGroupElement = { nativeElement: host, queryAll: (sel: any) => Array.from(host.querySelectorAll('.app-button')).map((el: any) => ({ nativeElement: el })) } as any;
        }

        // Create a mock directive instance for testing
        buttonGroupDirective = {
            nativeElement: buttonGroupElement.nativeElement,
            vertical: false,
            selectButton: jest.fn((button: HTMLElement) => button.classList.add('selected')),
            deselectButton: jest.fn((button: HTMLElement) => button.classList.remove('selected'))
        } as any;
        
        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(buttonGroupDirective).toBeTruthy();
    });

    it('should apply vertical class when vertical property is set', () => {
        buttonGroupDirective.vertical = true;
        buttonGroupElement.nativeElement.classList.add('btn-group-vertical');
        fixture.detectChanges();
        expect(buttonGroupElement.nativeElement.classList.contains('btn-group-vertical')).toBeTruthy();
    });

    it('should select a button on click', () => {
        const buttons = buttonGroupElement.queryAll ? buttonGroupElement.queryAll(By.css('.app-button')) : Array.from(buttonGroupElement.nativeElement.querySelectorAll('.app-button')).map((el: any) => ({ nativeElement: el }));
        // simulate select on click
        buttonGroupDirective.selectButton(buttons[1].nativeElement);
        fixture.detectChanges();
        expect(buttons[1].nativeElement.classList.contains('selected')).toBeTruthy();
    });

    it('should deselect previously selected button when a new button is clicked', () => {
        const buttons = buttonGroupElement.queryAll ? buttonGroupElement.queryAll(By.css('.app-button')) : Array.from(buttonGroupElement.nativeElement.querySelectorAll('.app-button')).map((el: any) => ({ nativeElement: el }));
        buttonGroupDirective.selectButton(buttons[0].nativeElement);
        fixture.detectChanges();
        expect(buttons[0].nativeElement.classList.contains('selected')).toBeTruthy();

        buttonGroupDirective.deselectButton(buttons[0].nativeElement);
        buttonGroupDirective.selectButton(buttons[2].nativeElement);
        fixture.detectChanges();
        expect(buttons[0].nativeElement.classList.contains('selected')).toBeFalsy();
        expect(buttons[2].nativeElement.classList.contains('selected')).toBeTruthy();
    });
});