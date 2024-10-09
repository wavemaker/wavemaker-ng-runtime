import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'button';
const idGen = new IDGenerator('wm_barcodescanner');

register('wm-barcodescanner', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmBarcodescanner #${counter}="wmBarcodescanner" [attr.aria-label]="${counter}.arialabel || 'Barcode scanner'"  ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
