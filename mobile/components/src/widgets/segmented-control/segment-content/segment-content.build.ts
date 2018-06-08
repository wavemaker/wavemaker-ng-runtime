import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'li';

register('wm-segment-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSegmentContent partialContainer page-container-target wmSmoothscroll=${attrs.get('smoothscroll') || 'true'} ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
