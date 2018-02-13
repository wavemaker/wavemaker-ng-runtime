import { register } from '@transpiler/build';

register('wm-datetime', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmDateTime': undefined,
            'dropdown': undefined,
            'autoClose': false
        }
    };
});

export default () => {};