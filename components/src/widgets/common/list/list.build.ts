import { Element } from '@angular/compiler';
import { updateTemplateAttrs } from '@wm/core';

import { getAttrMarkup, getBoundToExpr, IBuildTaskDef, register } from '@wm/transpiler';

const wmListTag = 'wm-list';
const listTagName = 'div';
const dataSetKey = 'dataset';

register(wmListTag, (): IBuildTaskDef => {
    return {
        template: (node: Element) => {

            const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);
            const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');

            if (!datasetAttr) {
                return;
            }
            const boundExpr = getBoundToExpr(datasetAttr.value);

            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, 'itemRef.');
        },
        pre: (attrs) => `<${listTagName} wmList ${getAttrMarkup(attrs)}>`,
        post: () => `</${listTagName}>`
    };
});

register('wm-listtemplate', (): IBuildTaskDef => {
    return {
        pre: () => `<ng-template #listTemplate let-item="item" let-index="index" let-itemRef="itemRef">`,
        post: () => `</ng-template>`
    };
});

export default () => {};
