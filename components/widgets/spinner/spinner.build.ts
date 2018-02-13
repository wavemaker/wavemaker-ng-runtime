import { register } from '@transpiler/build';

register('wm-spinner', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmSpinner': undefined
        }
    };
});

export default () => {};