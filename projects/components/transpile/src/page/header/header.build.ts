import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'header';

register('wm-header', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmHeader partialContainer data-role="page-header" role="banner" aria-label="${attrs.get('hint') || 'Page header'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
