import { register } from '@transpiler/build';

register('wm-layoutgrid', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmLayoutgrid': undefined
        }
    };
});

export default () => {};