import { register } from '@transpiler/build';

register('wm-left-panel', () => {
    return {
        tagName: 'wm-left-panel',
        attrs: {
            'partialContainer': undefined
        }
    };
});

export default () => {};