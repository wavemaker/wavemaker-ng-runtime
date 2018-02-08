import { register } from '@transpiler/build';

register('wm-gridrow', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmGridrow': undefined
        }
    };
});

export default () => {};