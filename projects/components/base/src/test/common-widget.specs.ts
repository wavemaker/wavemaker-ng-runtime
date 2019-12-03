/*global describe, it, WM, beforeEach, expect, module, inject, _, parseInt, document, Hammer*/

import {async} from '@angular/core/testing';
import * as _ from '../../../../../node_modules/lodash/lodash.min';
import {isBooleanAttr, isDimensionProp} from "../widgets/framework/constants";
import {toDimension} from "../../../../core/src/utils/dom";
import {compileTestComponent} from "./util/component-test-util";

// TODO: Pending basic common Events, basic touch events, dialog events and properties

export interface ITestModuleDef {
    imports: Array<any>,
    declarations: Array<any>,
    providers?: Array<any>
}

export interface ITestComponentDef {
    $unCompiled: JQuery<HTMLElement>;
    type: string;
    widgetSelector: string;
    inputElementSelector?: string;
    testModuleDef: ITestModuleDef;
    testComponent: any,
    PropertiesToBeExcluded?: Array<string>
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
    private rgbToHex (rgbColor) {
        rgbColor = rgbColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ('0' + parseInt(x, 10).toString(16)).slice(-2);
        }
        return '#' + hex(rgbColor[1]) + hex(rgbColor[2]) + hex(rgbColor[3]);
    }

    /**
     * verifies whether the attributes specified in the markup are properly updated in the component scope
     */
    public verifyPropsInitialization(): void {
        describe(this.widgetDef.type + ': Property initialization test', () => {
            let component,
                fixture,
                widgetProps,
                widgetAttr = _.replace(this.widgetDef.type, '-', ''),
                propsExcluded = this.widgetDef.PropertiesToBeExcluded ? this.widgetDef.PropertiesToBeExcluded : [];
            propsExcluded.push(widgetAttr);

            beforeEach(async(()=> {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                fixture.detectChanges();
            }));
            let count = 0;

            // iterate through all the attributes specified in the markup and verify them against corresponding iScope properties
            _.forEach(this.widgetDef.$unCompiled[0].attributes, (attr) => {
                let attrName = attr.name,
                    attrValue = attr.value,
                    processedAttrValue = attrValue;

                // ignore the event related attributes and attributes having hyphen(-) in them(custom attrs)
                if (attr.name.indexOf('.event') !== -1 || attr.name.indexOf('on-') === 1 || attr.name.indexOf('-') !== -1 || propsExcluded.indexOf(attrName) !== -1) {
                    return;
                }

                it('"' + attrName + '" should be on the widget with value as: ' + processedAttrValue, () => {
                    let attrProps = widgetProps.get(attrName) || {};
                    //console.log(++count, ' checking', attrName, ' of type', attrProps.type, ' for value', processedAttrValue)

                    // convert the type of the attr.value and compare with its corresponding iScope property
                    if (attrProps.type === 1) {
                        if (isBooleanAttr(attrName)) {
                            processedAttrValue = attrValue === attrName || attrValue === true || attrValue === 'true';
                        } else {
                            processedAttrValue = attrValue === true || attrValue === 'true';
                        }
                    } else if (isBooleanAttr(attrName)) {
                        processedAttrValue = attrValue === attrName || attrValue === true || attrValue === 'true';
                    } else if (attrProps.type === 2) {
                        processedAttrValue = +attrValue;
                    }

                    // dimension properties like height, width, etc
                    if (isDimensionProp(attrName)) {
                        processedAttrValue = toDimension(processedAttrValue);
                    }


                    expect(component[attrName]).toBe(processedAttrValue);
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
                $inputEl,
                widgetAttr = _.replace(this.widgetDef.type, '-', ''),
                propsExcluded = this.widgetDef.PropertiesToBeExcluded ? this.widgetDef.PropertiesToBeExcluded : [];
            propsExcluded.push(widgetAttr);

            beforeEach(async(()=> {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                $element = fixture.nativeElement.querySelector(this.widgetDef.widgetSelector);
                fixture.detectChanges();
                $inputEl = this.widgetDef.inputElementSelector ? fixture.nativeElement.querySelector(this.widgetDef.inputElementSelector) : $element;
            }));

            // check for name property
            if(propsExcluded.indexOf('name') < 0) {
                it('should have given name', () => {
                    if (!widgetProps.get('name')) {
                        return;
                    }
                    expect($element.getAttribute('name')).toBe(component.name);
                });
            }

            // check for class property
            if(propsExcluded.indexOf('class') < 0) {
                it('"class" should be applied"', () => {
                    if (!widgetProps.get('class')) {
                        return;
                    }
                    let classValue = component.class;
                    if (classValue) {
                        expect($element.classList).toContain(classValue);
                    }
                });
            }

            // check for show property
            if(propsExcluded.indexOf('show') < 0) {
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
            }

            // check for hint property
            if(propsExcluded.indexOf('hint') < 0) {
                it('"hint" property change should be reflected', async(() => {
                    if (!widgetProps.get('hint')) {
                        return;
                    }
                    expect($element.getAttribute('title')).toBe(component.getWidget().hint);
                    component.getWidget().hint = 'updated';
                    fixture.detectChanges();
                    setTimeout(()=>{
                        expect($element.getAttribute('title')).toBe(component.getWidget().hint);
                    },200);
                }));
            }

            // check for tab index property
            if(propsExcluded.indexOf('tabindex') < 0) {
                it('"tabindex" should work', () => {
                    if (!widgetProps.get('tabindex')) {
                        return;
                    }
                    let givenTabindex = this.widgetDef.$unCompiled.attr('tabindex');
                    expect($inputEl.getAttribute('tabindex')).toBe(givenTabindex);
                });
            }

            // check for badge value property
            if(propsExcluded.indexOf('badgevalue') < 0) {
                it('"badgevalue" should work', () => {
                    if (!widgetProps.get('badgevalue')) {
                        return;
                    }
                    expect($element.getAttribute('badgevalue')).toBe(component.badgevalue);
                });
            }
        });
    }

    /**
     * This function tests for style properties applicable for a widget
     */
    public verifyStyles(isDialog?: boolean):void {
        describe(this.widgetDef.type + ': Styles verification :', () => {

            let component,
                fixture,
                widgetProps,
                widgetAttr = _.replace(this.widgetDef.type, '-', ''),
                propsExcluded = this.widgetDef.PropertiesToBeExcluded ? this.widgetDef.PropertiesToBeExcluded : [];
            propsExcluded.push(widgetAttr);

            beforeEach(async(() => {
                fixture = compileTestComponent(this.widgetDef.testModuleDef, this.widgetDef.testComponent);
                component = fixture.componentInstance.wmComponent;
                widgetProps = component.widgetProps;
                fixture.detectChanges();
            }));

            // check for width and height properties
            // TODO
            // This has to refactor for dialogues
            if(!isDialog) {
                _.forEach(['width', 'height'], (cssName) => {
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
            _.forEach(['fontSize',
                'fontWeight',
                'fontStyle',
                'fontFamily',
                'textDecoration',
                'textAlign',
                'color',
                'whiteSpace',
                'backgroundColor',
                'backgroundImage',
                'backgroundRepeat',
                'backgroundPosition',
                'backgroundSize',
                'backgroundAttachment',
                'borderColor',
                'borderWidth',
                'borderStyle',
                'opacity',
                'cursor',
                'zIndex',
                'visibility',
                'display',
                'padding',
                'margin'
            ], (prop) => {
                let cssName, propName, initValue, cssValue;
                if (_.isObject(prop)) {
                    cssName = prop.cssName;
                    propName = prop.wmPropName;
                } else {
                    cssName = prop;
                    propName = cssName.toLowerCase();
                }

                // if (!widgetProps[propName]) {
                //     return;
                // }

                it(prop + ': should be applied', () => {
                    initValue = this.widgetDef.$unCompiled.attr(propName);
                    cssValue = component.$element.css(cssName);
                    if (cssName === 'backgroundImage') {
                        initValue = 'url("' + initValue + '")';
                    } else if (cssName === 'fontSize') {
                        initValue = +(initValue);
                        let fontUnit = this.widgetDef.$unCompiled.attr('fontunit') || 'px';
                        initValue = initValue + fontUnit;
                    } else if (cssName === 'fontFamily') {
                        initValue = '"' + initValue + '"';
                    } else if (cssName === 'color' || cssName === 'backgroundColor' || cssName === 'borderColor') {
                        initValue = initValue ? initValue.toLowerCase() : '';
                        cssValue = this.rgbToHex(component.$element.css(cssName)).toLowerCase();
                    } else if (cssName === 'backgroundPosition') {
                        // TODO: write logic to compute background position based on value. Now hardcoding for 'left'
                        initValue = '0% 50%';
                    } else if (cssName === 'textDecoration') {
                        // if text decoration is just assigned as 'underline' css value is still 'underline solid rgba(0, 0, 255)'. so compare only first value
                        initValue = (initValue || '').split(' ').shift();
                        cssValue = (cssValue || '').split(' ').shift();
                    }
                    //console.log(cssName, cssValue, initValue);
                    if (initValue) {
                        expect(cssValue).toBe(initValue);
                    }
                });
            });
        });
    }
}
