import { ComponentFixture, waitForAsync } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { Component, ViewChild } from '@angular/core';
import { compileTestComponent, mockApp } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { App } from '@wm/core';

const markup = `
        <button wmButton name="testbutton"
                #wm_button1="wmButton"
                arialabel="Help text for test label"
                caption="Test Button"
                [attr.aria-label]="wm_button1.arialabel || wm_button1.caption || 'Help text for test label'"
                type="button"
                tabindex="1" badgevalue="1"
                disabled="false"
                iconclass="icon class"
                iconurl="http://www.google.com/doodle4google/images/splashes/featured.png" iconwidth="20" iconheight="12" iconmargin="5"
                width="200" height="200" show="true" class="btn-primary"
                fontsize="20" fontfamily="Segoe UI" color="#0000FF" fontweight="700" whitespace="nowrap"
                fontstyle="italic" textdecoration="underline" textalign="center" backgroundcolor="#00ff29"
                backgroundimage="http://www.google.com/doodle4google/images/splashes/featured.png"
                backgroundrepeat="repeat" backgroundposition="left" backgroundsize="200px 200px" backgroundattachment="fixed"
                bordercolor="#d92953" borderstyle="solid" borderwidth="3px 4px 5px 6px"
                padding="10px 11px 12px 13px" margin ="3px 3px 4px 5px" opacity="0.8" cursor="nw-resize" zindex="100"
                visibility="visible"
                on-click="onButtonClick($event, widget)"
                on-mouseenter="eventHandler()" on-mouseleave="eventHandler()"
                on-focus="eventHandler()" on-blur="eventHandler()"
                tap.event="onButtonTap($event, widget)"
        ></button>
    `;
@Component({
        standalone: true,
    template: markup
})
class TestComponent {
    @ViewChild(ButtonComponent, /* TODO: add static flag */ { static: true })
    wmComponent: ButtonComponent;

    public disableButton: boolean = false;
    public showButton: boolean = true;
    public btnCaption: string = 'My Test Button bind';
    public onButtonClick($event, widget) {
        console.log('clicked button in wrapperComponent.');
    }
    public onButtonTap($event, widget) {
        console.log('triggered button tap event');
    }
}

const testModuleDef: ITestModuleDef = {
    declarations: [],
    imports: [ButtonComponent,     TestComponent],
    providers: [
        { provide: App, useValue: mockApp }
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-button',
    widgetSelector: '[wmButton]',
    testModuleDef: testModuleDef,
    testComponent: TestComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();  /* to be fixed for readonly issue */
// TestBase.verifyCommonProperties();  /* to be fixed for class property issue */
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('wm-button: Component specific tests: ', () => {
    let wrapperComponent: TestComponent;
    let wmComponent: ButtonComponent;
    let fixture: ComponentFixture<TestComponent>;
    let btnEl: HTMLElement;
    let captionEl: HTMLElement;
    let iconEl: HTMLElement;
    let badgeEl: HTMLElement;

    let captionValue: string = 'Test Caption';
    let iconclassValue: string = 'wi wi-star';
    let badgeValue: string = '12';
    let iconpositionValue: string = 'right';
    let btnClass: string = 'btn-success';

    let getButtonEl = () => {
        return fixture.nativeElement.querySelector('[wmButton]');
    };

    let getIconEl = () => {
        // return icon element in wrapperComponent
        return fixture.nativeElement.querySelector('.app-icon');
    };

    let getBadgeEl = () => {
        return fixture.nativeElement.querySelector('.badge');
    };

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, TestComponent);
        wrapperComponent = fixture.componentInstance;
        captionEl = fixture.nativeElement.querySelector('.btn-caption');
        wmComponent = wrapperComponent.wmComponent;
        if (wmComponent) {
            fixture.detectChanges();
        }
    }));

    it('should create Button Component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    it('should contain class as btn-success', (done) => {
        wmComponent.getWidget().class = btnClass;
        fixture.detectChanges();
        btnEl = getButtonEl();
        // Wait for class to apply on button widget because in base.component.ts switchclass method, sync param is not passed. So it is applying class after sometime
        setTimeout(() => {
            expect(btnEl.classList).toContain(btnClass);
            done();
        }, 50);
    });

    it('should have valid caption', () => {
        wmComponent.caption = captionValue;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.btn-caption').textContent).toEqual(captionValue);
    });

    it('should have icon with provided iconclass', () => {
        wmComponent.iconclass = iconclassValue;
        fixture.detectChanges();
        iconEl = getIconEl();
        expect(iconEl).toBeTruthy();
        expect(iconEl.classList).toContain(iconclassValue.split(' ')[0]);
        expect(iconEl.classList).toContain(iconclassValue.split(' ')[1]);
    });

    it('should have a badge', () => {
        wmComponent.badgevalue = badgeValue;
        fixture.detectChanges();
        badgeEl = getBadgeEl();
        expect(badgeEl).toBeTruthy();
        expect(badgeEl.textContent).toEqual(badgeValue);
    });

    it('should have icon-position right on root element', () => {
        wmComponent.iconposition = iconpositionValue;
        fixture.detectChanges();
        btnEl = getButtonEl();
        // this works as @HostBinding(attr.icon-position) is used
        expect(btnEl.getAttribute('icon-position')).toEqual(iconpositionValue);
    });

    // click event
    it('callback event should be called on click', () => {
        btnEl = getButtonEl();
        jest.spyOn(wrapperComponent, 'onButtonClick');
        btnEl.click();
        expect(wrapperComponent.onButtonClick).toHaveBeenCalled();
    });

    it('should hide the button on changing show property', () => {
        // setting show on wmComponent not working.
        // setting it on the proxy, wmComponent.getWidget() is working
        wmComponent.getWidget().show = false;
        fixture.detectChanges();
        btnEl = getButtonEl();
        expect(btnEl.hasAttribute('hidden')).toEqual(true);

        wmComponent.getWidget().show = true;
        fixture.detectChanges();
        expect(btnEl.hasAttribute('hidden')).toEqual(false);
    });

    it('should trigger callback events invoke through script', () => {
        jest.spyOn(wrapperComponent, 'onButtonTap');
        // Invoke onTap event
        wmComponent.getWidget().onTap();
        fixture.detectChanges();
        expect(wrapperComponent.onButtonTap).toHaveBeenCalledTimes(1);
    });

    // it('should be disabled and callback event not called', () => {
    //     wmComponent.disabled = true;
    //     fixture.detectChanges();
    //     btnEl = getButtonEl();
    //     expect(btnEl.getAttribute('disabled')).toBeTruthy();

    //     // the click handler should not be called on disabling the button
    //     spyOn(wrapperComponent, 'onButtonClick');
    //     btnEl.click();
    //     expect(wrapperComponent.onButtonClick).toHaveBeenCalledTimes(0);
    // });
    // it('should change caption via binding', ()=>{
    //     wrapperComponent.btnCaption = captionValue;
    //     fixture.detectChanges();
    //     expect(fixture.nativeElement.querySelector('.btn-caption').textContent).toEqual(captionValue);
    // })

    // it('should disable the button via binding', () => {
    //     wrapperComponent.disableButton = true;
    //     fixture.detectChanges();
    //     btnEl = getButtonEl();
    //     expect(btnEl.getAttribute('disabled')).toBeTruthy();
    // });

    // it('should enable the button via binding', () => {
    //     wrapperComponent.disableButton = false;
    //     fixture.detectChanges();
    //     btnEl = getButtonEl();
    //     console.log('disabled value', btnEl.getAttribute('disabled'));
    //     expect(btnEl.getAttribute('disabled')).toBeFalsy();
    // });

});

// Button widget without class property in the markup
const btnMarkup = `<button wmButton name="testbutton1" caption="Test Button1" type="button"></button>`;
@Component({
    template: btnMarkup
})
class BtnTestComponent {
    @ViewChild(ButtonComponent, /* TODO: add static flag */ { static: true })
    wmComponent: ButtonComponent;
}
const btnTestModuleDef: ITestModuleDef = {
    declarations: [],
    imports: [ButtonComponent,     TestComponent],
    providers: [
        { provide: App, useValue: mockApp }
    ]
};
describe('wm-button: Component Specific tests', () => {
    let wrapperComponent: BtnTestComponent;
    let wmComponent: ButtonComponent;
    let fixture: ComponentFixture<BtnTestComponent>;
    let btnClass = 'btn-primary';
    beforeEach(async () => {
        fixture = compileTestComponent(btnTestModuleDef, BtnTestComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        if (wmComponent) {
            fixture.detectChanges();
        }
    });
    it('should create button Component', () => {
        expect(wrapperComponent).toBeTruthy();
    });
    it('should not contain btn-default class', () => {
        expect(wmComponent.getWidget().class).toBeUndefined();
    });
    it('should contain class as btn-primary', (done) => {
        wmComponent.getWidget().class = btnClass;
        fixture.detectChanges();
        // Wait for class to apply on button widget because in base.component.ts switchclass method, sync param is not passed. So it is applying class after sometime
        setTimeout(() => {
            expect(fixture.nativeElement.querySelector('[wmButton]').classList).toContain(btnClass);
            done();
        }, 50);
    });
});


