import { register } from '@transpiler/build';

register('wm-icon', () => {
    return {
        tagName: 'span',
        attrs: {
            'wmIcon': undefined
        }
    };
});

export default () => {};