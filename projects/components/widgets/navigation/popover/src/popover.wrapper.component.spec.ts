
import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { App } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { PopoverComponent } from './popover.component';
import { PopoverConfig, PopoverModule } from 'ngx-bootstrap/popover';
import { compileTestComponent, getHtmlSelectorElement, mockApp } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { AnchorComponent } from '../../../basic/default/src/anchor/anchor.component';
import { ComponentsTestModule } from 'projects/components/base/src/test/components.test.module';

const markup = `
        <wm-popover
            wmPopover
            name="popover1"
            title="wavemaker"
            contentsource="inline"
            content="qwerty"
            caption="clickable"
            shortcutkey="enter"
            popoverwidth="240"
            popoverheight="360"
            container=".wm-app"
            popoverarrow="true"
            fontsize="16"
            fontfamily="Times New Roman"
            fontweight="400"
            textalign="start"
            whitespace="normal"
            backgroundrepeat="repeat"
            backgroundsize="auto"
            backgroundattachment="scroll"
            iconwidth="60"
            iconheight="40"
            iconmargin="4px"
            iconposition="top"
            iconurl="https://therightsofnature.org/wp-content/uploads/2018/01/turkey-3048299_1920-1366x550.jpg"
            tabindex="0"
            show="true"
            backgroundcolor
            backgroundposition
            bordercolor="#000000"
            borderstyle
            marginright="0.5em"
            marginleft="0.5em"
            borderwidth="0px"
            padding="0px"
            popoverplacement="Bottom"
            encodeurl="true"
            hint="4"
            tabindex="0"
            badgevalue="2"
            autoclose="outsideClick"
            click.event="onClick()"
            mouseenter.event="onHover()"
        >
        <ng-template><button class="popover-start"></button>qwerty<button class="popover-end"></button></ng-template>
        </wm-popover>
    `;

@Component({
    template: markup
})
class PopoverwrapperComponent {
    @ViewChild(PopoverComponent, /* TODO: add static flag */ { static: true })
    wmComponent: PopoverComponent;

    onClick() {
        console.log("clicked the popover")
    }

    onHover() {
        console.log("hovered on popover")
    }
}

const testModuleDef: ITestModuleDef = {
    imports: [
        ComponentsTestModule,
        PopoverModule.forRoot(),
    ],
    declarations: [PopoverwrapperComponent, PopoverComponent, AnchorComponent],
    providers: [
        { provide: App, useValue: mockApp },
        { provide: PopoverConfig },
    ]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-popover',
    inputElementSelector: 'a',
    widgetSelector: '[wmPopover]',
    testModuleDef: testModuleDef,
    testComponent: PopoverwrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization(); /* TODO: need fix for title property */
TestBase.verifyCommonProperties();
TestBase.verifyStyles();
TestBase.verifyAccessibility();

describe('PopoverComponent', () => {
    let popoverWrapperComponent: PopoverwrapperComponent;
    let wmComponent: PopoverComponent;
    let fixture: ComponentFixture<PopoverwrapperComponent>;

    beforeEach(waitForAsync(() => {
        fixture = compileTestComponent(testModuleDef, PopoverwrapperComponent);
        popoverWrapperComponent = fixture.componentInstance;
        wmComponent = popoverWrapperComponent.wmComponent;
        //$('body').addClass('wm-app');
        fixture.detectChanges();
    }));

    it('should create the popover Component', async () => {
        await fixture.whenStable();
        expect(popoverWrapperComponent).toBeTruthy();
    });


    /************************* Properties starts ****************************************** **/

    it('should show popover title as wavemaker', async () => {
        await fixture.whenStable();
        const anchorElement = getHtmlSelectorElement(fixture, '[wmanchor]');
        if (!anchorElement) {
            throw new Error('Anchor element not found');
        }
        anchorElement.nativeElement.click();
        fixture.detectChanges();
        const popoverTitleElement = document.getElementsByClassName('popover-title')[0];
        if (!popoverTitleElement) {
            throw new Error('Popover title element not found');
        }
        expect(popoverTitleElement.innerHTML).toBe('wavemaker');
    });

    // TypeError: Cannot read properties of undefined (reading 'match')
    xit('should display caption as clickable', async () => {
        await fixture.whenStable();
        const anchorElement = getHtmlSelectorElement(fixture, '[wmanchor]');
        console.log(anchorElement)
        if (!anchorElement) {
            throw new Error('Anchor element not found');
        }
        anchorElement.nativeElement.widget.caption = 'clickable';
        fixture.detectChanges();
        const anchorCaptionElement = document.getElementsByClassName('anchor-caption')[0];
        if (!anchorCaptionElement) {
            throw new Error('Anchor caption element not found');
        }
        expect(anchorCaptionElement.innerHTML).toBe('clickable');
    });

    //TypeError: Cannot read properties of undefined (reading 'match')
    xit('should show the content', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        expect(document.getElementsByClassName('popover-body')[0].textContent).toContain('qwerty');
    })

    //  TypeError: Cannot read properties of undefined (reading 'match')
    xit('should show popover arrow class ', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        expect(document.getElementsByClassName('popover-arrow').length).toBe(1);
    })

    xit('should apply popover height 360px ', waitForAsync(() => {
        const anchorElement = getHtmlSelectorElement(fixture, '[wmanchor]');
        if (!anchorElement) {
            throw new Error('Anchor element not found');
        }
        anchorElement.nativeElement.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            const popoverContainerElement = document.getElementsByTagName('popover-container')[0] as HTMLElement;
            if (!popoverContainerElement) {
                throw new Error('Popover container element not found');
            }
            expect(popoverContainerElement.style.height).toBe('360px');
        });
    }));

    xit('popover width ', waitForAsync(() => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(document.getElementsByTagName('popover-container')[0]['style'].width).toBe('240px');
        })
    }))

    /************************* Properties end ****************************************** **/

    /************************* icon properties starts ****************************************** **/

    // TypeError: Cannot read properties of undefined (reading 'match')
    xit('icon class should be applied', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconclass = "wi wi-star-border";
        fixture.detectChanges();
        expect(document.getElementsByClassName('app-icon').length).toBe(1);
    })

    // TypeError: Cannot read properties of undefined (reading 'match')
    xit('icon position should be top', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconposition = "top";
        fixture.detectChanges();
        expect(document.getElementsByClassName('app-anchor')[0].getAttribute('icon-position')).toBe('top');
    })

    //TypeError: Cannot read properties of undefined (reading 'match')
    xit('icon url should should show the image', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconurl = "https://therightsofnature.org/wp-content/uploads/2018/01/turkey-3048299_1920-1366x550.jpg";
        fixture.detectChanges();
        expect(document.getElementsByClassName('anchor-image-icon').length).toBe(1);
    })

    //TypeError: Cannot read properties of undefined (reading 'match')
    xit('icon width , height and margin with icon class should be applied', () => {
        let anchorTag = getHtmlSelectorElement(fixture, '[wmanchor]');
        anchorTag.nativeElement.widget.iconclass = "wi wi-star-border";
        anchorTag.nativeElement.widget.iconwidth = "60px";
        anchorTag.nativeElement.widget.iconheight = "40px";
        anchorTag.nativeElement.widget.iconmargin = "4px";
        fixture.detectChanges();
        expect(document.getElementsByClassName('app-icon')[0]['style']['width']).toBe('60px');
        expect(document.getElementsByClassName('app-icon')[0]['style']['height']).toBe('40px');
        expect(document.getElementsByClassName('app-icon')[0]['style']['margin']).toBe('4px');
    })

    xit('icon width and height with url should be applied', () => {
        let anchorTag = getHtmlSelectorElement(fixture, '[wmanchor]');
        anchorTag.nativeElement.widget.iconurl = "https://therightsofnature.org/wp-content/uploads/2018/01/turkey-3048299_1920-1366x550.jpg";
        anchorTag.nativeElement.widget.iconwidth = "60px";
        anchorTag.nativeElement.widget.iconheight = "40px";
        fixture.detectChanges();
        expect(document.getElementsByClassName('anchor-image-icon')[0]['style']['width']).toBe('60px');
        expect(document.getElementsByClassName('anchor-image-icon')[0]['style']['height']).toBe('40px');
    })



    /************************* icon properties end ****************************************** **/

    /************************ Scenarios starts **************************************** */

    xit('should open the popover on mouse click', waitForAsync(() => {
        fixture.whenStable().then(() => {
            jest.spyOn(popoverWrapperComponent, 'onClick');
            getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
            fixture.detectChanges();
            expect(document.getElementsByTagName('popover-container').length).toBe(1);
        })
    }))

    xit('should close the popover when user click outside', waitForAsync(() => {
        fixture.whenStable().then(() => {
            jest.spyOn(popoverWrapperComponent, 'onClick');
            getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
            fixture.detectChanges();
            expect(document.getElementsByTagName('popover-container').length).toBe(1);
            fixture.whenStable().then(() => {
                document.body.click();
                fixture.detectChanges();
                expect(document.getElementsByTagName('popover-container').length).toBe(0);
            })
        })
    }))


    xit('should open the popover on mouse hover', waitForAsync(() => {

        fixture.whenStable().then(() => {
            wmComponent.getWidget().nativeElement.interaction = 'hover';
            jest.spyOn(popoverWrapperComponent, 'onHover');
            getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
            fixture.detectChanges();
            expect(popoverWrapperComponent.onHover).toHaveBeenCalledTimes(1);
            expect(document.getElementsByTagName('popover-container').length).toBe(1);
        })
    }))

    /************************ Scenarios end **************************************** */
});
