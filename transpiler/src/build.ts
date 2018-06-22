import {
    HtmlParser,
    Element,
    Text,
    Comment
} from '@angular/compiler';

import { isString } from '@wm/core';

interface IProviderInfo {
    nodeName: string;
    provide: Map<string, any>;
}

export const BIND_REG_EX = /^\s*bind:(.*)$/g;

const OVERRIDES = {
    'accessroles': '*accessroles',
    'ng-if': '*ngIf',
    'showindevice': 'showInDevice',
    'ng-class': '[ngClass]',
    'data-ng-class': '[ngClass]',
    'data-ng-src': 'src',
    'ng-src': 'src',
    'data-ng-href': 'href',
    'ng-href': 'href'
};

const selfClosingTags = new Set(['img']);

export const getBoundToExpr = (value: string) => {
    value = value.trim();
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
        /**
         * wrap value for accessroles with ''.
         * since accessroles is a structural directive, it will be transpiled to [accessroles]
         * hence, the value against it should be a computed string
         */
        if (attr.name === 'accessroles') {
            return [overridden, `'${value}'`];
        }
        return [overridden, quoteAttr(value)];
    }

    if (isEvent(attr.name)) {
        return processEvent(attr);
    }

    const boundExpr = getBoundToExpr(attr.value);
    if (boundExpr) {
        return processBinding(attr, boundExpr);
    }

    return [attr.name, quoteAttr(value)];
};

export const getDataSource = (dataSetExpr: string): string => {
    const parts = dataSetExpr.split('.');
    if (parts[0] === 'Variables' || parts[0] === 'Widgets') {
        return `${parts[0]}.${parts[1]}`;
    }
};

const getAttrMap = attrs => {
    const attrMap = new Map<string, string>();
    attrs.forEach(attr => {
        const [attrName, attrValue] = processAttr(attr);
        attrMap.set(attrName, attrValue);
    });

    if (attrMap.get('dataset.bind')) {
        const dataSource = getDataSource(attrMap.get('dataset.bind'));
        if (dataSource) {
            attrMap.set('datasource.bind', dataSource);
        }
    }

    return attrMap;
};

export const getAttrMarkup = (attrs: Map<string, string>) => {
    let attrMarkup = '';
    attrs.forEach((v, k) => {
        attrMarkup += ` ${k}`;
        if (v) {
            if (k === '[ngClass]' && v.startsWith('{')) {
                v = v.replace(/"/g, `'`);
            }
            attrMarkup += `="${v}"`;
        }
    });

    return attrMarkup;
};

const getRequiredProviders = (nodeDef: IBuildTaskDef, providers: Array<IProviderInfo>) => {
    if (!nodeDef.requires) {
        return;
    }

    let requires = nodeDef.requires as any;

    if (isString(requires)) {
        requires = [requires];
    }

    if (!Array.isArray(requires)) {
        return;
    }

    return requires.map(require => {
        for (let i = providers.length - 1; i >= 0; i-- ) {
            if (providers[i].nodeName === require) {
                return providers[i].provide;
            }
        }
    });
};

const DIMENSION_PROPS = ['padding', 'borderwidth', 'margin'];

const SEPARATOR = ' ', UNSET = 'unset';

const setDimensionProp = (cssObj, key, nv) => {
    let cssKey = key, val, top, right, bottom, left, suffix = '';

    function setVal(prop, value) {
        // if the value is UNSET, reset the existing value
        if (value === UNSET) {
            value = '';
        }
        cssObj[cssKey + prop + suffix] = value;
    }

    if (key === 'borderwidth') {
        suffix =  'width';
        cssKey = 'border';
    }

    val = nv;

    if (val.indexOf(UNSET) !== -1) {
        val = val.split(SEPARATOR);

        top    = val[0];
        right  = val[1] || val[0];
        bottom = val[2] || val[0];
        left   = val[3] || val[1] || val[0];

        setVal('top',    top);
        setVal('right',  right);
        setVal('bottom', bottom);
        setVal('left',   left);
    } else {
        if (key === 'borderwidth') {
            cssKey = 'borderwidth';
        }
        cssObj[cssKey] = nv;
    }
};

const processDimensionAttributes = attrMap => {
    const attrKeys = Array.from(attrMap.keys());
    attrKeys.forEach((attrKey: any) => {
        if (DIMENSION_PROPS.includes(attrKey)) {
            const cssObj = {},
                attrValue = attrMap.get(attrKey);
            attrMap.delete(attrKey);
            setDimensionProp(cssObj, attrKey, attrValue);
            Object.keys(cssObj).forEach(key => {
                if (cssObj[key]) {
                    attrMap.set(key, cssObj[key]);
                }
            });
        }
    });
};

const processNode = (node, providers?: Array<IProviderInfo>) => {
    const nodeDef = registry.get(node.name);

    let pre, post, template;

    if (nodeDef) {
        pre = nodeDef.pre || empty;
        post = nodeDef.post || empty;
        template = nodeDef.template || empty;
    }

    let markup = '';
    let attrMap;
    let requiredProviders;
    let shared;

    if (!providers) {
        providers = [];
    }

    const isElementType = node instanceof Element;

    if (isElementType) {
        let provideInfo: IProviderInfo;

        if (nodeDef) {
            requiredProviders = getRequiredProviders(nodeDef, providers);
            shared = new Map();
            template(node, shared, ...requiredProviders);
        }

        attrMap = getAttrMap(node.attrs);
        processDimensionAttributes(attrMap);

        if (nodeDef) {
            markup = (<any>pre)(attrMap, shared, ...requiredProviders);
            if (nodeDef.provide) {
                provideInfo = {
                    nodeName: node.name,
                    provide: nodeDef.provide(attrMap, shared, ...requiredProviders)
                };
                providers.push(provideInfo);
            }
        } else {
            markup = `<${node.name} ${getAttrMarkup(attrMap)}>`;
        }

        node.children.forEach(child => markup += processNode(child, providers));

        if (nodeDef) {
            if (provideInfo) {
                providers.splice(providers.indexOf(provideInfo), 1);
            }
            markup += (<any>post)(attrMap, shared, ...requiredProviders);
        } else {
            if (node.endSourceSpan && !selfClosingTags.has(node.name)) {
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

export const transpile = (markup: string = '') => {
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

export const register = (nodeName: string, nodeDefFn: () => IBuildTaskDef) => registry.set(nodeName, nodeDefFn());

export interface IBuildTaskDef {
    requires?: string | Array<string>;
    template?: (node: Element | Text | Comment, shared?: Map<any, any>, ...requires: Array<Map<any, any>>) => void;
    pre: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => string;
    provide?: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => Map<any, any>;
    post?: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => string;
}
