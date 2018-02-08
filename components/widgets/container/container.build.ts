import { register } from '@transpiler/build';

register('wm-container', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmContainer': undefined,
            'partialContainer': undefined
        }
    };
});

export default () => {};