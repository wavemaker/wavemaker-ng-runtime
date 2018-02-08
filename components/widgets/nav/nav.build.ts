import { register } from '@transpiler/build';

register('wm-nav', () => {
    return {
        tagName: 'ul',
        attrs: {
            'wmNav': undefined,
            'data-element-type': 'wmNav',
            'data-role': 'page-header'
        }
    };
});

export default () => {};