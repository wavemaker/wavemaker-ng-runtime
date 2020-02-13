import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'li';

register('wm-segment-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSegmentContent partialContainer wmSmoothscroll=${attrs.get('smoothscroll') || 'true'} wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
