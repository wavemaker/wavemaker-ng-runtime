import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { PanelComponent } from './panel.component';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MenuDropdownItemComponent } from "../../../navigation/menu/src/menu-dropdown-item/menu-dropdown-item.component";
import { MenuDropdownComponent } from "../../../navigation/menu/src//menu-dropdown/menu-dropdown.component";
import { NavigationControlDirective } from "../../../navigation/menu/src/nav/navigation-control.directive";
import { MenuComponent } from "../../../navigation/menu/src//menu.component";
import { Router } from '@angular/router';
import {App, UserDefinedExecutionContext} from '@wm/core';
import { SecurityService } from '@wm/security';
import { DatasetAwareNavComponent, NavNode } from '../../../../base/src/widgets/common/base/dataset-aware-nav.component';
import { BsDropdownModule, BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { ComponentsTestModule } from "../../../../base/src/test/components.test.module";
import { compileTestComponent } from "../../../../base/src/test/util/component-test-util";

const mockApp = {
    subscribe: () => { return () => {}}
};

const markup = `<div wmPanel badgevalue="Test val" #wm_panel1="wmPanel" expanded="true" helptext="samplePanel" partialContainer [attr.aria-label]="wm_panel1.hint || 'panel hint'" wm-navigable-element="true"  subheading="subheading" iconclass="wi wi-account-circle" actions="testData" autoclose="outsideClick" title="Title" enablefullscreen="true" closable="true" collapsible="true" name="panel1" hint="panel hint" actionsclick.event="panel1Actionsclick($item)">`;
@Component({
    template: markup
})

class PanelWrapperComponent {
    @ViewChild(PanelComponent, /* TODO: add static flag */ {static: true})
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
    providers: [{ provide: Router, useValue: Router },
        { provide: App, useValue: mockApp },
        { provide: SecurityService, useValue: SecurityService },
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
TestBase.verifyAccessibility();

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

    async function togglePanel(expand : string){
        let panelHeaderEle = fixture.debugElement.query(By.css('.panel-heading'));
        const collapseBtn = panelHeaderEle.query(By.css(expand));
        // Click the panel header element
        collapseBtn.nativeElement.click();
    
        // Wait for the fixture to stabilize
        await fixture.whenStable();
    
        // Trigger change detection
        fixture.detectChanges();
        await fixture.whenStable();
    }

    it('should create the Panel component', () => {
        expect(panelWrapperComponent).toBeTruthy();
    });

    it("should trigger the panel action item click callback", async () => {
        // Get the necessary elements
        dropdownToggleEle = getdropdownToggleEle();
        let wmMenuEle = getwmMenuEle();
        let wmMenuComponentInstance: MenuComponent = wmMenuEle.componentInstance;
        wmMenuComponentInstance.getWidget().dataset = panelWrapperComponent.testData;

        // Click the dropdown toggle element
        dropdownToggleEle.nativeElement.click();

        // Wait for the fixture to stabilize
        await fixture.whenStable();

        // Get the menu dropdown element and spy on the callback
        let menudropdownEle = getMenudropdownEle();
        jest.spyOn(panelWrapperComponent, 'panel1Actionsclick');

        // Trigger change detection
        fixture.detectChanges();
        await fixture.whenStable();

        // Get the list item elements and click the first one
        let liElements = menudropdownEle.query(By.css('li.app-menu-item'));
        liElements.nativeElement.click();

        // Trigger change detection again and wait for stabilization
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert that the callback was called
        expect(panelWrapperComponent.panel1Actionsclick).toHaveBeenCalledTimes(1);
    }, 10000); // Increase the timeout if necessary

    it('should expand the panel on click the expand icon', async () => {
        // Get the panel header element
        let panelHeaderEle = fixture.debugElement.query(By.css('.panel-heading'));
        const fullscreenBtn = panelHeaderEle.query(By.css('.wi-fullscreen'));
        // Click the panel header element
        fullscreenBtn.nativeElement.click();
        // Wait for the fixture to stabilize
        await fixture.whenStable();

        // Trigger change detection
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert that the panel is expanded
        expect(wmComponent.expanded).toBeTruthy();
    });

    it('should close the panel on click the close icon', async () => {
        const closeBtn = fixture.debugElement.query(By.css('.wi-close'));
        closeBtn.nativeElement.click();

        // Wait for the fixture to stabilize
        await fixture.whenStable();

        // Trigger change detection
        fixture.detectChanges();
        await fixture.whenStable();

        expect(wmComponent.getWidget().show).toBeFalsy();
    });

    it('should collapse the panel on click the collapse icon', async () => {
        togglePanel('.wi-minus');
        expect(wmComponent.expanded).toBeFalsy();
    });

    it('should expand the panel after collapse on click the expand icon', async () => {
        let panelHeaderEle = fixture.debugElement.query(By.css('.panel-heading'));
        const collapseBtn = panelHeaderEle.query(By.css('.wi-minus'));
        collapseBtn.nativeElement.click();

        await fixture.whenStable();

        fixture.detectChanges();
        await fixture.whenStable();

        panelHeaderEle = fixture.debugElement.query(By.css('.panel-heading'));
        const expandBtn = panelHeaderEle.query(By.css('.wi-plus'));
        expandBtn.nativeElement.click();

        await fixture.whenStable();

        fixture.detectChanges();
        await fixture.whenStable();

        // Assert that the panel is expanded
        expect(wmComponent.expanded).toBeTruthy();
    });

    it('should show help icon when helptext is provided', () => {
        let helpIcon = fixture.debugElement.query(By.css('.wi-question'));
        expect(helpIcon).toBeTruthy();
    });

    it('should show help text on click of help icon', async () => {
        let helpIcon = fixture.debugElement.query(By.css('.wi-question'));
        helpIcon.nativeElement.click();

        await fixture.whenStable();

        fixture.detectChanges();
        await fixture.whenStable();

        let helpTextContainer = fixture.debugElement.query(By.css('.show-help'));
        expect(helpTextContainer).toBeTruthy();

        const helpText = fixture.debugElement.query(By.css('.panel-help-content'))
        expect(helpText.nativeElement.textContent).toBe('samplePanel');
    });


});
