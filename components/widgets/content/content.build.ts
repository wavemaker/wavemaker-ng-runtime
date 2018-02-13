import { register } from '@transpiler/build';

register('wm-content', () => {
    return {
        tagName: 'main',
        attrs: {
            'wmContent': undefined,
            'data-role': 'page-content'
        }
    };
});

export default () => {};