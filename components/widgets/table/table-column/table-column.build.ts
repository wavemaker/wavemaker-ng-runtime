import { register } from '@transpiler/build';

register('wm-table-column', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmTableColumn': undefined
        }
    };
});

export default () => {};