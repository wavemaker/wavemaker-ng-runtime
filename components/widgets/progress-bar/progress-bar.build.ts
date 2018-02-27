import { register } from '@transpiler/build';

register('wm-progressbar', () => {
    return {
        isVoid: true,
        tagName: 'div',
        attrs: {
            'wmProgressBar': undefined
        }
    };
});

export default () => {};
