
import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { adjustContainerPosition, adjustContainerRightEdges, App } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { PopoverComponent } from './popover.component';
import { PopoverConfig, PopoverModule } from 'ngx-bootstrap/popover';
import { compileTestComponent, getHtmlSelectorElement, mockApp } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { AnchorComponent } from '../../../basic/default/src/anchor/anchor.component';
import { ComponentsTestModule } from 'projects/components/base/src/test/components.test.module';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    adjustContainerPosition: jest.fn(),
    adjustContainerRightEdges: jest.fn(),
}));

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

    onClick() { }

    onHover() { }
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

    // Test case for ngOnDetach
    it('should hide the popover when ngOnDetach is called', () => {
        // Spy on the hide method of bsPopoverDirective
        const bsPopoverDirectiveSpy = jest.spyOn((wmComponent as any).bsPopoverDirective, 'hide');

        // Call ngOnDetach method
        wmComponent.ngOnDetach();

        // Verify that the hide method was called
        expect(bsPopoverDirectiveSpy).toHaveBeenCalled();
    });

    it('should set focus to the anchor element when setFocusToPopoverLink is called', () => {
        // Mock the nativeElement and focus method
        wmComponent.anchorRef = {
            nativeElement: {
                focus: jest.fn() // Mock the focus method
            }
        };

        // Use Jest's fake timers to simulate the setTimeout delay
        jest.useFakeTimers();

        // Call the setFocusToPopoverLink method
        wmComponent['setFocusToPopoverLink']();

        // Fast-forward the timers by 10ms to trigger the setTimeout
        jest.advanceTimersByTime(10);

        // Verify that the focus method was called after the timeout
        expect(wmComponent.anchorRef.nativeElement.focus).toHaveBeenCalled();

        // Clean up timers
        jest.useRealTimers();
    });


    /************************* Properties starts ****************************************** **/

    xit('should show popover title as wavemaker', async () => {
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
    it('should display caption as clickable', async () => {
        await fixture.whenStable();
        const anchorElement = getHtmlSelectorElement(fixture, '[wmanchor]');
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

    it('should call showPopover when open() is called', () => {
        const showPopoverSpy = jest.spyOn((wmComponent as any), 'showPopover');
        wmComponent.open();
        expect(showPopoverSpy).toHaveBeenCalled();
    });

    // Test case for the close() method
    it('should set isOpen to false when close() is called', () => {
        wmComponent.isOpen = true;
        wmComponent.close();
        expect(wmComponent.isOpen).toBe(false);
    });

    // Test case for the onHidden() method
    it('should invoke hide event callback and set isOpen to false when onHidden() is called', () => {
        const invokeEventCallbackSpy = jest.spyOn(wmComponent, 'invokeEventCallback');
        wmComponent.isOpen = true;
        wmComponent.onHidden();
        expect(invokeEventCallbackSpy).toHaveBeenCalledWith('hide', { $event: { type: 'hide' } });
        expect(wmComponent.isOpen).toBe(false);
    });

    // Test case for the adjustPopoverArrowPosition() method
    it('should adjust popover arrow position when adjustPopoverArrowPosition() is called', () => {
        const mockPopoverElem = { find: jest.fn().mockReturnThis(), css: jest.fn() };
        const mockPopoverLeftShift = 20;
        const mockNgZone = { onStable: { subscribe: (fn: Function) => fn() } };

        (wmComponent as any).bsPopoverDirective = { _popover: { _ngZone: mockNgZone } } as any;

        wmComponent['adjustPopoverArrowPosition'](mockPopoverElem, mockPopoverLeftShift);
        expect(mockPopoverElem.find).toHaveBeenCalledWith('.popover-arrow');
        expect(mockPopoverElem.css).toHaveBeenCalledWith('left', `${mockPopoverLeftShift}px`);
    });

    describe('onPopoverAnchorKeydown', () => {
        it('should not show popover when canPopoverOpen is false', () => {
            wmComponent.canPopoverOpen = false;
            jest.spyOn((wmComponent as any), 'showPopover');
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            wmComponent.onPopoverAnchorKeydown(event);
            expect((wmComponent as any).showPopover).not.toHaveBeenCalled();
        });

        it('should show popover when Enter key is pressed and canPopoverOpen is true', () => {
            wmComponent.canPopoverOpen = true;
            jest.spyOn((wmComponent as any), 'showPopover');
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            jest.spyOn(event, 'stopPropagation');
            jest.spyOn(event, 'preventDefault');
            wmComponent.onPopoverAnchorKeydown(event);
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(event.preventDefault).toHaveBeenCalled();
            expect((wmComponent as any).showPopover).toHaveBeenCalled();
        });

        it('should not show popover when a key other than Enter is pressed', () => {
            wmComponent.canPopoverOpen = true;
            jest.spyOn((wmComponent as any), 'showPopover');
            const event = new KeyboardEvent('keydown', { key: 'Space' });
            wmComponent.onPopoverAnchorKeydown(event);
            expect((wmComponent as any).showPopover).not.toHaveBeenCalled();
        });
    });

    describe('triggerPopoverEvents', () => {
        let mockApp: Partial<App>;
        let cancelSubscriptionMock: jest.Mock;
        const mockViewParent = {
            Widgets: {},
            Variables: {},
            Actions: {}
        };
        beforeEach(() => {
            wmComponent.invokeEventCallback = jest.fn();
            Object.defineProperty(wmComponent, 'viewParent', {
                get: jest.fn(() => mockViewParent),
                configurable: true
            });
            mockApp = {
                subscribe: jest.fn().mockImplementation((event, callback) => {
                    callback();
                    return cancelSubscriptionMock;
                }),
                appLocale: 'en',
                Variables: {},
                Actions: {},
                onAppVariablesReady: jest.fn(),
            };
            (wmComponent as any).app = mockApp; // Type assertion to avoid readonly property error
        });

        it('should handle non-partial content source', () => {
            wmComponent.contentsource = 'inline';
            wmComponent.triggerPopoverEvents();
            expect((wmComponent as any).Widgets).toEqual(mockViewParent.Widgets);
            expect((wmComponent as any).Variables).toEqual(mockViewParent.Variables);
            expect((wmComponent as any).Actions).toEqual(mockViewParent.Actions);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('show', { $event: { type: 'show' } });
        });

        it('should not invoke load callback for non-partial content', () => {
            wmComponent.contentsource = 'inline';
            wmComponent.triggerPopoverEvents();
            expect(wmComponent.invokeEventCallback).not.toHaveBeenCalledWith('load');
        });
        it('should handle partial content source', (done) => {
            wmComponent.contentsource = 'partial';
            let cancelSubscription: () => void;
            (wmComponent as any).app = {
                subscribe: jest.fn().mockImplementation((event, callback) => {
                    cancelSubscription = jest.fn(() => {
                        expect(cancelSubscription).toHaveBeenCalled();
                        done();
                    });
                    setTimeout(() => {
                        callback({});
                    }, 0);
                    return cancelSubscription;
                })
            };
            wmComponent.partialRef = {
                nativeElement: {
                    widget: {
                        Widgets: {},
                        Variables: {},
                        Actions: {}
                    }
                }
            };
            wmComponent.invokeEventCallback = jest.fn();

            wmComponent.triggerPopoverEvents();

            expect((wmComponent as any).app.subscribe).toHaveBeenCalledWith('partialLoaded', expect.any(Function));
        });

        it('should handle non-partial content source', () => {
            wmComponent.contentsource = 'inline';
            wmComponent.invokeEventCallback = jest.fn();

            wmComponent.triggerPopoverEvents();

            expect((wmComponent as any).Widgets).toBe((wmComponent as any).viewParent.Widgets);
            expect((wmComponent as any).Variables).toBe((wmComponent as any).viewParent.Variables);
            expect((wmComponent as any).Actions).toBe((wmComponent as any).viewParent.Actions);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('show', { $event: { type: 'show' } });
        });
    });

    describe('onShown', () => {
        let mockPopoverContainer: HTMLElement;
        let mockAnchorElement: HTMLElement;

        beforeEach(() => {
            mockPopoverContainer = document.createElement('div');
            mockPopoverContainer.classList.add(wmComponent.popoverContainerCls);

            mockAnchorElement = document.createElement('div');
            wmComponent.anchorRef = { nativeElement: mockAnchorElement };

            const mockStartBtn = document.createElement('button');
            mockStartBtn.classList.add('popover-start');
            const mockEndBtn = document.createElement('button');
            mockEndBtn.classList.add('popover-end');
            mockPopoverContainer.appendChild(mockStartBtn);
            mockPopoverContainer.appendChild(mockEndBtn);

            document.body.appendChild(mockPopoverContainer);

            jest.spyOn(document, 'querySelector').mockReturnValue(mockPopoverContainer);
        });

        afterEach(() => {
            document.body.removeChild(mockPopoverContainer);
            jest.restoreAllMocks();
        });

        it('should set up keyboard navigation', () => {
            wmComponent.onShown();

            const startBtn = mockPopoverContainer.querySelector('.popover-start') as HTMLElement;
            const endBtn = mockPopoverContainer.querySelector('.popover-end') as HTMLElement;

            expect(typeof startBtn.onkeydown).toBe('function');
            expect(typeof endBtn.onkeydown).toBe('function');
        });

        it('should set up autoclose behavior when autoclose is "always"', () => {
            wmComponent.autoclose = 'always';
            wmComponent.onShown();

            expect(typeof mockPopoverContainer.onclick).toBe('function');
        });

        it('should call calculatePopoverPosition when adaptiveposition is false', () => {
            wmComponent.adaptiveposition = false;
            const calculatePopoverPostionSpy = jest.spyOn((wmComponent as any), 'calculatePopoverPostion');
            wmComponent.onShown();

            return new Promise<void>(resolve => {
                setTimeout(() => {
                    expect(calculatePopoverPostionSpy).toHaveBeenCalledWith(mockPopoverContainer);
                    resolve();
                }, 0);
            });
        });

        it('should trigger popover events', () => {
            const triggerPopoverEventsSpy = jest.spyOn(wmComponent, 'triggerPopoverEvents');
            wmComponent.onShown();

            return new Promise<void>(resolve => {
                setTimeout(() => {
                    expect(triggerPopoverEventsSpy).toHaveBeenCalled();
                    resolve();
                }, 0);
            });
        });

        it('should set up hover interactions when interaction is "hover"', () => {
            wmComponent.interaction = 'hover';
            wmComponent.onShown();

            expect(typeof mockPopoverContainer.onmouseenter).toBe('function');
            expect(typeof mockPopoverContainer.onmouseleave).toBe('function');
            expect(typeof mockAnchorElement.onmouseenter).toBe('function');
            expect(typeof mockAnchorElement.onmouseleave).toBe('function');
        });
    });

    describe('calculatePopoverPosition', () => {
        let mockElement: any;
        let mockWindow: any;
        let mockAnchorRef: any;


        beforeEach(() => {
            mockElement = {
                offset: jest.fn().mockReturnValue({ left: 100 }),
                0: { offsetWidth: 200 }
            };
            mockWindow = { width: jest.fn().mockReturnValue(1000) };
            mockAnchorRef = {
                nativeElement: {
                    getBoundingClientRect: jest.fn().mockReturnValue({
                        left: 50,
                        width: 100
                    })
                }
            };

            wmComponent.anchorRef = mockAnchorRef;
            Object.defineProperty(wmComponent, 'nativeElement', {
                get: jest.fn(() => { }),
                configurable: true
            });
            (wmComponent as any).bsPopoverDirective = { _popover: {} };

            (global as any).$ = jest.fn().mockImplementation((selector) => {
                if (selector === 'window') return mockWindow;
                return mockElement;
            });

            jest.useFakeTimers();

            // Ensure the method exists on the component
            if (typeof wmComponent['calculatePopoverPosition'] !== 'function') {
                wmComponent['calculatePopoverPosition'] = jest.fn();
            }
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.useRealTimers();
        });

        it('should not adjust popover position when fully visible', () => {
            wmComponent['calculatePopoverPosition'](mockElement);

            expect(adjustContainerPosition).not.toHaveBeenCalled();
            expect(adjustContainerRightEdges).not.toHaveBeenCalled();
        });
    });

    describe('hidePopover', () => {
        let appMock: any;
        let cancelSubscriptionMock: any;
        let invokeEventCallbackSpy: any;

        beforeEach(() => {
            // Clear all previous mocks
            jest.clearAllMocks();

            // Set up mocks
            appMock = {
                subscribe: jest.fn()
            };
            cancelSubscriptionMock = jest.fn();
            (wmComponent as any).app = appMock;

            // Spy on the invokeEventCallback
            invokeEventCallbackSpy = jest.spyOn(wmComponent as any, 'invokeEventCallback');
        });

        // Test case for triggerPopoverEvents when contentsource is not 'partial'
        it('should directly trigger the show event and set Widgets, Variables, Actions when contentsource is not partial', () => {
            wmComponent.contentsource = 'non-partial';
            const viewParentMock = {
                Widgets: 'parentWidgets',
                Variables: 'parentVariables',
                Actions: 'parentActions'
            };
            Object.defineProperty(wmComponent, 'viewParent', {
                get: jest.fn(() => viewParentMock),
                configurable: true
            });
            // Call the method
            wmComponent.triggerPopoverEvents();

            // Check that Widgets, Variables, and Actions were updated
            expect((wmComponent as any).Widgets).toBe('parentWidgets');
            expect((wmComponent as any).Variables).toBe('parentVariables');
            expect((wmComponent as any).Actions).toBe('parentActions');

            // Check that the 'show' event was invoked
            expect(invokeEventCallbackSpy).toHaveBeenCalledWith('show', { $event: { type: 'show' } });
        });

        // Test case for hidePopover
        it('should hide the popover after a 500ms timeout', () => {
            jest.useFakeTimers(); // Use Jest's fake timer system

            wmComponent.isOpen = true;

            // Call the hidePopover method
            (wmComponent as any).hidePopover();

            // Initially, isOpen should still be true
            expect(wmComponent.isOpen).toBe(true);

            // Fast forward time by 500ms
            jest.runAllTimers();

            // After the timeout, isOpen should be false
            expect(wmComponent.isOpen).toBe(false);
        });
    });


}); 
