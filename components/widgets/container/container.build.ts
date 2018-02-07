import { register } from '@transpiler/build';

register('wm-container', () => {
    return {
        tagName: 'div',
        directives: {
            'wmContainer': undefined,
            'partialContainer': undefined
        }
    };
});

export default () => {};