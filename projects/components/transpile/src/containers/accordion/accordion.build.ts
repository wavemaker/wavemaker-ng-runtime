import { Element } from '@angular/compiler';
import { IBuildTaskDef, getAttrMarkup, register, getBoundToExpr } from '@wm/transpiler';
import { IDGenerator, updateTemplateAttrs } from '@wm/core';

const tagName = 'div';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('wm_accordion_ref_');

const isDynamicAccordion = node => node.attrs.find(attr => attr.name === 'type' && attr.value === 'dynamic');

register('wm-accordion', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
            // generating unique Id for the accordion
            const counter = idGen.nextUid();
            shared.set('accordion_ref', counter);
            return `<${tagName} wmAccordion #${counter}="wmAccordion" role="tablist" aria-multiselectable="true" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`,
        template: (node: Element, shared) => {
            // check if the accordion is dynamic
            if (isDynamicAccordion(node)) {
                const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);
                const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');

                if (!datasetAttr) {
                    return;
                }
                const boundExpr = getBoundToExpr(datasetAttr.value);

                if (!boundExpr) {
                    return;
                }
                updateTemplateAttrs(node, boundExpr, widgetNameAttr.value);
            }
        },
        // To provide parent accordion reference for children
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('accordion_ref', shared.get('accordion_ref'));
            return provider;
        }
    };
});

export default () => {};
