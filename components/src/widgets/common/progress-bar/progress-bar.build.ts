import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { Element } from '@angular/compiler';

declare const _;

const tagName = 'div';

const getAttr = (node: Element, attrName: string) => node.attrs.find(attr => attr.name === attrName);

const getAttrValue = (node: Element, attrName: string): string | undefined => {
    const match = getAttr(node, attrName);
    if (match) {
        return match.value;
    }
};

const isBound = v => _.startsWith(v, 'bind:');

const getBoundExpr = v => v.substr(5);

const getReplaceRegex = (v: string) => new RegExp(`bind:(${v}|${v}\\[\\$i])\\.`, 'g');

register('wm-progress', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            const dataset = getAttrValue(node, 'dataset');

            if (isBound(dataset)) {
                const boundExpr = getBoundExpr(dataset);

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
