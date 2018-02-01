import { register } from '@transpiler/build';

register('wm-button', () => {
    return {
        tagName: 'button',
        directives: {
            'wmButton': undefined
        }
    };
});

export default () => {};