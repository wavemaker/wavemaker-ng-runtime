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
        .replace(/>/g, '&gt;')
};

const registry = new Map<string, any>();
const htmlParser = new HtmlParser();
const ignoreComments = true;

const isEvent = name => name[0] === 'o' && name[1] === 'n' && name[2] === '-';

const getEventName = key => key.substr(3);

const processBinding = (attr, expr) => `${attr.name}.bind="${quoteAttr(expr)}"`;

const processEvent = (attr) => {
    const evtName = getEventName(attr.name);
    return `${evtName}.event="${attr.value}"`;
};

const processAttr = attr => {
    let overridden = OVERRIDES[attr.name];
    let value = attr.valueSpan ? `="${attr.value}"` : '';
    if (overridden) {
        return `${overridden}${value}`;
    }

    if (isEvent(attr.name)) {
        return processEvent(attr);
    }

    let boundExpr = getBoundToExpr(attr.value);
    if (boundExpr) {
        return processBinding(attr, boundExpr);
    }

    return `${attr.name}${value}`;
};

const processAttrs = attrs => {
    let widgetName;
    attrs.some(attr => {
        if (attr.name === 'name') {
            widgetName = attr.value;
            return true;
        }
    });
    return attrs.map(attr => processAttr(attr)).join(' ');
};

const getAttrs = nodeDef => {
    if (nodeDef && nodeDef.attrs) {
        return Object.entries(nodeDef.attrs).map(([k, v]) => {
            if (v !== undefined) {
                return `${k}=${v}`;
            }

            return `${k}`;
        }).join(' ');
    }
    return '';
};

const processNode = node => {
    const nodeDef = registry.get(node.name);

    const isVoid = nodeDef && nodeDef.isVoid;

    let tagName;
    let markup = '';
    let startTag = '';
    let endTag = '';

    const isElementType = node instanceof Element;

    if (isElementType) {
        if (nodeDef) {
            if (nodeDef.tagName) {
                tagName = nodeDef.tagName;
            }
        } else {
            tagName = node.name;
        }

        startTag = `<${tagName} ${getAttrs(nodeDef)} ${processAttrs(node.attrs)}>`;
        if (node.endSourceSpan && !isVoid) {
            endTag = `</${tagName}>`;
        }

        markup += `${startTag}`;

        node.children.forEach(child => markup += processNode(child));

        markup += `${endTag}`;

    } else if (node instanceof Text) {
        markup += node.value;
    } else if (node instanceof Comment) {
        if (!ignoreComments) {
            markup += node.value;
        }
    }

    return markup;
};

export const transpile = (markup = '') => {
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

export const register = (nodeName, nodeDefFn) => registry.set(nodeName, nodeDefFn());
