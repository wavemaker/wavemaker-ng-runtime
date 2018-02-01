import { register } from '@transpiler/build';

register('wm-buttongroup', () => {
    return {
        tagName: 'div',
        directives: {
            'wmButtongroup': undefined
        }
    };
});

export default () => {};