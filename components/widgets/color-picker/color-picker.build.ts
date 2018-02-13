import { register } from '@transpiler/build';

register('wm-colorpicker', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmColorPicker': undefined,
        }
    };
});

export default () => {};