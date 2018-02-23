import { register } from '@transpiler/build';

register('wm-accordionpane', () => {
    return {
        tagName: 'div',
        attrs: {
            'wmAccordionPane': undefined,
            'partialContainer': undefined,
            'wmNavigableElement': true
        }
    };
});

export default () => {};
