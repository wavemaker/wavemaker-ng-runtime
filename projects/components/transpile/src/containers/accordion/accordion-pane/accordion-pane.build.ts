import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-accordionpane', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmAccordionPane partialContainer wm-navigable-element="true" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@wm/components/containers/accordion',
            name: 'AccordionModule'
        }]
    };
});

export default () => {};
