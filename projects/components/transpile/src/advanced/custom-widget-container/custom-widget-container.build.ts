import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';
import {IDGenerator} from "@wm/core";

const tagName = 'div';
const idGen = new IDGenerator('wm_custom_widget');

register('wm-custom-widget', (): IBuildTaskDef => {
    return {
        pre: (attrs) => {
            const counter = idGen.nextUid();
            return `<${tagName} wmWidgetContainer customWidgetContainer #${counter}="wmWidgetContainer" ${getAttrMarkup(attrs)}>`;
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
