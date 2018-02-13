import { register } from '@transpiler/build';

register('wm-slider', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmSlider': undefined
        }
    };
});

export default () => {};