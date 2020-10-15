import { Attribute, Element } from '@angular/compiler';

import { IDGenerator, updateTemplateAttrs } from '@wm/core';
import { getAttrMarkup, getBoundToExpr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';
const dataSetKey = 'dataset';
const idGen = new IDGenerator('table_');
let columnIndex = 0;

/**
 * This method assigns index to the table-column and column-groups in order to the maintain the columns in the same order
 * as specified in the configuration.
 * Scenario: ordering the columns when accessrole is specified on column.
 *
 * headerIndex:    ID  |      Name        |   Street  |  ==> top level header (ID has index 0, Name 1, Street 2)
 * index:         ---- |  fname | lname    |   ---    |  ==> sub level header ( ID 0, fname 1, lname 2, Street 3)
 * fname will have headerIndex as 1 and colIndex as 1. lname will have headerIndex as 1 and columnIndex as 2.
 * If suppose we have a group in the sub-level-header, then col index will be treated as the header index.
 *
 */
function assignColumnIndex(node, parentIndex?: number) {
    let headerIndex = 0;
    node.forEach((childNode) => {
        const nodeName = (<any>childNode).name;
        const newheaderIndex = parentIndex !== undefined ? parentIndex : headerIndex;
        if (nodeName === 'wm-table-column' || nodeName === 'wm-table-column-group') {
            (childNode as any).attrs.push(new Attribute('index', '' + columnIndex, <any>1, <any>1));
            (childNode as any).attrs.push(new Attribute('headerIndex', '' + newheaderIndex, <any>1, <any>1));
            if (nodeName === 'wm-table-column-group') {
                assignColumnIndex(childNode.children, headerIndex);
            }
            columnIndex++;
            headerIndex++;
        }
    });
}

register('wm-table', (): IBuildTaskDef => {
    return {
        template: (node: Element, shared) => {
            // If table does not have child columns, set isdynamictable to true
            if (node.children.length) {
                const isColumnsPresent = node.children.some(childNode => {
                    return (<any>childNode).name === 'wm-table-column' || (<any>childNode).name === 'wm-table-column-group';
                });
                assignColumnIndex(node.children);
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
            return `<${tagName} wmTable="${counter}" wmTableFilterSort wmTableCUD #${counter} data-identifier="table" role="table" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('table_reference', shared.get('counter'));
            provider.set('filtermode', attrs.get('filtermode'));
            provider.set('errorstyle', attrs.get('errorstyle'));
            provider.set('editmode', attrs.get('editmode'));
            provider.set('shownewrow', attrs.get('shownewrow'));
            return provider;
        }
    };
});

export default () => {};
