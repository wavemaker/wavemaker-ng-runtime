import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { By } from '@angular/platform-browser';
import { waitForAsync, ComponentFixture, ComponentFixtureAutoDetect, tick, fakeAsync } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { MenuComponent } from './menu.component';
import { MenuDropdownComponent } from './menu-dropdown/menu-dropdown.component';
import { MenuDropdownItemComponent } from './menu-dropdown-item/menu-dropdown-item.component';
import { NavigationControlDirective } from './nav/navigation-control.directive';
import { Router } from '@angular/router';
import { AbstractI18nService, App, UserDefinedExecutionContext } from '@wm/core';
import { SecurityService } from '@wm/security';
import { ButtonComponent } from '@wm/components/input';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { ComponentsTestModule } from '../../../../base/src/test/components.test.module';
import { compileTestComponent, getHtmlSelectorElement, mockApp } from '../../../../base/src/test/util/component-test-util';
import { MockAbstractI18nService } from '../../../../base/src/test/util/date-test-util';

const markup = `<div
                wmMenu
                dropdown
                fontsize="16"
                fontfamily="Times New Roman"
                color="#000000"
                fontweight="400"
                textalign="start"
                backgroundcolor
                backgroundrepeat="repeat"
                backgroundposition
                backgroundimage
                backgroundsize="auto"
                backgroundattachment="scroll"
                bordercolor="#000000"
                borderstyle
                borderwidth="0px"
                padding="0px"
                margin="0px"
                tabindex="0"
                caption="My Menu"
                autoclose="outsideClick"
                name="menu1"
                menuposition="inline"
                animateitems="fade"
                shortcutkey="x"
                itemlabel="firstname"
                itemlink="link"
                itemicon="icon"
                itemchildren="children"
                select.event="menu1Select($event, widget, $item)">`;
@Component({
    template: markup
})
class MenuWrapperComponent {
    @ViewChild(MenuComponent, /* TODO: add static flag */ { static: true })
    wmComponent: MenuComponent;

    public testdata = 'Op1,op2,op3';

    public testDataforActions = [{ firstname: 'keith', link: 'https://s3.amazonaws.com/wmstudio-apps/salesrep/Keith-Neilson.png', icon: 'wi wi-home' }];


    menu1Select($event, widget, $item) {
        console.log('calling on menu select!');
    }
}

const menuComponentModuleDef: ITestModuleDef = {
    declarations: [MenuWrapperComponent, MenuComponent, MenuDropdownComponent, MenuDropdownItemComponent, NavigationControlDirective,],
    imports: [ComponentsTestModule, BsDropdownModule.forRoot()],
    providers: [
        { provide: Router, useValue: Router },
        { provide: App, useValue: mockApp },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
        { provide: ComponentFixtureAutoDetect, useValue: true },
        { provide: AbstractI18nService, useClass: MockAbstractI18nService }
    ],
    teardown: {destroyAfterEach: false}   
};

const menuComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-menu',
    widgetSelector: '[wmMenu]',
    inputElementSelector: 'button.app-button',
    testModuleDef: menuComponentModuleDef,
    testComponent: MenuWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(menuComponentDef);
// TestBase.verifyPropsInitialization();  /* need fix for fontfamily property */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('MenuComponent', () => {
    let menuWrapperComponent: MenuWrapperComponent;
    let wmComponent: MenuComponent;
    let fixture: ComponentFixture<MenuWrapperComponent>;


    const buttonClickFunction = () => {
        const buttonEle = getHtmlSelectorElement(fixture, '[wmbutton]');
        const btnEleInstance: ButtonComponent = buttonEle.componentInstance;
        btnEleInstance.caption = 'My Menu';
        buttonEle.nativeElement.click();
    };

    beforeEach(async () => {
        fixture = compileTestComponent(menuComponentModuleDef, MenuWrapperComponent);
        menuWrapperComponent = fixture.componentInstance;
        wmComponent = menuWrapperComponent.wmComponent;
        fixture.detectChanges();
    });

    it('should create the menu component ', () => {
        expect(wmComponent).toBeTruthy();

    });

    /***************************** Properties starts *************************************** */

    it('caption should be my menu ', waitForAsync(() => {
        const buttonEle = getHtmlSelectorElement(fixture, '[wmbutton]');
        const btnEleInstance: ButtonComponent = buttonEle.componentInstance;
        btnEleInstance.caption = 'My Menu';
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(buttonEle.query(By.css('.btn-caption')).nativeElement.textContent.trim()).toEqual('My Menu');
        });
    }));

    it('should apply 300px width ', waitForAsync(() => {
        wmComponent.getWidget().width = '300px';
        fixture.whenStable().then(() => {
            const buttonEle = getHtmlSelectorElement(fixture, '[wmbutton]');
            expect(buttonEle.nativeElement.style.width).toEqual('300px');
        });
    }));

    it('should apply 50px height ', waitForAsync(() => {
        wmComponent.getWidget().height = '50px';
        fixture.whenStable().then(() => {
            const buttonEle = getHtmlSelectorElement(fixture, '[wmbutton]');
            expect(buttonEle.nativeElement.style.height).toEqual('50px');
        });
    }));

    it('should show the dropdown in horizontal layout ', waitForAsync(() => {
        buttonClickFunction();
        fixture.whenStable().then(() => {
            const ulEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            wmComponent.getWidget().menulayout = 'vertical';
            fixture.detectChanges();
            expect(ulEle.nativeElement.classList).toContain('vertical');
            wmComponent.getWidget().menulayout = 'horizontal';
            fixture.detectChanges();
            expect(ulEle.nativeElement.classList).toContain('horizontal');
        });
    }));

    it('should show the position in inline  ', waitForAsync(() => {
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const ulEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            fixture.detectChanges();
            expect(ulEle.nativeElement.classList).toContain('dropinline-menu');
        });
    }));

    /***************************** Properties end *************************************** */

    /***************************** Behaviour starts *************************************** */
    it('animation on to content should fadein', waitForAsync(() => {
        buttonClickFunction();
        fixture.whenStable().then(() => {
            const ulEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            fixture.detectChanges();
            expect(ulEle.nativeElement.classList).toContain('fadeIn');
        });
    }));

    it('should auto open the dropdown and close (Auto-open always and Auto-close always)', waitForAsync(() => {
        wmComponent.getWidget().autoopen = 'always';
        wmComponent.getWidget().autoclose = 'always';

        fixture.whenStable().then(() => {
            const menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle).toBeTruthy();
            fixture.detectChanges();
            // let liElements = menudropdownEle.nativeElement.querySelector(By.css('li.app-menu-item'));
            const liElements = menudropdownEle.query(By.css('[wmmenudropdownitem]'));
            expect(liElements.nativeElement).toBeTruthy();
            const menuEle = getHtmlSelectorElement(fixture, '[wmmenu]');
            fixture.detectChanges();
            expect(menuEle.nativeElement.classList).toContain('open');
            liElements.nativeElement.click();
            fixture.detectChanges();
            expect(menuEle.nativeElement.classList.contains('open')).toBeFalsy();
        });
    }));

    /***************************** Behaviour end *************************************** */

    /***************************** icon class starts ************************************* */

    it('should show the icon when given an icon class', () => {
        getHtmlSelectorElement(fixture, '[wmbutton]').nativeElement.widget.iconclass = 'wi wi-home';
        fixture.detectChanges();
        expect(document.getElementsByClassName('app-icon').length).toBe(1);
    });

    /***************************** icon class end ************************************* */


    /***************************** scenarios start ************************************* */

    it('should open the dropdown  on menu button click', waitForAsync(() => {
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            let menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle).toBeTruthy();
            fixture.whenStable().then(() => {
                menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
                fixture.detectChanges();
                const liElements = menudropdownEle.query(By.css('[wmmenudropdownitem]'));
                expect(liElements).toBeTruthy();
            });
        });
    }));

    it('should close when user click outside', waitForAsync(() => {
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            let menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle).toBeTruthy();
            fixture.whenStable().then(() => {
                menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
                fixture.detectChanges();
                const liElements = menudropdownEle.query(By.css('[wmmenudropdownitem]'));
                expect(liElements).toBeTruthy();
                const menuEle = getHtmlSelectorElement(fixture, '[wmmenu]');
                document.body.click();
                fixture.detectChanges();
                expect(menuEle.nativeElement.classList.contains('open')).toBeFalsy();
            });
        });
    }));

    it('should trigger the menu select option click event ', waitForAsync(() => {
        const buttonEle = getHtmlSelectorElement(fixture, '[wmbutton]');
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonEle.nativeElement.click();
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            const menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            fixture.whenStable().then(() => {
                jest.spyOn(menuWrapperComponent, 'menu1Select');

                const liElements = menudropdownEle.query(By.css('li.app-menu-item'));
                liElements.nativeElement.click();
                fixture.detectChanges();
                expect(menuWrapperComponent.menu1Select).toHaveBeenCalledTimes(1);
            });
        });
    }));

    /***************************** scenarios end ************************************* */

    /***************************** actions start ************************************* */

    it('should open the dropdown  on menu button click', waitForAsync(() => {
        wmComponent.getWidget().dataset = menuWrapperComponent.testDataforActions;
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            let menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle).toBeTruthy();
            fixture.whenStable().then(() => {
                menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
                fixture.detectChanges();
                const liElements = menudropdownEle.query(By.css('[wmmenudropdownitem]'));
                liElements.nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
                fixture.detectChanges();
                expect(liElements.nativeElement.getElementsByClassName('anchor-caption')[0].innerText).toBe('keith');
                expect(document.getElementsByClassName('wi wi-home').length).toBe(1);
            });
        });
    }));

    it('should open the dropdown  on keyboard enter', waitForAsync(() => {
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        const menuElement = getHtmlSelectorElement(fixture, '[wmmenu]');
        menuElement.triggerEventHandler('keydown.enter', { preventDefault: () => { } });
        fixture.whenStable().then(() => {
            const menuDropdownElement = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menuDropdownElement).toBeTruthy();
            const liElements = menuDropdownElement.query(By.css('[wmmenudropdownitem]'));
            expect(liElements).toBeTruthy();
        });
    }));

    it('should open the dropdown  on keyboard enter and close on escape', waitForAsync(() => {
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        const menuElement = getHtmlSelectorElement(fixture, '[wmmenu]');
        menuElement.triggerEventHandler('keydown.enter', { preventDefault: () => { } });
        fixture.whenStable().then(() => {
            const menuDropdownElement = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menuDropdownElement).toBeTruthy();
            const liElements = menuDropdownElement.query(By.css('[wmmenudropdownitem]'));
            expect(liElements).toBeTruthy();
            menuElement.triggerEventHandler('keydown.escape', { preventDefault: () => { } });
            fixture.detectChanges();
            expect(menuDropdownElement.nativeElement.classList.contains('open')).toBeFalsy();
        });
    }));
    /***************************** actions end ************************************* */

   it('should dropdown position be down,right', waitForAsync(() => {
        wmComponent.menuposition = 'down,right';
        jest.spyOn(wmComponent, 'setMenuPosition');
        wmComponent.setMenuPosition();
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle.nativeElement.classList).toContain('pull-right');
        });
    }));
    
    it('should dropdown position be down,left', waitForAsync(() => {
        wmComponent.menuposition = 'down,left';
        jest.spyOn(wmComponent, 'setMenuPosition');
        wmComponent.setMenuPosition();
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle.nativeElement.classList).toContain('pull-left');
        });
    }));

    it('should dropdown position be up,right', waitForAsync(() => {
        wmComponent.menuposition = 'up,right';
        jest.spyOn(wmComponent, 'setMenuPosition');
        wmComponent.setMenuPosition();
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle.nativeElement.classList).toContain('pull-right');
        });
    }));

    it('should dropdown position be up,left', waitForAsync(() => {
        wmComponent.menuposition = 'up,left';
        jest.spyOn(wmComponent, 'setMenuPosition');
        wmComponent.setMenuPosition();
        wmComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonClickFunction();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const menudropdownEle = getHtmlSelectorElement(fixture, '[wmmenudropdown]');
            expect(menudropdownEle.nativeElement.classList).toContain('pull-left');
        });
    }));


});
