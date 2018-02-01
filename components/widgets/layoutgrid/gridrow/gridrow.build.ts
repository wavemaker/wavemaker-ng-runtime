import { register } from '@transpiler/build';

register('wm-gridrow', () => {
    return {
        tagName: 'div',
        directives: {
            'wmGridrow': undefined
        }
    };
});

export default () => {};