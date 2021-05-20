import { Element } from '@angular/compiler';
import { IBuildTaskDef, getAttrMarkup, register, getBoundToExpr } from '@wm/transpiler';
import { IDGenerator, updateTemplateAttrs } from '@wm/core';

const tagName = 'div';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('wm_tabs_ref_');

const isDynamicTabs = node => node.attrs.find(attr => attr.name === 'type' && attr.value === 'dynamic');

register('wm-tabs', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
            // generating unique Id for the tabs
            const counter = idGen.nextUid();
            shared.set('tabs_ref', counter);
            return `<${tagName} wmTabs #${counter}="wmTabs" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`,
        template: (node: Element, shared) => {
            // check if the tab widget is dynamic
            if (isDynamicTabs(node)) {
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
        // To provide parent tab reference for children
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('tabs_ref', shared.get('tabs_ref'));
            return provider;
        }
    };
});

export default () => {};
