import { register } from '@transpiler/build';

register('wm-label', () => {
    return {
        tagName: 'label',
        attrs: {
            'wmLabel': undefined
        }
    };
});

export default () => {};