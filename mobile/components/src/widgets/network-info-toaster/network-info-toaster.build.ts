import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-network-info-toaster', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmNetworkInfoToaster ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
