import { Element, ParseSourceSpan, Text } from '@angular/compiler';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'section';
const noSpan = ({} as ParseSourceSpan);
const createElement = name => {
    return new Element(name, [], [], [], false, noSpan, noSpan, noSpan, false);
};

register('wm-partial', (): IBuildTaskDef => {
    return {
        template: (node: Element)  => {
            // No conditional wrapping - render content immediately
            // The compileContent flag can be removed since partials should always render
        },
        pre: attrs => `<${tagName} wmPartial data-role="partial" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
