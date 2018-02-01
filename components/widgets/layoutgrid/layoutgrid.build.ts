import { register } from '@transpiler/build';

register('wm-layoutgrid', () => {
    return {
        tagName: 'div',
        directives: {
            'wmLayoutgrid': undefined
        }
    };
});

export default () => {};