import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { Element, ParseSourceSpan, Text } from "@angular/compiler";

const tagName = 'div';

const createElement = name => {
    // Angular 20: Element constructor requires 9 arguments
    return new Element(name, [], [], [], false, noSpan, noSpan, null, false);
};

const noSpan = ({} as ParseSourceSpan);

register('wm-page-content', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            for(let attr of node.attrs) {
                if(attr.name === 'spa' && attr.value === 'true') {
                    const conditionalNode = createElement('ng-container');
                    const ifOpenText = new Text('@if (compilePageContent) {', null, undefined, undefined);
                    conditionalNode.children.push(ifOpenText);
                    conditionalNode.children = conditionalNode.children.concat(node.children);
                    conditionalNode.children.push(new Text('{{onPageContentReady()}}', null, undefined, undefined));
                    const ifCloseText = new Text('}', null, undefined, undefined);
                    conditionalNode.children.push(ifCloseText);
                    node.children = [conditionalNode];
                    break;
                }
            }
        },
        pre: attrs => `<${tagName} wmPageContent ${attrs.get('spa') && 'wmSpaPage' || ''} wmSmoothscroll="${attrs.get('smoothscroll') || 'false'}" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: (attrs) => {
            if (attrs.get('spa')) {
                return ['spa-page-content']
            }
            return [];
        }
    };
});

export default () => {};
