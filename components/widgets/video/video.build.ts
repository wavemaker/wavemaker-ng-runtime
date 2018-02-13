import { register } from '@transpiler/build';

register('wm-video', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmVideo': undefined
        }
    };
});

export default () => {};