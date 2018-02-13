import { register } from '@transpiler/build';

register('wm-navbar', () => {
    return {
        tagName: 'nav',
        attrs: {
            'wmNavbar': undefined,
            'data-element-type': 'wmNavbar'
        }
    };
});

export default () => {};