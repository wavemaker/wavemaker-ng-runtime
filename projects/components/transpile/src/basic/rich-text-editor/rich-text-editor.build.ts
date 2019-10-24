import { getFormMarkupAttr, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-richtexteditor', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmRichTextEditor role="textbox" ${getFormMarkupAttr(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/basic/rich-text-editor',
            name: 'RichTextEditorModule'
        }]
    };
});

export default () => {};
