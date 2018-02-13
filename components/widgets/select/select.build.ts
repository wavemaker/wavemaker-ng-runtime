import { register } from '@transpiler/build';

register('wm-select', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmSelect': undefined
        }
    };
});

export default () => {};