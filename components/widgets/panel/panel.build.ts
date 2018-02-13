import { register } from '@transpiler/build';

register('wm-panel', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmPanel': undefined,
            'partialContainer': undefined
        }
    };
});

export default () => {};