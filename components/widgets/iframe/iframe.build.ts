import { register } from '@transpiler/build';

register('wm-iframe', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmIframe': undefined
        }
    };
});

export default () => {};