import { register } from '@transpiler/build';

register('wm-html', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmHtml': undefined
        }
    };
});

export default () => {};
