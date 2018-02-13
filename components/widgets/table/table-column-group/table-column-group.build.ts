import { register } from '@transpiler/build';

register('wm-table-column-group', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmTableColumnGroup': undefined
        }
    };
});

export default () => {};