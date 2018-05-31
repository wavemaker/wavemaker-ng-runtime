import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-menu', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} dropdown [isOpen]="isOpen" [autoClose]="autoclose !== 'disabled'" wmMenu ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
