import { register } from '@transpiler/build';

register('wm-table-action', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmTableAction': undefined
        }
    };
});

export default () => {};