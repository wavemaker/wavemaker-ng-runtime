import { register } from '@transpiler/build';

register('wm-textarea', () => {
    return {
        tagName: 'textarea',
        directives: {
            'wmTextarea': undefined
        }
    };
});

export default () => {};