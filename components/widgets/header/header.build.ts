import { register } from '@transpiler/build';

register('wm-header', () => {
    return {
        tagName: 'header',
        directives: {
            'wmHeader': undefined,
            'partialContainer': undefined
        }
    };
});

export default () => {};