import { register } from '@transpiler/build';

register('wm-picture', () => {
    return {
        isVoid: true,
        tagName: 'img',
        attrs: {
            'wmPicture': undefined
        }
    };
});

export default () => {};