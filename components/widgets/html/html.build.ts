import { register } from '@transpiler/build';

register('wm-html', () => {
    return {
        tagName: 'div',
        directives: {
            'wmHtml': undefined
        }
    };
});

export default () => {};
