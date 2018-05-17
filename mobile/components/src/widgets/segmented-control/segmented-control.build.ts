import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-segmented-control', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSegmentedControl ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
