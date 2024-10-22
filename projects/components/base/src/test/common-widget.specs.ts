/*global describe, it, WM, beforeEach, expect, module, inject, _, parseInt, document, Hammer*/

import {waitForAsync} from '@angular/core/testing';
import {isBooleanAttr, isDimensionProp} from '../widgets/framework/constants';
import {toDimension} from '../../../../core/src/utils/dom';
import {compileTestComponent, getHtmlSelectorElement} from './util/component-test-util';
import {forEach, isObject, replace} from "lodash-es";

// TODO: Pending basic common Events, basic touch events, dialog events and properties

export interface ITestModuleDef {
    imports: Array<any>,
    declarations: Array<any>,
    providers?: Array<any>,
    teardown?: any
}

export interface ITestComponentDef {
    $unCompiled: JQuery<HTMLElement>;
    type: string;
    widgetSelector: string;
    inputElementSelector?: string;
    testModuleDef: ITestModuleDef;
    testComponent: any
}

export class ComponentTestBase {
    private widgetDef: ITestComponentDef;

    constructor(widgetDef: ITestComponentDef) {
        this.widgetDef = widgetDef;
    }

    /**
     * util function to convert rgb color code to hex
     * @param rgbColor, rgb color expression
     */
    private rgbToHex(rgbColor: string) {
        // Check if the input is already in hex format
        if (rgbColor.match(/^#[0-9a-fA-F]{6}$/)) {
            return rgbColor;
        }
        // Match RGB format and convert to hex
        const match = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) {
            throw new Error("Invalid RGB color format");
        }
        function hex(x: string) {
            return ('0' + parseInt(x, 10).toString(16)).slice(-2);
        }
        return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
    }

    /**
     * verifies whether the attributes specified in the markup are properly updated in the component scope
     */
    public verifyPropsInitialization(): void {
        describe(this.widgetDef.type + ': Property initialization test', () => {
            let component,
                fixture,
                widgetProps,
                widgetAttr = replace(this.widgetDef.type, '-', '');

            beforeEach(waitForAsync(() => {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                fixture.detectChanges();
            }));
            let count = 0;
            // iterate through all the attributes specified in the markup and verify them against corresponding iScope properties
            forEach(this.widgetDef.$unCompiled[0].attributes, (attr) => {
                let attrName = attr.name,
                    attrValue = attr.value,
                    processedAttrValue = attrValue;

                // ignore the event related attributes and attributes having hyphen(-) in them(custom attrs) and attributes which do not have value
                let ignoredAttrsMeta = ['.event', 'on-', '-', '#', widgetAttr];
                let attrResult = ignoredAttrsMeta.find(el => (el === attrName || attrName.indexOf(el) >= 0));
                if (!attrValue || attrResult) {
                    return;
                }

                it('"' + attrName + '" should be on the widget with value as: ' + processedAttrValue, () => {
                    let attrProps = widgetProps.get(attrName) || {};
                    // console.log(++count, ' checking', attrName, ' of type', attrProps.type, ' for value', processedAttrValue)

                    // convert the type of the attr.value and compare with its corresponding iScope property
                    if (attrProps.type === 1) {
                        if (isBooleanAttr(attrName)) {
                            processedAttrValue = (attrValue === attrName || Boolean(attrValue) === true || attrValue === 'true').toString();
                        } else {
                            processedAttrValue = (Boolean(attrValue) === true || attrValue === 'true').toString();
                        }
                    } else if (isBooleanAttr(attrName)) {
                        processedAttrValue = (attrValue === attrName || Boolean(attrValue) === true || attrValue === 'true').toString();
                    } else if (attrProps.type === 2) {
                        processedAttrValue = (+attrValue).toString();
                    }

                    // dimension properties like height, width, etc
                    if (isDimensionProp(attrName)) {
                        processedAttrValue = (toDimension(processedAttrValue)).toString();
                    }

                    if (attr.name == 'container') {
                        attrName = 'containerTarget';
                    }
                    expect(component[attrName].toString()).toBe(processedAttrValue);
                });

            });
        });
    }

    /**
     * This method tests for common properties(name, class, show, hint) on any widget
     * TODO: decide whether to check for property through widgetProps or through PropertiesToBeExcluded array. I'd prefer the former.
     */
    public verifyCommonProperties(): void {
        describe(this.widgetDef.type + ': Common properties test: ', () => {

            let component,
                fixture,
                widgetProps,
                $element,
                $inputEl;

            beforeEach(waitForAsync(() => {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                $element = fixture.nativeElement.querySelector(this.widgetDef.widgetSelector);
                fixture.detectChanges();
                $inputEl = this.widgetDef.inputElementSelector ? fixture.nativeElement.querySelector(this.widgetDef.inputElementSelector) : $element;
            }));

            // check for name property
            it('should have given name', () => {
                if (!widgetProps.get('name')) {
                    return;
                }
                expect($element.getAttribute('name')).toBe(component.name);
            });

            // check for class property
            it('"class" should be applied"', () => {
                if (!widgetProps.get('class')) {
                    return;
                }
                let classValue = component.class;
                if (classValue) {
                    expect($element.classList).toContain(classValue);
                }
            });

            // check for show property
            it('"show" property change should reflect on the root element', () => {
                if (!widgetProps.get('show')) {
                    return;
                }
                const isShowDefined = this.widgetDef.$unCompiled[0].attributes.hasOwnProperty('show'),
                    initShowValue = isShowDefined ? component.getWidget().show : true;

                expect($element.hasAttribute('hidden')).not.toBe(initShowValue);

                component.getWidget().show = true;
                fixture.detectChanges();
                expect($element.hasAttribute('hidden')).toBe(false);

                component.getWidget().show = false;
                fixture.detectChanges();
                expect($element.hasAttribute('hidden')).toBe(true);
            });

            // check for hint property
            it('"hint" property change should be reflected', done => {
                if (!widgetProps.get('hint')) {
                    done();
                    return;
                }
                expect($element.getAttribute('title')).toBe(component.getWidget().hint);
                component.getWidget().hint = 'updated';
                fixture.detectChanges();
                setTimeout(() => {
                    expect($element.getAttribute('title')).toBe(component.getWidget().hint);
                    done();
                }, 200);
            });

            // check for placeholder property
            it('"placeholder" property change should be reflected', done => {
                if (!widgetProps.get('placeholder')) {
                    done();
                    return;
                }
                expect($inputEl.getAttribute('placeholder')).toBe(component.getWidget().placeholder);
                component.getWidget().placeholder = 'updated';
                fixture.detectChanges();
                setTimeout(() => {
                    expect($inputEl.getAttribute('placeholder')).toBe(component.getWidget().placeholder);
                    done();
                }, 200);
            });

            // check for tab index property
            it('"tabindex" should work', () => {
                if (!widgetProps.get('tabindex') || (component.hint === 'Progress bar' || component.hint === 'audio')) {
                    return;
                }
                let givenTabindex = this.widgetDef.$unCompiled.attr('tabindex');
                expect($inputEl.getAttribute('tabindex')).toBe(givenTabindex);
            });

            // check for badge value property
            it('"badgevalue" should work', () => {
                if (!widgetProps.get('badgevalue')) {
                    return;
                }
                expect($element.getAttribute('badgevalue')).toBe(component.badgevalue);
            });


        });
    }

    /**
     * This function tests for style properties applicable for a widget
     */
    public verifyStyles(isDialog?: boolean): void {
        describe(this.widgetDef.type + ': Styles verification :', () => {

            let component,
                fixture,
                widgetProps;

            beforeEach(waitForAsync(() => {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                fixture.detectChanges();
            }));

            // check for width and height properties
            // TODO
            // This has to refactor for dialogues
            if (!isDialog) {
                forEach(['width', 'height'], (cssName) => {
                    // check if property is given
                    const propName = cssName.toLowerCase();
                    if (!this.widgetDef.$unCompiled.attr(propName)) {
                        return;
                    }

                    // check if valid value is given
                    const initValue = +(this.widgetDef.$unCompiled.attr(propName));
                    if (isNaN(initValue)) {
                        return;
                    }

                    it('should have given ' + cssName, () => {
                        expect(component.$element.css(cssName)).toBe(initValue + 'px');
                    });
                });
            }

            // check com
            forEach(['fontsize',
                'fontweight',
                'fontstyle',
                'fontfamily',
                'textdecoration',
                'textalign',
                'color',
                'whitespace',
                'backgroundcolor',
                'backgroundimage',
                'backgroundrepeat',
                'backgroundposition',
                'backgroundsize',
                'backgroundattachment',
                'bordercolor',
                'borderwidth',
                'borderstyle',
                'opacity',
                'overflow',
                'cursor',
                'zindex',
                'visibility',
                'display',
                'padding',
                'margin'
            ], (prop) => {
                let cssName, propName, initValue, cssValue;
                if (isObject(prop)) {
                    cssName = prop[cssName];
                    propName = prop[propName];
                } else {
                    cssName = prop;
                    propName = cssName.toLowerCase();
                }

                it(prop + ': should be applied', () => {
                    initValue = this.widgetDef.$unCompiled.attr(propName);
                    cssValue = component.$element[0].widget[cssName];
                    // console.log(cssValue, 'vss*****');
                    if (initValue) {
                        if (cssName === 'backgroundimage') {
                            initValue = initValue
                            // Normalize cssValue to ensure it matches the format of initValue
                            const normalizeUrl = (url) => url.replace(/^url\("?|"?\)$/g, 'url("').replace('")', '")');
                            expect(normalizeUrl(cssValue)).toBe(normalizeUrl(initValue));
                        } else if (cssName === 'fontsize') {
                            initValue = +(initValue);
                            let fontUnit = this.widgetDef.$unCompiled.attr('fontunit') || 'px';
                            initValue = initValue + fontUnit;
                            expect(cssValue + fontUnit).toBe(initValue);
                        } else if (cssName === 'fontfamily') {
                            // Strip quotes from initValue for comparison
                            initValue = initValue.replace(/^"|"$/g, '');
                            expect(cssValue).toBe(initValue);
                        } else if (cssName === 'color' || cssName === 'backgroundcolor' || cssName === 'bordercolor') {
                            initValue = initValue ? initValue.toLowerCase() : '';
                            cssValue = this.rgbToHex(cssValue).toLowerCase();
                            expect(cssValue).toBe(initValue);
                        } else if (cssName === 'backgroundposition') {
                            // TODO: write logic to compute background position based on value. Now hardcoding for 'left'
                            initValue = 'left';
                            expect(cssValue).toBe(initValue);
                        } else if (cssName === 'textdecoration') {
                            // if text decoration is just assigned as 'underline' css value is still 'underline solid rgba(0, 0, 255)'. so compare only first value
                            initValue = (initValue || '').split(' ').shift();
                            cssValue = (cssValue || '').split(' ').shift();
                            expect(cssValue).toBe(initValue);
                        } else {
                            expect(cssValue).toBe(initValue);
                        }
                    }
                });
            });
        });
    }


    public verifyEvents(eventList: Array<any>): void {


        describe(this.widgetDef.type + ': Common mouse events test: ', () => {

            let component,
                fixture,
                widgetProps,
                $element,
                $inputEl;

            beforeEach((() => {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                fixture.detectChanges();
            }));

            forEach(eventList, (evtObj) => {

                if (evtObj.clickableEle) {
                    it('Should trigger the ' + evtObj.eventName + ' event', waitForAsync(() => {
                        // fixture.whenStable().then(() => {
                        let eleControl = getHtmlSelectorElement(fixture, evtObj.clickableEle);
                        eleControl.nativeElement.click();
                        fixture.whenStable().then(() => {
                            jest.spyOn(fixture.componentInstance, evtObj.callbackMethod);
                            expect(fixture.componentInstance[evtObj.callbackMethod]).toHaveBeenCalledTimes(1);
                        });
                        // });
                    }))
                } else if (evtObj.mouseSelectionEle) {
                    it('Should trigger the ' + evtObj.eventName + ' event', (() => {
                        fixture.whenStable().then(() => {
                            jest.spyOn(fixture.componentInstance, evtObj.callbackMethod);
                            let eleControl = getHtmlSelectorElement(fixture, evtObj.mouseSelectionEle);
                            eleControl.nativeElement.dispatchEvent(new MouseEvent(evtObj.eventName));
                            expect(fixture.componentInstance[evtObj.callbackMethod]).toHaveBeenCalledTimes(1);
                        });
                    }));
                } else if (evtObj.eventTrigger) {
                    it('Should trigger the ' + evtObj.eventName + ' event', waitForAsync(() => {
                        fixture.whenStable().then(() => {
                            jest.spyOn(fixture.componentInstance, evtObj.callbackMethod);
                            let eleControl = getHtmlSelectorElement(fixture, evtObj.eventTrigger);
                            eleControl.triggerEventHandler(evtObj.eventName, {});
                            expect(fixture.componentInstance[evtObj.callbackMethod]).toHaveBeenCalledTimes(1);
                        });
                    }));
                }

            })

        });

    }

    public verifyAccessibility(): void {
        describe(this.widgetDef.type + ': Accessibility tests: ', () => {

            let component,
                fixture,
                widgetProps,
                $element,
                $inputEl;

            beforeEach(waitForAsync(() => {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                $element = fixture.nativeElement.querySelector(this.widgetDef.widgetSelector);
                fixture.detectChanges();
                $inputEl = this.widgetDef.inputElementSelector ? fixture.nativeElement.querySelector(this.widgetDef.inputElementSelector) : $element;
            }));

            it(this.widgetDef.type + ': aria-label should not be empty without arialabel property', () => {
                if (!widgetProps.get('arialabel')) {
                    return;
                }
                expect($inputEl.getAttribute('aria-label')).toBeDefined();
            });

            it(this.widgetDef.type + ': aria-label property change should be reflected based on arialabel', () => {
                if (!widgetProps.get('arialabel')) {
                    return;
                }
                component.getWidget().arialabel = 'updated aria-label';
                fixture.detectChanges();
                expect($inputEl.getAttribute('aria-label')).toBe('updated aria-label');
            });
        });
    }
}
