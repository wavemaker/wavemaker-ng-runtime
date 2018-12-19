import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'section';

register('wm-partial', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPartial data-role="partial" role="region" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
