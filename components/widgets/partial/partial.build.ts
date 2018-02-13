import { register } from '@transpiler/build';

register('wm-partial', () => {
    return {
        tagName: 'section',
        attrs: {
            'wmPartial': undefined,
            'data-role': 'partial'
        }
    };
});

export default () => {};