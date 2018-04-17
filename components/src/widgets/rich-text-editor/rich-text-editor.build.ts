import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-richtexteditor', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRichTextEditor role="input" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
