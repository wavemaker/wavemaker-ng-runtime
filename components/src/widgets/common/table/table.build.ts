import { Element } from '@angular/compiler';

import { IDGenerator } from '@wm/core';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';
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
