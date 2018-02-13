import { register } from '@transpiler/build';

register('wm-anchor', () => {
    return {
        tagName: 'a',
        attrs: {
            'wmAnchor': undefined,
            'data-identifier': 'anchor',
            'role': 'button'
        }
    };
});

export default () => {};