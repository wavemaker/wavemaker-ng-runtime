import { register } from '@transpiler/build';

register('wm-left-panel', () => {
    return {
        tagName: 'aside',
        attrs: {
            'wmLeftPanel': undefined,
            'partialContainer': undefined,
            'data-role': 'page-left-panel'
        }
    };
});

export default () => {};