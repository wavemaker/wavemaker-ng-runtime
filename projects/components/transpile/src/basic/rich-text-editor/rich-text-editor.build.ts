import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-richtexteditor', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRichTextEditor role="textbox" aria-label="${attrs.get('hint') || 'Richtext editor'}" ${getFormMarkupAttr(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
