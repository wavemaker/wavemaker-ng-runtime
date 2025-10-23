import { Element, ParseSourceSpan, Text } from '@angular/compiler';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';


const noSpan = ({} as ParseSourceSpan);
const createElement = name => {
    // Angular 20: Element constructor requires 9 arguments
    return new Element(name, [], [], [], false, noSpan, noSpan, null, false);
};

const tagName = 'div';

register('wm-prefab-container', (): IBuildTaskDef => {
    return {
        template: (node: Element)  => {
            // No conditional wrapping - render content immediately
        },
        pre: attrs => `<${tagName} wmPrefabContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
