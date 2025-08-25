import { waitForAsync, ComponentFixture } from '@angular/core/testing';
import { addClass, adjustContainerPosition, adjustContainerRightEdges, App, findRootContainer, setCSSFromObj } from '@wm/core';
import { Component, ViewChild } from '@angular/core';
import { PopoverComponent } from './popover.component';
import { PopoverConfig, PopoverModule } from 'ngx-bootstrap/popover';
import { compileTestComponent, getHtmlSelectorElement, mockApp } from '../../../../base/src/test/util/component-test-util';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { AnchorComponent } from '../../../basic/anchor/src/anchor.component';
import { AUTOCLOSE_TYPE } from '@wm/components/base';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    adjustContainerPosition: jest.fn(),
    adjustContainerRightEdges: jest.fn(),
    findRootContainer: jest.fn(),
    setCSSFromObj: jest.fn(),
    addClass: jest.fn(),
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
    imports: [PopoverModule.forRoot(), PopoverComponent, AnchorComponent],
    declarations: [PopoverwrapperComponent],
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

    /************************* Properties end ****************************************** **/

    /************************* icon properties starts ****************************************** **/

    // TypeError: Cannot read properties of undefined (reading 'match')
    it('icon class should be applied', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconclass = "wi wi-star-border";
        fixture.detectChanges();
        expect(document.getElementsByClassName('app-icon').length).toBe(1);
    })

    // TypeError: Cannot read properties of undefined (reading 'match')


    //TypeError: Cannot read properties of undefined (reading 'match')
    it('icon url should should show the image', () => {
        getHtmlSelectorElement(fixture, '[wmanchor]').nativeElement.widget.iconurl = "https://therightsofnature.org/wp-content/uploads/2018/01/turkey-3048299_1920-1366x550.jpg";
        fixture.detectChanges();
        expect(document.getElementsByClassName('anchor-image-icon').length).toBe(1);
    })

    //TypeError: Cannot read properties of undefined (reading 'match')
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
        let mockPopoverStartBtn: HTMLElement;
        let mockPopoverEndBtn: HTMLElement;
        let mockArrowElement: HTMLElement;

        const createJQueryMock = (closestLength: number = 0) => {
            return {
                wrap: jest.fn().mockReturnThis(),
                closest: jest.fn().mockReturnValue({ length: closestLength })
            };
        };

        beforeEach(() => {
            // Create mock elements
            mockPopoverContainer = document.createElement('div');
            mockAnchorElement = document.createElement('div');
            mockPopoverStartBtn = document.createElement('button');
            mockPopoverEndBtn = document.createElement('button');
            mockArrowElement = document.createElement('div');

            mockPopoverContainer.classList.add('app-popover-wrapper');
            mockPopoverStartBtn.classList.add('popover-start');
            mockPopoverEndBtn.classList.add('popover-end');
            mockArrowElement.classList.add('arrow');

            mockPopoverContainer.appendChild(mockPopoverStartBtn);
            mockPopoverContainer.appendChild(mockPopoverEndBtn);
            mockPopoverContainer.appendChild(mockArrowElement);

            document.body.appendChild(mockPopoverContainer);

            (global as any).$ = jest.fn(() => createJQueryMock());

            // Mock document.querySelector
            jest.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
                if (selector.includes('app-popover-wrapper')) return mockPopoverContainer;
                if (selector === '.arrow') return mockArrowElement;
                return null;
            });

            // Set up component properties
            wmComponent.anchorRef = { nativeElement: mockAnchorElement };
            Object.defineProperty(wmComponent, "nativeElement", {
                get: jest.fn(() => mockAnchorElement),
                configurable: true
            });
            wmComponent.popoverheight = '100px';
            wmComponent.popoverwidth = '200px';
            wmComponent.popoverarrow = true;
            wmComponent.interaction = 'click';
            wmComponent.autoclose = AUTOCLOSE_TYPE.DISABLED;
            wmComponent.adaptiveposition = false;
            Object.defineProperty(wmComponent, 'popoverContainerCls', {
                value: 'app-popover-wrapper',
            });

            // Mock component methods
            wmComponent['closePopoverTimeout'] = setTimeout(() => { }, 1000);
            wmComponent['hidePopover'] = jest.fn();
            wmComponent['setFocusToPopoverLink'] = jest.fn();
            wmComponent['calculatePopoverPostion'] = jest.fn();
            wmComponent['triggerPopoverEvents'] = jest.fn();
            Object.defineProperty(wmComponent, 'eventManager', {
                value: { addEventListener: jest.fn().mockReturnValue(() => { }) }
            });

            (wmComponent as any).bsPopoverDirective = {
                hide: jest.fn()
            };

            (findRootContainer as jest.Mock).mockReturnValue('app-root');

            jest.useFakeTimers();
        });
        afterEach(() => {
            document.body.removeChild(mockPopoverContainer);
            jest.useRealTimers();
            jest.restoreAllMocks();
        });

        it('should not close existing active popover when it is a child popover', () => {
            const mockActivePopover = {
                autoclose: AUTOCLOSE_TYPE.ALWAYS,
                isClosingProgrammatically: false,
                close: jest.fn()
            };
            (global as any).activePopover = mockActivePopover;

            (global as any).$ = jest.fn().mockReturnValue(createJQueryMock(1));

            wmComponent.onShown();

            expect(mockActivePopover.close).not.toHaveBeenCalled();
            expect(mockActivePopover.isClosingProgrammatically).toBeFalsy();
        });

        it('should set CSS properties on popover container', () => {
            wmComponent.onShown();
            expect(setCSSFromObj).toHaveBeenCalledWith(mockPopoverContainer, {
                height: '100px',
                minWidth: '200px',
                width: '200px'
            });
        });

        it('should add hidden class to arrow when popoverarrow is false', () => {
            wmComponent.popoverarrow = false;
            wmComponent.onShown();
            expect(addClass).toHaveBeenCalledWith(mockArrowElement, 'hidden');
        });

        it('should set up hover interactions when interaction is hover', () => {
            wmComponent.interaction = 'hover';
            wmComponent.onShown();
            expect(mockPopoverContainer.onmouseenter).toBeDefined();
            expect(mockPopoverContainer.onmouseleave).toBeDefined();
            expect(mockAnchorElement.onmouseenter).toBeDefined();
            expect(mockAnchorElement.onmouseleave).toBeDefined();
        });

        it('should remove aria-describedby attribute from anchor element', () => {
            const removeAttributeSpy = jest.spyOn(mockAnchorElement, 'removeAttribute');
            wmComponent.onShown();
            jest.runAllTimers();
            expect(removeAttributeSpy).toHaveBeenCalledWith('aria-describedby');
        });

        it('should set up keyboard navigation', () => {
            wmComponent.onShown();

            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
            mockPopoverStartBtn.onkeydown(shiftTabEvent);
            expect((wmComponent as any).bsPopoverDirective.hide).toHaveBeenCalled();
            expect(wmComponent['setFocusToPopoverLink']).toHaveBeenCalled();
            expect(wmComponent.isOpen).toBe(false);

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
            mockPopoverEndBtn.onkeydown(tabEvent);
            expect((wmComponent as any).bsPopoverDirective.hide).toHaveBeenCalled();
            expect(wmComponent['setFocusToPopoverLink']).toHaveBeenCalled();
            expect(wmComponent.isOpen).toBe(false);
        });

        it('should set up autoclose behavior when autoclose is always', () => {
            wmComponent.autoclose = AUTOCLOSE_TYPE.ALWAYS;
            wmComponent.onShown();
            expect(mockPopoverContainer.onclick).toBeDefined();
        });

        it('should focus on popover start button', () => {
            const focusSpy = jest.spyOn(mockPopoverStartBtn, 'focus');
            wmComponent.onShown();
            jest.runAllTimers();
            expect(focusSpy).toHaveBeenCalled();
        });

        it('should calculate popover position when adaptiveposition is false', () => {
            wmComponent.onShown();
            jest.runAllTimers();
            expect(wmComponent['calculatePopoverPostion']).toHaveBeenCalledWith(mockPopoverContainer);
        });

        it('should trigger popover events', () => {
            wmComponent.onShown();
            jest.runAllTimers();
            expect(wmComponent['triggerPopoverEvents']).toHaveBeenCalled();
        });
    });

    describe('calculatePopoverPosition', () => {
        let mockElement: any;
        let mockWindow: any;

        beforeEach(() => {
            mockElement = {
                offset: jest.fn().mockReturnValue({ left: 100 }),
                find: jest.fn().mockReturnThis(),
                css: jest.fn(),
                0: { offsetWidth: 200 },
                length: 1
            };
            mockWindow = { width: jest.fn().mockReturnValue(1000) };

            (global as any).$ = jest.fn().mockImplementation((selector) => {
                if (selector === window) return mockWindow;
                return mockElement;
            });

            wmComponent.anchorRef = {
                nativeElement: {
                    getBoundingClientRect: jest.fn().mockReturnValue({
                        left: 50,
                        width: 100
                    })
                }
            };

            wmComponent['bsPopoverDirective'] = {
                _popover: {
                    _ngZone: {
                        onStable: {
                            subscribe: jest.fn(callback => callback())
                        }
                    }
                }
            };

            jest.spyOn(wmComponent as any, 'adjustPopoverArrowPosition').mockImplementation(() => { });
            jest.clearAllMocks();
        });

        it('should adjust position when popover is not visible on the left side', () => {
            mockElement.offset.mockReturnValue({ left: -10 });
            (wmComponent as any).calculatePopoverPostion(mockElement);

            expect(adjustContainerPosition).toHaveBeenCalledWith(mockElement, wmComponent['nativeElement'], wmComponent['bsPopoverDirective']._popover);
        });

        it('should adjust position when popover is not visible on the right side', () => {
            mockElement.offset.mockReturnValue({ left: 900 });
            (wmComponent as any).calculatePopoverPostion(mockElement);

            expect(adjustContainerRightEdges).toHaveBeenCalledWith(mockElement, wmComponent['nativeElement'], wmComponent['bsPopoverDirective']._popover);
        });

        it('should not adjust position when popover is fully visible', () => {
            mockElement.offset.mockReturnValue({ left: 100 });
            (wmComponent as any).calculatePopoverPostion(mockElement);

            expect(adjustContainerPosition).not.toHaveBeenCalled();
            expect(adjustContainerRightEdges).not.toHaveBeenCalled();
        });

        it('should handle different viewport widths', () => {
            mockWindow.width.mockReturnValue(500);
            mockElement.offset.mockReturnValue({ left: 400 });
            (wmComponent as any).calculatePopoverPostion(mockElement);

            expect(adjustContainerRightEdges).toHaveBeenCalled();
        });

        it('should adjust arrow position in certain cases', () => {
            mockElement.offset.mockReturnValue({ left: -10 });
            (wmComponent as any).calculatePopoverPostion(mockElement);

            expect(wmComponent['adjustPopoverArrowPosition']).toHaveBeenCalled();
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
