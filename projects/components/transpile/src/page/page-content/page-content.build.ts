import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import { Element, ParseSourceSpan, Text } from "@angular/compiler";

const tagName = 'div';

const createElement = name => {
    return new Element(name, [], [], [], false, noSpan, noSpan, noSpan, false);
};

const noSpan = ({} as ParseSourceSpan);

register('wm-page-content', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            // For SPA pages, just append onPageContentReady() without conditional
            for(let attr of node.attrs) {
                if(attr.name === 'spa' && attr.value === 'true') {
                    node.children.push(new Text('{{onPageContentReady()}}', null, undefined, undefined));
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
