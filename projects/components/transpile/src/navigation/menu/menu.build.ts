import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-menu', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const menuWidth = attrs.get("width");
            let styleBinding = '';
            if(menuWidth){
                if(menuWidth.indexOf('%') > -1 || menuWidth.indexOf('px') > -1){
                    styleBinding = `[ngStyle]="{'width': '${menuWidth}'}"`;
                    return `<${tagName} wmMenu dropdown ${getAttrMarkup(attrs)} ${styleBinding}>`
                } 
            }  
            else{        
            return `<${tagName} wmMenu dropdown ${getAttrMarkup(attrs)}>`
           }
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
