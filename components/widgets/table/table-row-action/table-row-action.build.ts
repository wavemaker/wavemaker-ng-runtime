import { register } from '@transpiler/build';

register('wm-table-row-action', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmTableColumnGroup': undefined
        }
    };
});

export default () => {};