import { register } from '@transpiler/build';

register('wm-gridcolumn', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmGridcolumn': undefined
        }
    };
});

export default () => {};