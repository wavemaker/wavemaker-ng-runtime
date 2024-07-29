import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'div';

register('wm-menu', (): IBuildTaskDef => {
    return {
        pre: attrs => {
            const menuWidth = attrs.get("width");
            let styleBinding = '';
            if(menuWidth){
                const units = ['%', 'px'];
                const hasUnit = units.some(unit => menuWidth.includes(unit));
                if(hasUnit){
                    styleBinding = `[ngStyle]="{'width': '${menuWidth}'}"`;
                }
                else{
                    styleBinding = `[ngStyle]="{'width': '${menuWidth}px'}"`;
                }

                return `<${tagName} wmMenu dropdown ${getAttrMarkup(attrs)} ${styleBinding}>`
            }  
            else{        
            return `<${tagName} wmMenu dropdown ${getAttrMarkup(attrs)}>`
           }
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
