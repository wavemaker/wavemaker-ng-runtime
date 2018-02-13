import { register } from '@transpiler/build';

register('wm-page', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmPage': undefined,
            'data-role': 'pageContainer'
        }
    };
});

export default () => {};