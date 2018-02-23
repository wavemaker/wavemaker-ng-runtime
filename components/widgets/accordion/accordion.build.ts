import { register } from '@transpiler/build';

register('wm-accordion', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmAccordion': undefined
        }
    };
});

export default () => {};
