import { Attribute, Element, ParseSourceSpan, Text } from '@angular/compiler';
import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'section';
const noSpan = ({} as ParseSourceSpan);
const createElement = name => {
    return new Element(name, [], [], [], false, noSpan, noSpan, null, false);
};

register('wm-partial', (): IBuildTaskDef => {
    return {
        template: (node: Element)  => {
            // Use *ngIf structural directive
            const conditionalNode = createElement('ng-container');
            const ngIfAttr = new Attribute('*ngIf', 'compileContent', noSpan, undefined, noSpan, undefined, undefined);
            conditionalNode.attrs.push(ngIfAttr);
            conditionalNode.children = conditionalNode.children.concat(node.children);
            node.children.length = 0;
            node.children.push(conditionalNode);
        },
        pre: attrs => `<${tagName} wmPartial data-role="partial" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
