import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'img';
const idGen = new IDGenerator('wm_picture');

register('wm-picture', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmPicture #${counter}="wmPicture" [alt]="${counter}.alttext" wmImageCache="${attrs.get('offline') || 'true'}" [attr.aria-label]="${counter}.arialabel || 'Image'" ${getAttrMarkup(attrs)}>`;
        }
    };
});

export default () => {};
