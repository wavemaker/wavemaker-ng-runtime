import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'section';

register('wm-partial', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPartial data-role="partial" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
