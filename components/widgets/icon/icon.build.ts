import { register } from '@transpiler/build';

register('wm-icon', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmIcon': undefined
        }
    };
});

export default () => {};