import {
    HtmlParser,
    Element,
    Text,
    Comment
} from '@angular/compiler';

const BIND_REG_EX = /^\s*bind:(.*)$/g;

const OVERRIDES = {
    'accessroles': '*accessroles',
    'ng-if': '*ngIf'
};

const getBoundToExpr = value => {
    const match = BIND_REG_EX.exec(value);
    BIND_REG_EX.lastIndex = 0;
    return match && match[1];
};

const quoteAttr = v => {
    return ('' + v) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

const registry = new Map<string, any>();
const htmlParser = new HtmlParser();
const ignoreComments = true;

const isString = s => typeof s === 'string';

const empty = () => '';

const isEvent = name => name[0] === 'o' && name[1] === 'n' && name[2] === '-';

const getEventName = key => key.substr(3);

const processBinding = (attr, expr) => [`${attr.name}.bind`, quoteAttr(expr)];

const processEvent = attr => {
    const evtName = getEventName(attr.name);
    return [`${evtName}.event`, attr.value];
};

const processAttr = attr => {
    const overridden = OVERRIDES[attr.name];
    const value = attr.valueSpan ? attr.value : undefined;

    if (overridden) {
        return [overridden, value];
    }

    if (isEvent(attr.name)) {
        return processEvent(attr);
    }

    const boundExpr = getBoundToExpr(attr.value);
    if (boundExpr) {
        return processBinding(attr, boundExpr);
    }

    return [attr.name, value];
};

const getAttrMap = attrs => {
    const attrMap = new Map<string, string>();
    attrs.forEach(attr => {
        const [attrName, attrValue] = processAttr(attr);
        attrMap.set(attrName, attrValue);
    });

    return attrMap;
};

export const getAttrMarkup = (attrs: Map<string, string>) => {
    let attrMarkup = '';
    attrs.forEach((v, k) => {
        attrMarkup += ` ${k}`;
        if (v) {
            attrMarkup += `="${v}"`;
        }
    });

    return attrMarkup;
};

const getRequiredProviders = (nodeDef, providers) => {
    if (!nodeDef.requires) {
        return;
    }

    let requires = nodeDef.requires;

    if (isString(requires)) {
        requires = [requires];
    }

    if (!Array.isArray(requires)){
        return;
    }

    return requires.map(require => providers.get(require));
};

const processNode = (node, providers?) => {
    const nodeDef = registry.get(node.name);

    let pre, post;

    if (nodeDef) {
        pre = nodeDef.pre || empty;
        post = nodeDef.post || empty;
    }

    let markup = '';
    let attrMap;
    let requiredProviders;
    let shared;

    if (!providers) {
        providers = new Map<string, Map<string, string>>();
    }

    const isElementType = node instanceof Element;

    if (isElementType) {
        attrMap = getAttrMap(node.attrs);
        if (nodeDef) {
            requiredProviders = getRequiredProviders(nodeDef, providers);
            shared = new Map();
            markup = (<any>pre)(attrMap, shared, ...requiredProviders);
            if (node.provide) {
                providers.set(node.name, node.provide(attrMap, shared, ...requiredProviders))
            }
        } else {
            markup = `<${node.name} ${getAttrMarkup(attrMap)}>`;
        }

        node.children.forEach(child => markup += processNode(child, providers));

        if (nodeDef) {
            providers.delete(node.name);
            markup += (<any>post)(attrMap, shared, ...requiredProviders);
        } else {
            if (node.endSourceSpan) {
                markup += `</${node.name}>`;
            }
        }
    } else if (node instanceof Text) {
        markup += node.value;
    } else if (node instanceof Comment) {
        if (!ignoreComments) {
            markup += node.value;
        }
    }

    return markup;
};

export const transpile = (markup:string = '') => {
    if (!markup.length) {
        return;
    }

    const nodes = htmlParser.parse(markup, '');

    if (nodes.errors.length) {
        return;
    }

    let output = '';
    for (const node of nodes.rootNodes) {
        output += processNode(node);
    }
    return output;
};

export const register = (nodeName: string, nodeDefFn: () => BuildTaskDef) => registry.set(nodeName, nodeDefFn());

export interface BuildTaskDef {
    requires?: string | Array<string>
    pre: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => string,
    provide?: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => Map<any, any>,
    post?: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => string,
}