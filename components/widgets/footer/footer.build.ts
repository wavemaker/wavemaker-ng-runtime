import { register } from '@transpiler/build';

register('wm-footer', () => {
    return {
        tagName: 'footer',
        attrs: {
            'wmFooter': undefined,
            'partialContainer': undefined,
            'data-role': 'page-footer'
        }
    };
});

export default () => {};