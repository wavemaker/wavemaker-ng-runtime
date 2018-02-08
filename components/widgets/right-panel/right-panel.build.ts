import { register } from '@transpiler/build';

register('wm-right-panel', () => {
    return {
        tagName: 'wm-right-panel',
        attrs: {
            'partialContainer': undefined
        }
    };
});

export default () => {};