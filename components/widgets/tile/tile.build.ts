import { register } from '@transpiler/build';

register('wm-tile', () => {
    return {
        tagName: 'div',
        directives: {
            'wmTile': undefined
        }
    };
});

export default () => {};