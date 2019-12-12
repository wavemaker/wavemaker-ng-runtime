import { async, ComponentFixture } from '@angular/core/testing';
import { PanelComponent } from './panel.component';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MenuDropdownItemComponent } from "../../../navigation/menu/src/menu-dropdown-item/menu-dropdown-item.component";
import { MenuDropdownComponent } from "../../../navigation/menu/src//menu-dropdown/menu-dropdown.component";
import { NavigationControlDirective } from "../../../navigation/nav/src/navigation-control.directive";
import { MenuComponent } from "../../../navigation/menu/src//menu.component";
import { Router } from '@angular/router';
import { UserDefinedExecutionContext } from '@wm/core';
import { SecurityService } from '@wm/security';
import { DatasetAwareNavComponent, NavNode } from '../../../../base/src/widgets/common/base/dataset-aware-nav.component';
import { BsDropdownModule, BsDropdownDirective } from 'ngx-bootstrap';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { ComponentsTestModule } from "../../../../base/src/test/components.test.module";
import { compileTestComponent } from "../../../../base/src/test/util/component-test-util";

const markup = `<div wmPanel badgevalue="Test val" partialContainer aria-label="panel"  wm-navigable-element="true"  subheading="subheading"  iconclass="wi wi-account-circle"  title="Title" name="panel1" actions="testData" autoclose="outsideClick"  actionsclick.event="panel1Actionsclick($item)"></div>`;
@Component({
    template: markup
})
class PanelWrapperComponent {
    @ViewChild(PanelComponent)
    wmComponent: PanelComponent;

    public testData = "Option1, Option2, Option3";
    public outsideClick = true;

    panel1Actionsclick = function ($item) {
        console.log("Panel action item click triggered", $item);
    }
}

const panelComponentModuleDef: ITestModuleDef = {
    declarations: [PanelWrapperComponent, PanelComponent, MenuComponent, MenuDropdownItemComponent, MenuDropdownComponent, NavigationControlDirective],
    imports: [ComponentsTestModule, BsDropdownModule.forRoot()],
    providers: [{ provide: Router, useValue: Router }, { provide: SecurityService, useValue: SecurityService },
    { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext },
    { provide: DatasetAwareNavComponent, useValue: DatasetAwareNavComponent }]
}

const panelComponentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-panel',
    widgetSelector: '[wmPanel]',
    testModuleDef: panelComponentModuleDef,
    testComponent: PanelWrapperComponent
}

const TestBase: ComponentTestBase = new ComponentTestBase(panelComponentDef);
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe("PanelComponent", () => {
    let panelWrapperComponent: PanelWrapperComponent;
    let wmComponent: PanelComponent;
    let fixture: ComponentFixture<PanelWrapperComponent>;
    let dropdownToggleEle;

    let getdropdownToggleEle = () => {
        return fixture.debugElement.query(By.css('.dropdown-toggle'));
    }

    let getwmMenuEle = () => {
        return fixture.debugElement.query(By.css('[wmMenu]'));
    }

    let getMenudropdownEle = () => {
        return fixture.debugElement.query(By.css('[wmmenudropdown]'));
    }

    // Creating the panelcomponent instance and activating the change detection.
    beforeEach((async () => {
        fixture = compileTestComponent(panelComponentModuleDef, PanelWrapperComponent);
        panelWrapperComponent = fixture.componentInstance;
        wmComponent = panelWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the Panel component', () => {
        expect(panelWrapperComponent).toBeTruthy();
    });

    it("should trigger the panel action item click callback", (done) => {

        dropdownToggleEle = getdropdownToggleEle();
        let wmMenuEle = getwmMenuEle();
        let wmMenuComponentInstance: MenuComponent = wmMenuEle.componentInstance;
        wmMenuComponentInstance.getWidget().dataset = panelWrapperComponent.testData;
        dropdownToggleEle.nativeElement.click();

        fixture.whenStable().then(() => {

            let menudropdownEle = getMenudropdownEle();
            spyOn(panelWrapperComponent, 'panel1Actionsclick').and.callThrough();

            setTimeout(function () {
                fixture.detectChanges();
                fixture.whenStable().then(() => {
                    let liElements = menudropdownEle.query(By.css('li.app-menu-item'));
                    liElements.nativeElement.click();
                    fixture.detectChanges();
                    expect(panelWrapperComponent.panel1Actionsclick).toHaveBeenCalledTimes(1);
                    done();
                });
            }, 150);
        });


    });



});
