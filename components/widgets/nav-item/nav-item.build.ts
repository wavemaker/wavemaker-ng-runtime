import { register } from '@transpiler/build';

register('wm-nav-item', () => {
    return {
        tagName: 'li',
        attrs: {
            'wmNavItem': undefined
        }
    };
});

export default () => {};