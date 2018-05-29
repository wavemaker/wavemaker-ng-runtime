import { Attribute, Element } from '@angular/compiler';

import { getAttrMarkup, getBoundToExpr, IBuildTaskDef, register } from '@wm/transpiler';

const wmListTag = 'wm-list';
const listTagName = 'div';
const dataSetKey = 'dataset';

register(wmListTag, (): IBuildTaskDef => {
    return {
        template: (node: Element) => {

            const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);

            if (!datasetAttr) {
                return;
            }
            const boundExpr = getBoundToExpr(datasetAttr.value);

            if (!boundExpr) {
                return;
            }

            // replace bound attrs with item
            const replaceBind = (children: Array<Element> = []) => {
                children.forEach((childNode: Element) => {
                    if (childNode.name) {
                        replaceBind(childNode.children as Array<Element>);
                        // return if the child Element is of wm-list .
                        childNode.attrs.forEach((attr: Attribute) => {
                            if (attr.value.startsWith(`bind:${boundExpr}`)) {
                                attr.value = attr.value.replace(boundExpr, 'item');
                            }
                        });
                    }
                });
            };
            replaceBind(node.children as Array<Element>);
        },
        pre: (attrs) => `<${listTagName} wmList ${getAttrMarkup(attrs)}>`,
        post: () => `</${listTagName}>`
    };
});

register('wm-listtemplate', (): IBuildTaskDef => {
    return {
        pre: () => `<ng-template #listTemplate let-item="item">`,
        post: () => `</ng-template>`
    };
});

export default () => {};
