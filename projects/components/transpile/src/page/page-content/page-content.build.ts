import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { Attribute, Element, ParseSourceSpan, Text } from "@angular/compiler";
import { isMobileApp } from "@wm/core";

const tagName = 'div';

const createElement = name => {
    return new Element(name, [], [], noSpan, noSpan, noSpan);
};

const addAtrribute = (node: Element, name: string, value: string) => {
    const attr = new Attribute(name, value, noSpan, noSpan, noSpan);
    node.attrs.push(attr);
};

const noSpan = ({} as ParseSourceSpan);

register('wm-page-content', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            if (!isMobileApp()) {
                const conditionalNode = createElement('ng-container');
                addAtrribute(conditionalNode, '*ngIf', 'compilePageContent');
                conditionalNode.children = conditionalNode.children.concat(node.children);
                conditionalNode.children.push(new Text('{{onPageContentReady()}}', null));
                node.children = [conditionalNode];
            }
        },
        pre: attrs => `<${tagName} wmPageContent wmPageInfo wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
