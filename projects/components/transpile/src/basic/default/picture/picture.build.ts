import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'img';

register('wm-picture', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPicture alt="image" wmImageCache="${attrs.get('offline') || 'true'}" role="presentation" aria-label="${attrs.get('hint')}" ${getAttrMarkup(attrs)}>`
    };
});

export default () => {};
