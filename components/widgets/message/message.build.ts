import { register } from '@transpiler/build';

register('wm-message', () => {
    return {
        tagName: 'p',
        attrs: {
            'wmMessage': undefined
        }
    };
});

export default () => {};