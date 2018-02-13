import { register } from '@transpiler/build';

register('wm-radioset', () => {
    return {
        tagName: 'ul',
        attrs: {
            'wmRadioset': undefined,
            'role': 'input'
        }
    };
});

export default () => {};