import { register } from '@transpiler/build';

register('wm-gridcolumn', () => {
    return {
        tagName: 'div',
        directives: {
            'wmGridcolumn': undefined
        }
    };
});

export default () => {};