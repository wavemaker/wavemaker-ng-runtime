import { register } from '@transpiler/build';

register('wm-audio', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmAudio': undefined
        }
    };
});

export default () => {};