import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-spinner', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmSpinner role="alert" aria-live="assertive" aria-busy="true" aria-label="${attrs.get('hint') || 'Loading...'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
