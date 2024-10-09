import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'header';
const idGen = new IDGenerator('wm_header');

register('wm-header', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid()
            return `<${tagName} wmHeader #${counter}="wmHeader" partialContainer data-role="page-header" role="banner" [attr.aria-label]="${counter}.arialabel || 'Page header'" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});


export default () => {};
