import { register } from '@transpiler/build';

register('wm-menu', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmMenu': undefined
        }
    };
});

export default () => {};