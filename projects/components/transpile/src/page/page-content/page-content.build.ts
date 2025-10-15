import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { Attribute, Element, ParseSourceSpan, Text } from "@angular/compiler";

const tagName = 'div';

const createElement = name => {
    return new Element(name, [], [], [], false, noSpan, noSpan, null, false);
};

const noSpan = ({} as ParseSourceSpan);

register('wm-page-content', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            for(let attr of node.attrs) {
                if(attr.name === 'spa' && attr.value === 'true') {
                    // Use *ngIf structural directive
                    const conditionalNode = createElement('ng-container');
                    const ngIfAttr = new Attribute('*ngIf', 'compilePageContent', noSpan, undefined, noSpan, undefined, undefined);
                    conditionalNode.attrs.push(ngIfAttr);
                    conditionalNode.children = conditionalNode.children.concat(node.children);
                    conditionalNode.children.push(new Text('{{onPageContentReady()}}', null, undefined, undefined));
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
