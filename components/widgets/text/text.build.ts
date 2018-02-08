import { register } from '@transpiler/build';

register('wm-text', () => {
    return {
        isVoid: true,
        tagName: 'input',
        attrs: {
            'wmText': undefined
        }
    };
});

export default () => {};