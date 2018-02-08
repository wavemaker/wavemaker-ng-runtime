import { register } from '@transpiler/build';

register('wm-picture', () => {
    return {
        tagName: 'img',
        directives: {
            'wmPicture': undefined
        }
    };
});

export default () => {};