import { register } from '@transpiler/build';

register('wm-page-content', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmPageContent': undefined
        }
    };
});

export default () => {};