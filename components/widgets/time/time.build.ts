import { register } from '@transpiler/build';

register('wm-time', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmTime': undefined
        }
    };
});

export default () => {};