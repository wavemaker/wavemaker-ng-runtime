import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { Attribute, Element, ParseSourceSpan, Text } from "@angular/compiler";

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
            for(let attr of node.attrs) {
                if(attr.name === 'spa' && attr.value === 'true') {
                    const conditionalNode = createElement('ng-container');
                    addAtrribute(conditionalNode, '*ngIf', 'compilePageContent');
                    conditionalNode.children = conditionalNode.children.concat(node.children);
                    conditionalNode.children.push(new Text('{{onPageContentReady()}}', null));
                    node.children = [conditionalNode];
                    break;
                }
            }
        },
        pre: attrs => `<${tagName} wmPageContent ${attrs.get('spa') && 'wmSpaPage' || ''} wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};
