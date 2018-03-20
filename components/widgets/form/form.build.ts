import { getAttrMarkup, register } from '@transpiler/build';
import { idMaker } from '@utils/utils';

const tagName = 'form';
const idGen = idMaker('form_');

register('wm-form', () => {
    return {
        pre: (attrs, shared) => {
            const tmpl = getAttrMarkup(attrs);
            const counter = idGen.next().value;
            shared.set('counter', counter);
            return `<${tagName} wmForm #${counter}  ngNativeValidate [formGroup]="${counter}._ngForm" [noValidate]="${counter}.validationtype !== 'html'"
                        [ngClass]="${counter}.captionAlignClass" ${tmpl}>`;
        },
        post: () => {
            return `</${tagName}>`;
        },
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
});

export default () => {};
