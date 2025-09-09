import { Element, ParseSourceSpan, Text } from '@angular/compiler';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';


const noSpan = ({} as ParseSourceSpan);
const createElement = name => {
    return new Element(name, [], [], [], false, noSpan, noSpan, noSpan, false);
};

const tagName = 'div';

register('wm-prefab-container', (): IBuildTaskDef => {
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
        pre: attrs => `<${tagName} wmPrefabContainer ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
