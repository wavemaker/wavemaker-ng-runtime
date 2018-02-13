import { register } from '@transpiler/build';

register('wm-rating', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmRating': undefined,
        }
    };
});

export default () => {};