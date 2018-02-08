import { register } from '@transpiler/build';

register('wm-top-nav', () => {
    return {
        tagName: 'section',
        attrs: {
            'wmTopNav': undefined,
            'partialContainer': undefined,
            'data-role': 'page-topnav'
        }
    };
});

export default () => {};