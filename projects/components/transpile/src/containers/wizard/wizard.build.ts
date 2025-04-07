import {getAttrMarkup, getBoundToExpr, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator, updateTemplateAttrs} from "@wm/core";
import {Element} from "@angular/compiler";

const tagName = 'div';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('wm_wizard_ref_');

const isDynamicWizard = node => node.attrs.find(attr => attr.name === 'type' && attr.value === 'dynamic');

register('wm-wizard', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
            const counter = idGen.nextUid();
            shared.set('wizard_ref', counter);
            return `<${tagName} wmWizard #${counter}="wmWizard" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`,
        template: (node: Element, shared) => {
            // check if the tab widget is dynamic
            if (isDynamicWizard(node)) {
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
            provider.set('wizard_ref', shared.get('wizard_ref'));
            return provider;
        }
    };
});

export default () => {};
