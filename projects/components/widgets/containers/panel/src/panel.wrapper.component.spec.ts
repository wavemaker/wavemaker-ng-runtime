import { ComponentFixture } from '@angular/core/testing';
import { PanelComponent } from './panel.component';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MenuDropdownItemComponent } from "../../../navigation/menu/src/menu-dropdown-item/menu-dropdown-item.component";
import { MenuDropdownComponent } from "../../../navigation/menu/src//menu-dropdown/menu-dropdown.component";
import { NavigationControlDirective } from "../../../navigation/menu/src/nav/navigation-control.directive";
import { MenuComponent } from "../../../navigation/menu/src//menu.component";
import { Router } from '@angular/router';
import { App, UserDefinedExecutionContext } from '@wm/core';
import { SecurityService } from '@wm/security';
import { DatasetAwareNavComponent } from '../../../../base/src/widgets/common/base/dataset-aware-nav.component';
import { BsDropdownDirective, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from "../../../../base/src/test/common-widget.specs";
import { compileTestComponent, mockApp } from "../../../../base/src/test/util/component-test-util";
import { provideAnimations } from '@angular/platform-browser/animations';

const markup = `<div wmPanel badgevalue="Test val" #wm_panel1="wmPanel" expanded="true" helptext="samplePanel" partialContainer wm-navigable-element="true"  subheading="subheading" iconclass="wi wi-account-circle" actions="testData" autoclose="outsideClick" title="Title" enablefullscreen="true" closable="true" collapsible="true" name="panel1" hint="panel hint" actionsclick.event="panel1Actionsclick($item)">`;
@Component({
    template: markup
})

class PanelWrapperComponent {
    @ViewChild(PanelComponent, /* TODO: add static flag */ { static: true })
    wmComponent: PanelComponent;

    public testData = "Option1, Option2, Option3";
    public outsideClick = true;

    panel1Actionsclick = function ($item) { }
}

const panelComponentModuleDef: ITestModuleDef = {
    declarations: [PanelWrapperComponent,],
    imports: [BsDropdownModule, PanelComponent, MenuComponent, MenuDropdownItemComponent, MenuDropdownComponent, NavigationControlDirective],
    providers: [
        { provide: Router, useValue: Router },
        { provide: App, useValue: mockApp },
        { provide: SecurityService, useValue: SecurityService },
        { provide: UserDefinedExecutionContext, useValue: UserDefinedExecutionContext }, BsDropdownDirective,
        { provide: DatasetAwareNavComponent, useValue: DatasetAwareNavComponent },
        provideAnimations()
    ]
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

    async function togglePanel(expand: string) {
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

    describe('onPropertyChange', () => {
        it('should set expanded property when key is "expanded"', () => {
            wmComponent.onPropertyChange('expanded', true);
            expect(wmComponent.expanded).toBe(true);

            wmComponent.onPropertyChange('expanded', false);
            expect(wmComponent.expanded).toBe(false);
        });

        it('should call $lazyLoad after timeout when key is "content" and expanded is true', (done) => {
            wmComponent.expanded = true;
            wmComponent.collapsible = true;
            wmComponent.$lazyLoad = jest.fn();

            wmComponent.onPropertyChange('content', 'new content');

            setTimeout(() => {
                expect(wmComponent.$lazyLoad).toHaveBeenCalled();
                done();
            }, 30);
        });

        it('should call $lazyLoad after timeout when key is "content" and collapsible is false', (done) => {
            wmComponent.expanded = false;
            wmComponent.collapsible = false;
            wmComponent.$lazyLoad = jest.fn();

            wmComponent.onPropertyChange('content', 'new content');

            setTimeout(() => {
                expect(wmComponent.$lazyLoad).toHaveBeenCalled();
                done();
            }, 30);
        });

        it('should not call $lazyLoad when key is "content" and expanded is false and collapsible is true', (done) => {
            wmComponent.expanded = false;
            wmComponent.collapsible = true;
            wmComponent.$lazyLoad = jest.fn();

            wmComponent.onPropertyChange('content', 'new content');

            setTimeout(() => {
                expect(wmComponent.$lazyLoad).not.toHaveBeenCalled();
                done();
            }, 30);
        });

        it('should call super.onPropertyChange for other keys', () => {
            const superOnPropertyChange = jest.spyOn(Object.getPrototypeOf(PanelComponent.prototype), 'onPropertyChange');

            wmComponent.onPropertyChange('someOtherKey', 'newValue', 'oldValue');

            expect(superOnPropertyChange).toHaveBeenCalledWith('someOtherKey', 'newValue', 'oldValue');
        });
    });

    describe('expand', () => {
        it('should call toggle when expanded is false', () => {
            wmComponent.expanded = false;
            wmComponent.toggle = jest.fn();
            const event = new Event('click');

            wmComponent.expand(event);

            expect(wmComponent.toggle).toHaveBeenCalledWith(event);
        });

        it('should not call toggle when expanded is true', () => {
            wmComponent.expanded = true;
            wmComponent.toggle = jest.fn();
            const event = new Event('click');

            wmComponent.expand(event);

            expect(wmComponent.toggle).not.toHaveBeenCalled();
        });
    });

    describe('collapse', () => {
        it('should call toggle when expanded is true', () => {
            wmComponent.expanded = true;
            wmComponent.toggle = jest.fn();
            const event = new Event('click');

            wmComponent.collapse(event);

            expect(wmComponent.toggle).toHaveBeenCalledWith(event);
        });

        it('should not call toggle when expanded is false', () => {
            wmComponent.expanded = false;
            wmComponent.toggle = jest.fn();
            const event = new Event('click');

            wmComponent.collapse(event);

            expect(wmComponent.toggle).not.toHaveBeenCalled();
        });
    });

    describe('hideFooter', () => {
        it('should return true when hasFooter is false', () => {
            (wmComponent as any).hasFooter = false;
            wmComponent.expanded = true;
            expect(wmComponent.hideFooter).toBe(true);
        });

        it('should return true when expanded is false', () => {
            (wmComponent as any).hasFooter = true;
            wmComponent.expanded = false;
            expect(wmComponent.hideFooter).toBe(true);
        });

        it('should return true when both hasFooter and expanded are false', () => {
            (wmComponent as any).hasFooter = false;
            wmComponent.expanded = false;
            expect(wmComponent.hideFooter).toBe(true);
        });

        it('should return false when both hasFooter and expanded are true', () => {
            (wmComponent as any).hasFooter = true;
            wmComponent.expanded = true;
            expect(wmComponent.hideFooter).toBe(false);
        });
    });

    describe('showHeader', () => {
        beforeEach(() => {
            wmComponent.iconurl = '';
            wmComponent.iconclass = '';
            wmComponent.collapsible = false;
            wmComponent.actions = null;
            wmComponent.title = '';
            wmComponent.subheading = '';
            wmComponent.enablefullscreen = false;
        });

        it('should return true when iconurl is set', () => {
            wmComponent.iconurl = 'some-url';
            expect(wmComponent.showHeader).toBe("some-url");
        });

        it('should return true when iconclass is set', () => {
            wmComponent.iconclass = 'some-class';
            expect(wmComponent.showHeader).toBe('some-class');
        });

        it('should return true when collapsible is true', () => {
            wmComponent.collapsible = true;
            expect(wmComponent.showHeader).toBe(true);
        });

        // it('should return true when actions is set', () => {
        //     wmComponent.actions = [{ name: 'Action' }];
        //     expect(wmComponent.showHeader).toBe([{ name: 'Action' }]);
        // });

        it('should return true when title is set', () => {
            wmComponent.title = 'Some Title';
            expect(wmComponent.showHeader).toBe('Some Title');
        });

        it('should return true when subheading is set', () => {
            wmComponent.subheading = 'Some Subheading';
            expect(wmComponent.showHeader).toBe('Some Subheading');
        });

        it('should return true when enablefullscreen is true', () => {
            wmComponent.enablefullscreen = true;
            expect(wmComponent.showHeader).toBe(true);
        });

        it('should return false when all conditions are false or unset', () => {
            expect(wmComponent.showHeader).toBe(false);
        });
    });

    describe('computeDimensions', () => {
        let mockPanelHeader: { nativeElement: { offsetHeight: number } };
        let mockPanelContent: { nativeElement: HTMLElement };
        let mockNativeElement: { querySelector: jest.Mock };
        let mockFooter: { offsetHeight: number };
        let originalInnerHeight: number;

        beforeEach(() => {
            mockPanelHeader = { nativeElement: { offsetHeight: 50 } };
            mockPanelContent = { nativeElement: document.createElement('div') };
            mockFooter = { offsetHeight: 30 };
            mockNativeElement = {
                querySelector: jest.fn().mockReturnValue(mockFooter)
            };

            wmComponent['panelHeader'] = mockPanelHeader as any;
            wmComponent['panelContent'] = mockPanelContent as any;
            (wmComponent as any)['nativeElement'] = mockNativeElement as any;

            originalInnerHeight = window.innerHeight;
            Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
        });

        afterEach(() => {
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight });
        });
        it('should set height to empty string when fullscreen is false and height is not set', () => {
            wmComponent.fullscreen = false;
            wmComponent.height = '';
            wmComponent['computeDimensions']();
            expect(mockPanelContent.nativeElement.style.height).toBe('');
        });
    });

    describe('menuActionItemClick', () => {
        it('should set selectedAction without children and value properties', () => {
            const mockItem = {
                id: '1',
                label: 'Test Action',
                children: ['child1', 'child2'],
                value: 'test-value',
                icon: 'test-icon'
            };
            const mockEvent = new MouseEvent('click');

            (wmComponent as any).menuActionItemClick(mockEvent, mockItem);

            expect(wmComponent.selectedAction).toEqual({
                id: '1',
                label: 'Test Action',
                icon: 'test-icon'
            });
        });

        it('should invoke actionsclick event callback with correct parameters', () => {
            const mockItem = {
                id: '1',
                label: 'Test Action',
                children: ['child1', 'child2'],
                value: 'test-value',
                icon: 'test-icon'
            };
            const mockEvent = new MouseEvent('click');

            const invokeEventCallbackSpy = jest.spyOn(wmComponent, 'invokeEventCallback');

            (wmComponent as any).menuActionItemClick(mockEvent, mockItem);

            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('actionsclick', {
                $event: mockEvent,
                $item: {
                    id: '1',
                    label: 'Test Action',
                    icon: 'test-icon'
                }
            });
        });
    })

    describe('reDrawChildren', () => {
        it('should call redraw on all reDrawableComponents after timeout', (done) => {
            const mockComponent1 = { redraw: jest.fn() };
            const mockComponent2 = { redraw: jest.fn() };
            wmComponent['reDrawableComponents'] = [mockComponent1, mockComponent2];

            wmComponent['reDrawChildren']();

            setTimeout(() => {
                expect(mockComponent1.redraw).toHaveBeenCalled();
                expect(mockComponent2.redraw).toHaveBeenCalled();
                done();
            }, 110);
        });

        it('should not throw error if reDrawableComponents is undefined', (done) => {
            wmComponent['reDrawableComponents'] = undefined;

            expect(() => {
                wmComponent['reDrawChildren']();
            }).not.toThrow();

            setTimeout(done, 110);
        });
    });
});
