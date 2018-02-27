import { register } from '@transpiler/build';

register('wm-search', () => {
    return {
        tagName: 'div',
        attrs: {
            'role': 'input'
        }
    };
});

export default () => {};