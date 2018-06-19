import { Element } from '@angular/compiler';

import { getAttrMarkup, getBoundToExpr, IBuildTaskDef, register } from '@wm/transpiler';

declare const _;

const tagName = 'div';

const getAttr = (node: Element, attrName: string) => node.attrs.find(attr => attr.name === attrName);

const getAttrValue = (node: Element, attrName: string): string | undefined => {
    const match = getAttr(node, attrName);
    if (match) {
        return match.value;
    }
};

const getReplaceRegex = (v: string) => new RegExp(`bind:(${v}|${v}\\[\\$i])\\.`, 'g');

register('wm-progress', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            const dataset = getAttrValue(node, 'dataset');
            const boundExpr = getBoundToExpr(dataset);

            if (boundExpr) {
                let type = getAttrValue(node, 'type');
                let datavalue = getAttrValue(node, 'datavalue');

                const replaceRegex = getReplaceRegex(boundExpr);

                if (type.includes(boundExpr)) {
                    type = type.replace(replaceRegex, '');
                    getAttr(node, 'type').value = type;
                }

                if (datavalue.includes(boundExpr)) {
                    datavalue = datavalue.replace(replaceRegex, '');
                    getAttr(node, 'datavalue').value = datavalue;
                }
            }
        },
        pre: attrs => `<${tagName} wmProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
