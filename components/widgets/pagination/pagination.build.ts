import { register } from '@transpiler/build';

register('wm-pagination', () => {
    return {
        tagName: 'nav',
        attrs: {
            'wmPagination': undefined,
            'data-identifier': 'pagination'
        }
    };
});

export default () => {};