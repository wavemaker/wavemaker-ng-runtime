import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { Attribute, Element, ParseSourceSpan, Text } from "@angular/compiler";

const tagName = 'div';

const createElement = name => {
    return new Element(name, [], [], noSpan, noSpan, noSpan);
};

const addAtrribute = (node: Element, name: string, value: string) => {
    const attr = new Attribute(name, value, noSpan, noSpan, noSpan, undefined, undefined);
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
                    conditionalNode.children.push(new Text('{{onPageContentReady()}}', null, undefined, undefined));
                    node.children = [conditionalNode];
                    break;
                }
            }
        },
        pre: attrs => {
            const pagefocus = attrs.get('pagefocus');
            const focusOnNavigation = pagefocus === 'true' ? "focusOnNavigation" : ""
            return `<${tagName} wmPageContent ${attrs.get('spa') && 'wmSpaPage' || ''} focusOnNavigation wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
