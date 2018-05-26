import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';

const tagName = 'div';
const idGen = new IDGenerator('table_');

register('wm-table', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
            const counter = idGen.nextUid();
            shared.set('counter', counter);
            return `<${tagName} wmTable wmTableFilterSort #${counter} data-identifier="table" role="table" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('table_reference', shared.get('counter'));
            provider.set('filtermode', attrs.get('filtermode'));
            return provider;
        }
    };
});

export default () => {};
