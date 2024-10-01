import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

let tagName = 'p';
const idGen = new IDGenerator('wm_label');

register('wm-label', (): IBuildTaskDef => {
    return {
        pre: (attrs:any) => {
            if(!attrs.get("notag")){
                if(!attrs.get('type')){
            const classList=attrs.get('class') ? attrs.get('class').split(' ').filter(element => ["h1","h2","h3","h4","h5","h6","p"].includes(element)):[];
            attrs.set('type',classList.length ? classList[0] :  "p");
                }
            tagName= attrs.get('type');
            }
            else{
                tagName='label';
            }
            const counter = idGen.nextUid();
            return `<${tagName} wmLabel #${counter}="wmLabel" [attr.aria-label]="${counter}.arialabel" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
