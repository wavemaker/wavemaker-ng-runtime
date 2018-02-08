import { register } from '@transpiler/build';

register('wm-header', () => {
    return {
        tagName: 'header',
        attrs: {
            'wmHeader': undefined,
            'partialContainer': undefined,
            'data-role': 'page-header'
        }
    };
});

export default () => {};