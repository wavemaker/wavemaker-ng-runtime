import { Element } from '@angular/compiler';

import { IDGenerator, updateTemplateAttrs } from '@wm/core';
import { getAttrMarkup, getBoundToExpr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('table_');

register('wm-table', (): IBuildTaskDef => {
    return {
        template: (node: Element, shared) => {
            // If table does not have child columns, set isdynamictable to true
            if (node.children.length) {
                const isColumnsPresent = node.children.some(childNode => {
                    return (<any>childNode).name === 'wm-table-column' || (<any>childNode).name === 'wm-table-column-group';
                });
                shared.set('isdynamictable', isColumnsPresent ? 'false' : 'true');
            } else {
                shared.set('isdynamictable', 'true');
            }

            const datasetAttr = node.attrs.find(attr => attr.name === dataSetKey);
            const widgetNameAttr = node.attrs.find(attr => attr.name === 'name');

            if (!datasetAttr) {
                return;
            }
            const boundExpr = getBoundToExpr(datasetAttr.value);

            if (!boundExpr) {
                return;
            }
            updateTemplateAttrs(node, boundExpr, widgetNameAttr.value, '', 'row');
        },
        pre: (attrs, shared) => {
            const counter = idGen.nextUid();
            shared.set('counter', counter);
            attrs.set('isdynamictable', shared.get('isdynamictable'));
            return `<${tagName} wmTable wmTableFilterSort wmTableCUD #${counter} data-identifier="table" role="table" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('table_reference', shared.get('counter'));
            provider.set('filtermode', attrs.get('filtermode'));
            provider.set('editmode', attrs.get('editmode'));
            provider.set('shownewrow', attrs.get('shownewrow'));
            return provider;
        }
    };
});

export default () => {};
