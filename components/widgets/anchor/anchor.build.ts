import { register } from '@transpiler/build';

register('wm-anchor', () => {
    return {
        tagName: 'a',
        attrs: {
            'wmAnchor': undefined
        }
    };
});

export default () => {};