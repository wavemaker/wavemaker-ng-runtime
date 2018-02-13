import { register } from 'transpiler/build';

register('wm-gridrow', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmLayoutGridRow': undefined
        }
    };
});

export default () => {};