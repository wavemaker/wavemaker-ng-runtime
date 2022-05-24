import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';
const SPACING_KEY = 'parentLinearLayout.spacing';
register('wm-linearlayout', (): IBuildTaskDef => {
    return {
        requires: ['wm-linearlayout'],
        pre: (attrs, shared, provider) => {
            let spacing = attrs.get('spacing');
            attrs.set('spacing',
                (!spacing || spacing === '0') && provider ? provider.get(SPACING_KEY) : spacing);
            return `<${tagName} wmLinearLayout ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`,
        provide: (attrs, shared) => {
            const provider = new Map();
            provider.set(SPACING_KEY, attrs.get('spacing'));
            return provider;
        }
    };
});

export default () => {};
