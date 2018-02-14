import { register } from '@transpiler/build';

register('wm-gridcolumn', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmLayoutGridColumn': undefined
        }
    };
});

export default () => {};