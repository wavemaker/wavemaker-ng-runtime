import { register } from '@transpiler/build';

register('wm-switch', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmSwitch': undefined
        }
    };
});

export default () => {};
