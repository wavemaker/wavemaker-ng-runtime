import { register } from '@transpiler/build';

register('wm-checkbox', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmCheckbox': undefined,
            'role': 'input'
        }
    };
});

export default () => {};