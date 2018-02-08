import { register } from '@transpiler/build';

register('wm-button', () => {
    return {
        tagName: 'button',
        attrs: {
            'wmButton': undefined
        }
    };
});

export default () => {};