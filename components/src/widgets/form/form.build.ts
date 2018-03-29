import { getAttrMarkup, register } from '@wm/transpiler';
import { idMaker } from '@wm/utils';

const tagName = 'form';
const idGen = idMaker('form_');

const buildTask = (isLiveForm?) => {
    return {
        pre: (attrs, shared) => {
            const tmpl = getAttrMarkup(attrs);
            const counter = idGen.next().value;
            const liveFormAttr = isLiveForm ? 'wmLiveForm' : '';
            shared.set('counter', counter);
            return `<${tagName} wmForm ${liveFormAttr} #${counter} ngNativeValidate [formGroup]="${counter}.ngForm" [noValidate]="${counter}.validationtype !== 'html'"
                        [ngClass]="${counter}.captionAlignClass" ${tmpl}>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set('form_reference', shared.get('counter'));
            return provider;
        }
    };
};

register('wm-form', buildTask);
register('wm-liveform', () => buildTask(true));

export default () => {};
