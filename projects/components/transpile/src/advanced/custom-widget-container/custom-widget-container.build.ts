import {getAttrMarkup, IBuildTaskDef, register} from "@wm/transpiler";
import {IDGenerator} from "@wm/core";

const idGen = new IDGenerator("wm_custom_widget");
register("wm-custom-widget", (): IBuildTaskDef => {
	const isNode = window.navigator.userAgent === 'Node.js';
	if(isNode){
		return{
			pre: (attrs) =>{
				const counter = idGen.nextUid();
				const widgetname = attrs.get("widgetname");
				const tagName = `app-custom-${widgetname}`;
				return `<${tagName} wmWidgetContainer #${counter}="wmWidgetContainer" ${getAttrMarkup(attrs)}>`;
			},
			post: (attrs) => {
				const widgetname = attrs.get("widgetname");
				const tagName = `app-custom-${widgetname}`;
				return `</${tagName}>`;
			},
		}
	}else{
		return {
			pre: (attrs) => {
				const counter = idGen.nextUid();
				return `<div wmWidgetContainer customWidgetContainer #${counter}="wmWidgetContainer" ${getAttrMarkup(attrs)}>`;
			},
			post: () => `</div>`,
		};
	}
});

export default () => {};
