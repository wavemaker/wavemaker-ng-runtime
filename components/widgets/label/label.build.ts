import { register } from '@transpiler/build';

register('wm-label', () => {
    return {
        tagName: 'label',
        directives: {
            'wmLabel': undefined
        }
    };
});

export default () => {};