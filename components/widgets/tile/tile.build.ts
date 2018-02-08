import { register } from '@transpiler/build';

register('wm-tile', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmTile': undefined
        }
    };
});

export default () => {};