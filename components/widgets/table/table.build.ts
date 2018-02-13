import { register } from '@transpiler/build';

register('wm-table', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmTable': undefined,
            'data-identifier': 'table'
        }
    };
});

export default () => {};