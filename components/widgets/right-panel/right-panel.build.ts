import { register } from '@transpiler/build';

register('wm-right-panel', () => {
    return {
        tagName: 'aside',
        attrs: {
            'wmRightPanel': undefined,
            'partialContainer': undefined,
            'data-role': 'page-right-panel'
        }
    };
});

export default () => {};