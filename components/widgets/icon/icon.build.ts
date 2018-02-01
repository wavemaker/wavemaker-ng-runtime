import { register } from '@transpiler/build';

register('wm-icon', () => {
    return {
        tagName: 'div',
        directives: {
            'wmIcon': undefined
        }
    };
});

export default () => {};