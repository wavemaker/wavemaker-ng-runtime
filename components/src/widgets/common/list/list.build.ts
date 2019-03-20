import { Element } from '@angular/compiler';
import { updateTemplateAttrs } from '@wm/core';

import { getAttrMarkup, getBoundToExpr, IBuildTaskDef, register } from '@wm/transpiler';

const wmListTag = 'wm-list';
const listTagName = 'div';
const dataSetKey = 'dataset';

register(wmListTag, (): IBuildTaskDef => {
    return {
        requires: ['wm-form', 'wm-liveform'],
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
        pre: (attrs, shared, parentForm, parentLiveForm) => {
            const parent = parentForm || parentLiveForm;
            shared.set('form_reference', parent && parent.get('form_reference'));
            return `<${listTagName} wmList wmLiveActions ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${listTagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('parent_form_reference', shared.get('form_reference'));
            return provider;
        }
    };
});

register('wm-listtemplate', (): IBuildTaskDef => {
    return {
        pre: () => `<ng-template #listTemplate let-item="item" let-$index="$index" let-itemRef="itemRef" let-$isFirst="$isFirst" let-$isLast="$isLast">`,
        post: () => `</ng-template>`
    };
});

export default () => {};
