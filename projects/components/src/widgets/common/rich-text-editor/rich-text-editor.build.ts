import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-richtexteditor', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRichTextEditor role="textbox" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
