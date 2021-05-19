import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-container', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmContainer role="row" partialContainer wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
