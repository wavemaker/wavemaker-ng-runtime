import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'img';
const idGen = new IDGenerator('wm_picture');

register('wm-picture', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            const ariaLabel = attrs.get('hint') || '';
            return `<${tagName} wmPicture #${counter}="wmPicture" alt="image" wmImageCache="${attrs.get('offline') || 'true'}" role="presentation" [attr.aria-label]="'${ariaLabel}' || ${counter}._ariaLabel" ${getAttrMarkup(attrs)}>`;
        }
    };
});

export default () => {};
