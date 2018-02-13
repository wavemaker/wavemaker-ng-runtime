import { register } from '@transpiler/build';

register('wm-buttongroup', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmButtonGroup': undefined,
            'role': 'input'
        }
    };
});

export default () => {};