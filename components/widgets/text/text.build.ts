import { register } from '@transpiler/build';

register('wm-text', () => {
    return {
        isVoid: true,
        tagName: 'input',
        directives: {
            'wmText': undefined
        }
    };
});

export default () => {};