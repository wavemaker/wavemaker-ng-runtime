import { getAttrMarkup, register } from '@wm/transpiler';
import { idMaker } from '@wm/utils';

const tagName = 'form';
const idGen = idMaker('liveform_');

register('wm-liveform', () => {
    return {
        pre: (attrs, shared) => {
            const tmpl = getAttrMarkup(attrs);
            const counter = idGen.next().value;
            shared.set('counter', counter);
            return `<${tagName} wmForm #${counter}  ngNativeValidate [formGroup]="${counter}.ngForm" [noValidate]="${counter}.validationtype !== 'html'"
                        [ngClass]="${counter}.captionAlignClass" ${tmpl}>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
});

export default () => {};
