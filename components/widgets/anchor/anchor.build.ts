import { register } from '@transpiler/build';

register('wm-anchor', () => {
    return {
        tagName: 'a',
        directives: {
            'wmAnchor': undefined
        }
    };
});

export default () => {};