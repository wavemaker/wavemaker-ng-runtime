import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'button';

register('wm-barcodescanner', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmBarcodescanner ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
