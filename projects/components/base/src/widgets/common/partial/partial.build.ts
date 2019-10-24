import { Attribute, Element, ParseSourceSpan } from '@angular/compiler';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'section';
const noSpan = ({} as ParseSourceSpan);
const createElement = name => {
    return new Element(name, [], [], noSpan, noSpan, noSpan);
};

const addAtrribute = (node: Element, name: string, value: string) => {
    const attr = new Attribute(name, value, noSpan, noSpan);
    node.attrs.push(attr);
};
register('wm-partial', (): IBuildTaskDef => {
    return {
        template: (node: Element)  => {
            const conditionalNode = createElement('ng-container');
            addAtrribute(conditionalNode, '*ngIf', 'compileContent');
            conditionalNode.children = conditionalNode.children.concat(node.children);
            node.children.length = 0;
            node.children.push(conditionalNode);
        },
        pre: attrs => `<${tagName} wmPartial data-role="partial" role="region" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
