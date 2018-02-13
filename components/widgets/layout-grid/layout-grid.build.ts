import { register } from '@transpiler/build';

register('wm-layoutgrid', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmLayoutGrid': undefined
        }
    };
});

export default () => {};