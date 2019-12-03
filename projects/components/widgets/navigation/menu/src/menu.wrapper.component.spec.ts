import { BsDropdownModule } from 'ngx-bootstrap';
import { By } from '@angular/platform-browser';
import { async, ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { MenuComponent } from './menu.component';
import { MenuDropdownComponent } from "./menu-dropdown/menu-dropdown.component";
import { MenuDropdownItemComponent } from "./menu-dropdown-item/menu-dropdown-item.component";
import { NavModule } from '@wm/components/navigation/nav';
import { Router } from '@angular/router';
import { UserDefinedExecutionContext } from '@wm/core';
import { SecurityService } from '@wm/security';
import { ButtonComponent } from '@wm/components/input';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { ComponentsTestModule } from "../../../../base/src/test/components.test.module";
import { compileTestComponent } from "../../../../base/src/test/util/component-test-util";

const markup = `<div wmMenu dropdown  caption="My Menu" autoclose="outsideClick" name="menu1" select.event="menu1Select($event, widget, $item)">`;
@Component({
    template: markup
})
class MenuWrapperComponent {
    @ViewChild(MenuComponent)
    menuComponent: MenuComponent;

    public testdata = "Op1,op2,op3";

    menu1Select($event, widget, $item) {
        console.log('calling on menu select!');
    }
}

const menuComponentModuleDef: ITestModuleDef = {
    declarations: [MenuWrapperComponent, MenuComponent, MenuDropdownComponent, MenuDropdownItemComponent],
    imports: [ComponentsTestModule, NavModule, BsDropdownModule.forRoot()],
    providers: [{ provide: Router, useValue: Router }, { provide: SecurityService, useValue: SecurityService },
    { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
    ]
}

const menuComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-menu',
    widgetSelector: '[wmMenu]',
    testModuleDef: menuComponentModuleDef,
    testComponent: MenuWrapperComponent
}

const TestBase: ComponentTestBase = new ComponentTestBase(menuComponentDef);
// TestBase.verifyPropsInitialization();
// TestBase.verifyCommonProperties();
// TestBase.verifyStyles();

describe('MenuComponent', () => {
    let menuWrapperComponent: MenuWrapperComponent;
    let menuComponent: MenuComponent;
    let fixture: ComponentFixture<MenuWrapperComponent>;

    let getButtonElement = () => {
        return fixture.debugElement.query(By.css('[wmbutton]'));
    }

    let getwmMenudropdownElem = () => {
        return fixture.debugElement.query(By.css('[wmmenudropdown]'));
    }


    beforeEach(async () => {

        fixture = compileTestComponent(menuComponentModuleDef, MenuWrapperComponent);
        menuWrapperComponent = fixture.componentInstance;
        menuComponent = menuWrapperComponent.menuComponent;

        fixture.detectChanges();


    });

    it("should create the menu component ", () => {
        expect(menuComponent).toBeTruthy();

    });

    it("caption should be my menu ", () => {
        let buttonEle = getButtonElement();
        const btnEleInstance: ButtonComponent = buttonEle.componentInstance;
        btnEleInstance.caption = "My Menu";
        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(buttonEle.query(By.css('.btn-caption')).nativeElement.textContent.trim()).toEqual('My Menu');

        });
    });


    it("should open the dropdown  on menu button click", () => {
        let buttonEle = getButtonElement();
        menuComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonEle.nativeElement.click();
        fixture.whenStable().then(() => {
            let menudropdownEle = getwmMenudropdownElem();

            expect(menudropdownEle).toBeTruthy();
            fixture.whenStable().then(() => {
                let liElements = menudropdownEle.query(By.css('li.app-menu-item'));
                expect(liElements).toBeTruthy();
            });
        });
    });

    it("should trigger the menu select option click event ", () => {
        let buttonEle = getButtonElement();
        menuComponent.getWidget().dataset = menuWrapperComponent.testdata;
        buttonEle.nativeElement.click();

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            let menudropdownEle = getwmMenudropdownElem();

            spyOn(menuWrapperComponent, 'menu1Select').and.callThrough();

            fixture.whenStable().then(() => {
                let liElements = menudropdownEle.query(By.css('li.app-menu-item'));
                liElements.nativeElement.click();
                fixture.detectChanges();
                expect(menuWrapperComponent.menu1Select).toHaveBeenCalledTimes(1);
            });;

        });

    });

});
