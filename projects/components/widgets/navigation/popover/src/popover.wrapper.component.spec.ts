import { async, ComponentFixture } from '@angular/core/testing';
import { App } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { PopoverComponent } from './popover.component';
import { PopoverConfig, PopoverModule } from 'ngx-bootstrap';
import { compileTestComponent, getHtmlSelectorElement } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { AnchorComponent } from '../../../basic/default/src/anchor/anchor.component';
import { TrustAsPipe } from '../../../../base/src/pipes/trust-as.pipe';
import { ImagePipe } from '../../../../base/src/pipes/image.pipe';


const mockApp = {
    subscribe: () => { }
};

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
    @ViewChild(PopoverComponent, /* TODO: add static flag */ {static: true})
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
        PopoverModule.forRoot(),
    ],
    declarations: [PopoverwrapperComponent, PopoverComponent, AnchorComponent, ImagePipe, TrustAsPipe],
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
TestBase.verifyPropsInitialization();
TestBase.verifyCommonProperties();
TestBase.verifyStyles();

describe('PopoverComponent', () => {
    let popoverWrapperComponent: PopoverwrapperComponent;
    let wmComponent: PopoverComponent;
    let fixture: ComponentFixture<PopoverwrapperComponent>;

    beforeEach(async(() => {
        fixture = compileTestComponent(testModuleDef, PopoverwrapperComponent);
        popoverWrapperComponent = fixture.componentInstance;
        wmComponent = popoverWrapperComponent.wmComponent;
        fixture.detectChanges();
    }));

    it('should create the popover Component', async () => {
        await fixture.whenStable();
        expect(popoverWrapperComponent).toBeTruthy();
    });


    /************************* Properties starts ****************************************** **/

    it('should show popover title as wavemaker', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        expect(document.getElementsByClassName('popover-title')[0].innerHTML).toBe('wavemaker')
    })


    it('should display caption as clickable', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.caption = 'clickable';
        fixture.detectChanges();
        expect(document.getElementsByClassName('anchor-caption')[0].innerHTML).toBe('clickable');
    })

    it('should show the content', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        console.log("conten")
        expect(document.getElementsByClassName('popover-body')[0].textContent).toContain('qwerty');
    })

    it('should show popover arrow class ', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        expect(document.getElementsByClassName('popover-arrow').length).toBe(1);
    })

    it('should apply popover height 360px ', async(() => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(document.getElementsByTagName('popover-container')[0]['style'].height).toBe('360px');
        })
    }))

    xit('popover width ', async(() => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(document.getElementsByTagName('popover-container')[0]['style'].width).toBe('240px');
        })
    }))

    /************************* Properties end ****************************************** **/

    /************************* icon properties starts ****************************************** **/

    it('icon class should be applied', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconclass = "wi wi-star-border";
        fixture.detectChanges();
        expect(document.getElementsByClassName('app-icon').length).toBe(1);
    })

    it('icon position should be top', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconposition = "top";
        fixture.detectChanges();
        expect(document.getElementsByClassName('app-anchor')[0].getAttribute('icon-position')).toBe('top');
    })

    it('icon url should should show the image', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconurl = "https://therightsofnature.org/wp-content/uploads/2018/01/turkey-3048299_1920-1366x550.jpg";
        fixture.detectChanges();
        expect(document.getElementsByClassName('anchor-image-icon').length).toBe(1);
    })

    it('icon width , height and margin with icon class should be applied', () => {
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

    it('icon width and height with url should be applied', () => {
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

    it('should open the popover on mouse click', async(() => {
        fixture.whenStable().then(() => {
            spyOn(popoverWrapperComponent, 'onClick');
            getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.click();
            fixture.detectChanges();
            expect(document.getElementsByTagName('popover-container').length).toBe(1);
        })
    }))

    it('should close the popover when user click outside', async(() => {
        fixture.whenStable().then(() => {
            spyOn(popoverWrapperComponent, 'onClick');
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

    xit('should open the popover on mouse hover', async(() => {

        fixture.whenStable().then(() => {
            wmComponent.getWidget().nativeElement.interaction = 'hover';
            spyOn(popoverWrapperComponent, 'onHover');
            getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.dispatchEvent(new MouseEvent('mouseenter'));
            fixture.detectChanges();
            expect(popoverWrapperComponent.onHover).toHaveBeenCalledTimes(1);
            expect(document.getElementsByTagName('popover-container').length).toBe(1);
        })
    }))

    /************************ Scenarios end **************************************** */
});

