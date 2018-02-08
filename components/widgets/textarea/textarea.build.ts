import { register } from '@transpiler/build';

register('wm-textarea', () => {
    return {
        tagName: 'textarea',
        attrs: {
            'wmTextarea': undefined
        }
    };
});

export default () => {};