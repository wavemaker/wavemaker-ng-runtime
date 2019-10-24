import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { IDGenerator } from '@wm/core';

const tagName = 'div';
const idGen = new IDGenerator('liveform_dialog_id_');

register('wm-livetable', (): IBuildTaskDef => {
    return {
        pre: (attrs, shared) => {
            const counter = idGen.nextUid();
            shared.set('counter', counter);
            return `<${tagName} wmLiveTable role="table" ${getAttrMarkup(attrs)} dialogid="${counter}">`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('liveform_dialog_id', shared.get('counter'));
            return provider;
        },
        imports: [{
            from: '@wm/components/data/live-table',
            name: 'LiveTableModule'
        }, {
            from: '@wm/components/data/table',
            name: 'TableModule'
        }]
    };
});

export default () => {};
