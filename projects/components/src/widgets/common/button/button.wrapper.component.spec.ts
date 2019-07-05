import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ButtonComponent} from './button.component';
import { ImagePipe } from '../../../pipes/image.pipe';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import {App} from '@wm/core';
import { Component, ViewChild } from '@angular/core';

let mockApp = {};

@Component({
    template: `
        <button wmButton name="testbutton"
                type="button"
                backgroundcolor="#ff0000"
                on-click="onButtonClick($event, widget)"
                caption="My Button"
        ></button>
    `
})
class TestComponent {
    @ViewChild(ButtonComponent)
    buttonComponent: ButtonComponent;

    public disableButton: boolean = false;
    public showButton: boolean = true;
    public btnCaption: string = 'My Test Button bind';
    public onButtonClick($event, widget) {
        console.log('clicked button in component.');
    }
}

describe('ButtonComponent', () => {
   let component: TestComponent;
   let buttonComponent: ButtonComponent;
   let fixture: ComponentFixture<TestComponent>;
   let btnEl: HTMLElement;
   let captionEl: HTMLElement;
   let iconEl: HTMLElement;
   let badgeEl: HTMLElement;

   let captionValue: string = "Test Caption";
   let iconclassValue: string = 'wi wi-star';
   let badgeValue: string = '12';
   let iconpositionValue: string = 'right';

   let getButtonEl = () => {
       return fixture.nativeElement.querySelector('[wmButton]');
   };

   let getIconEl = () => {
       // return icon element in component
       return fixture.nativeElement.querySelector('.app-icon');
   };

   let getBadgeEl = () => {
       return fixture.nativeElement.querySelector('.badge');
   };

   beforeEach(async(()=>{
       TestBed.configureTestingModule({
           declarations: [TestComponent, ButtonComponent, ImagePipe, TrustAsPipe],
           providers: [
               {provide: App, useValue: mockApp}
           ]
       })
           .compileComponents();

       fixture = TestBed.createComponent(TestComponent);
       component = fixture.componentInstance;
       captionEl = fixture.nativeElement.querySelector('.btn-caption');
       buttonComponent = component.buttonComponent;
       fixture.detectChanges();
   }));

   it('should create Button Component', () => {
       expect(component).toBeTruthy() ;
   });

    it('should have valid caption', () => {
        buttonComponent.caption = captionValue;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.btn-caption').textContent).toEqual(captionValue);
    });

    it('should have icon with an iconclass', () => {
        buttonComponent.iconclass = iconclassValue;
        fixture.detectChanges();
        iconEl = getIconEl();
        expect(iconEl).toBeTruthy();
        expect(iconEl.classList).toContain(iconclassValue.split(' ')[0]);
        expect(iconEl.classList).toContain(iconclassValue.split(' ')[1]);
    });

    it('should have a badge', () => {
        buttonComponent.badgevalue = badgeValue;
        fixture.detectChanges();
        badgeEl = getBadgeEl();
        expect(badgeEl).toBeTruthy();
        expect(badgeEl.textContent).toEqual(badgeValue);
    });

    it('should have icon-position right on root element', ()=>{
        buttonComponent.iconposition = iconpositionValue;
        fixture.detectChanges();
        btnEl = getButtonEl();
        // this works as @HostBinding(attr.icon-position) is used
        expect(btnEl.getAttribute('icon-position')).toEqual(iconpositionValue);
    });

    // click event
    it('callback event should be called on click', () => {
        btnEl = getButtonEl();
        spyOn(component, 'onButtonClick');
        btnEl.click();
        expect(component.onButtonClick).toHaveBeenCalled();
    });

    it('should be disabled and callback event not called', () => {
        buttonComponent.disabled = true;
        fixture.detectChanges();
        btnEl = getButtonEl();
        expect(btnEl.getAttribute('disabled')).toBeTruthy();

        // the click handler should not be called on disabling the button
        spyOn(component, 'onButtonClick');
        btnEl.click();
        expect(component.onButtonClick).toHaveBeenCalledTimes(0);
    });

    it('should hide the button on changing show property', ()=>{
        // setting show on buttonComponent not working.
        // setting it on the proxy, buttonComponent.getWidget() is working
        buttonComponent.getWidget().show = false;
        fixture.detectChanges();
        btnEl = getButtonEl();
        expect(btnEl.hasAttribute('hidden')).toEqual(true);

        buttonComponent.getWidget().show = true;
        fixture.detectChanges();
        expect(btnEl.hasAttribute('hidden')).toEqual(false);
    });

        // it('should change caption via binding', ()=>{
        //     component.btnCaption = captionValue;
        //     fixture.detectChanges();
        //     expect(fixture.nativeElement.querySelector('.btn-caption').textContent).toEqual(captionValue);
        // })

    // it('should disable the button via binding', () => {
    //     component.disableButton = true;
    //     fixture.detectChanges();
    //     btnEl = getButtonEl();
    //     expect(btnEl.getAttribute('disabled')).toBeTruthy();
    // });

    // it('should enable the button via binding', () => {
    //     component.disableButton = false;
    //     fixture.detectChanges();
    //     btnEl = getButtonEl();
    //     console.log('disabled value', btnEl.getAttribute('disabled'));
    //     expect(btnEl.getAttribute('disabled')).toBeFalsy();
    // });

});