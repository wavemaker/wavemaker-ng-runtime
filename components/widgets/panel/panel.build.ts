import { register } from '@transpiler/build';

register('wm-panel', () => {
    return {
        tagName: 'wm-panel',
        attrs: {
            'partialContainer': undefined
        }
    };
});

export default () => {};