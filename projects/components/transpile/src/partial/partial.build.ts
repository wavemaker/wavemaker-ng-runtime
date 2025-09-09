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
            const conditionalNode = createElement('ng-container');
            const ifOpenText = new Text('@if (compileContent) {', null, undefined, undefined);
            conditionalNode.children.push(ifOpenText);
            conditionalNode.children = conditionalNode.children.concat(node.children);
            const ifCloseText = new Text('}', null, undefined, undefined);
            conditionalNode.children.push(ifCloseText);
            node.children.length = 0;
            node.children.push(conditionalNode);
        },
        pre: attrs => `<${tagName} wmPartial data-role="partial" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
