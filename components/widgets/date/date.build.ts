import { register } from '@transpiler/build';

register('wm-date', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmDate': undefined,
            'role': 'input'
        }
    };
});

export default () => {};