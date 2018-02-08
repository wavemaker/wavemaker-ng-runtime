import { register } from '@transpiler/build';

register('wm-picture', () => {
    return {
        isVoid: true,
        tagName: 'img',
        directives: {
            'wmPicture': undefined
        }
    };
});

export default () => {};