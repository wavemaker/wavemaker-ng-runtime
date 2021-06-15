import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'section';

register('wm-top-nav', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmTopNav partialContainer data-role="page-topnav" role="navigation" aria-label="${attrs.get('hint') || 'Second level navigation'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
