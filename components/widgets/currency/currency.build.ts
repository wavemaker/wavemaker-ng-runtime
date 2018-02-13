import { register } from '@transpiler/build';

register('wm-currency', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmCurrency': undefined
        }
    };
});

export default () => {};