import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';

const tagName = 'div';

register('wm-alertdialog', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAlertDialog wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
