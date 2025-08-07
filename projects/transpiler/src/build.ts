import {
    HtmlParser,
    Element,
    Text,
    Comment,
    getHtmlTagDefinition, ParseSourceSpan
} from '@angular/compiler';
import { PIPE_IMPORTS, WIDGET_IMPORTS } from './imports';
import {find, isEqual, isFunction, remove, sortBy, uniqWith} from "lodash-es";
import { checkIsCustomPipeExpression, FormWidgetType } from "@wm/core";

const CSS_REGEX = {
    COMMENTS_FORMAT : /\/\*((?!\*\/).|\n)+\*\//g,
    SELECTOR_FORMAT : /[^\{\}]*\{/gi,
    SELECTOR_EXCLUDE_FORMAT : /(@keyframes|@media|@font-face|@comment[0-9]+|from|to|[0-9]+%)\b/i
};

const isString = v => typeof v === 'string';

interface IProviderInfo {
    nodeName: string;
    provide: Map<string, any>;
}

const OVERRIDES = {
    'accessroles': '*accessroles',
    'ng-if': '*ngIf',
    'showindevice': '*wmShowInDevice',
    'ng-class': '[ngClass]',
    'data-ng-class': '[ngClass]',
    'data-ng-src': 'src',
    'ng-src': 'src',
    'data-ng-href': 'href',
    'ng-href': 'href',
    'ng-disabled': 'disabled',
    'data-ng-disabled': 'disabled',
    'ng-model': '[ngModelOptions]="{standalone: true}" [(ngModel)]'
};

const selfClosingTags = new Set(['img']);

export const getBoundToExpr = (value: string) => {
    if (!value) {
        return null;
    }

    value = value.trim();
    if (value.startsWith('bind:')) {
        return value.substr(5);
    }
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

/**
 * Wraps the string with single quotes.
 * @param val
 */
const wrapWithApos = (val: string) => {
    return `&apos;${val.replace(/&apos/g, '&quot').replace(/&quot/g, '\\&quot')}&apos;`;
};
const ELE_PREFIX = '.wm-app';

const processAttr = attr => {
    let overridden = OVERRIDES[attr.name];
    const value = attr.valueSpan ? attr.value : undefined;

    if (overridden) {
        /**
         * wrap value for accessroles with ''.
         * since accessroles is a structural directive, it will be transpiled to [accessroles]
         * hence, the value against it should be a computed string
         */
        if (attr.name === 'accessroles' || attr.name === 'showindevice') {
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

const widgetChildAttrs = (() => {
    const childAttrs = new Map();
    const validChildAttrs = [
        `required`
    ];
    return {
        set: attrs => {
            attrs.forEach((val, key) => {
                validChildAttrs.includes(key) && (childAttrs.set(key, val));
            });
        },
        get: attrs => {
            const fltrAttrs = new Map();
            childAttrs.forEach((val, key) => {
                !attrs.get(key) && fltrAttrs.set(key, val);
            });
            return fltrAttrs;
        },
        clear: () => {
            childAttrs.clear();
        }
    };
})();
export const setChildAttrs = attrs => {
    widgetChildAttrs.set(attrs);
    return '';
};
export const getChildAttrs = attrs => {
    return getAttrMarkup(widgetChildAttrs.get(attrs));
};
export const clearChildAttrs = () => {
    widgetChildAttrs.clear();
    return '';
};
export const getFormMarkupAttr = attrs => {
    if (attrs.get('datavalue.bind')) {
        const onDataValueBinding = getDataSource(attrs.get('datavalue.bind'));
        attrs.set('datavaluesource.bind', onDataValueBinding);
    }
    return getAttrMarkup(attrs);
};

const getAttrMap = attrs => {
    const attrMap = new Map<string, string>();
    attrs.forEach(attr => {
        let [attrName, attrValue] = processAttr(attr);
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
            v = v.trim();
            if (k === '[ngClass]' && v.startsWith('{')) {
                v = v.replace(/"/g, `'`);
            }
            if (k === 'show.bind' && attrs.get('deferload') === 'true') {
                v = v + `" *lazyLoad="${wrapWithApos(v)}`;
            }
            attrMarkup += `="${v}"`;         
        }
    });

    return attrMarkup;
};

const getRequiredProviders = (nodeDef: IBuildTaskDef, providers: Array<IProviderInfo>, nodeAttrs) => {
    if (!nodeDef.requires) {
        return [];
    }

    let requires = nodeDef.requires as any;

    if (isString(requires)) {
        requires = [requires];
    }

    if (!Array.isArray(requires)) {
        return [];
    }

    return requires.map(require => {
        // for dynamic table assigning parent provide map to the child,
        for (let i = nodeAttrs.length - 1; i >= 0; i-- ) {
            if (nodeAttrs[i].name === 'tableName') {
                return nodeDef[nodeAttrs[i].value];
            }
        }

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

// replace <:svg:svg> -> <svg>, <:svg:*> -> <svg:*>
const getNodeName = name => name.replace(':svg:svg', 'svg').replace(':svg:', 'svg:');

export const processNode = (node, importCollector: (i: ImportDef[]) => void, providers?: Array<IProviderInfo>) => {
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
            requiredProviders = getRequiredProviders(nodeDef, providers, node.attrs);
            shared = new Map();
            template(node, shared, ...requiredProviders);
        }

        attrMap = getAttrMap(node.attrs);
        processDimensionAttributes(attrMap);

        const nodeName = getNodeName(node.name);

        if (nodeDef) {
            markup = (<any>pre)(attrMap, shared, ...requiredProviders);
            if (nodeDef.provide) {
                provideInfo = {
                    nodeName: node.name,
                    provide: isFunction(nodeDef.provide) ? nodeDef.provide(attrMap, shared, ...requiredProviders) : nodeDef.provide
                };
                // For table node, assigning parent provide map to the child, as child requires some parent provide attrs.
                if (node.name === 'wm-table') {
                    const tableColNodeDefn = registry.get('wm-table-column');
                    tableColNodeDefn[find(node.attrs, (el) => el.name === 'name').value + provideInfo.provide.get('table_reference')] = provideInfo.provide;
                    registry.set('wm-table-column', tableColNodeDefn);
                }
                providers.push(provideInfo);
            }
        } else {
            markup = `<${nodeName} ${getAttrMarkup(attrMap)}>`;
        }

        node.children.forEach((child: Node | any) => {
            if(child.attrs) {
                let showInDeviceAttr, accessRolesAttr, deferLoadAttr, showAttr;
                child.attrs.forEach(function(attr){
                    if (attr.name === 'showindevice') {
                        showInDeviceAttr = attr;
                    } else if (attr.name === 'accessroles') {
                        accessRolesAttr = attr;
                    } else if (attr.name === 'deferload') {
                        deferLoadAttr = attr;
                    } else if (attr.name === 'show') {
                        showAttr = attr;
                    }
                });
                if((showInDeviceAttr && accessRolesAttr) || (showInDeviceAttr && deferLoadAttr) || (accessRolesAttr && deferLoadAttr)) {
                    /* If more than one out of showindevice, accessroles and deferload exist for a widget, add ng-container wrappers to fix angular limitation
                       of applying only one structural directive to an element.
                    *  */
                    const noSpan = ({} as ParseSourceSpan);
                    const showInDeviceContainer:any = showInDeviceAttr ? new Element('ng-container', [], [], noSpan, noSpan, noSpan) : '';
                    const accessRolesContainer:any = accessRolesAttr ? new Element('ng-container', [], [], noSpan, noSpan, noSpan) : '';
                    const deferLoadContainer:any = deferLoadAttr ? new Element('ng-container', [], [], noSpan, noSpan, noSpan) : '';
                    if (showInDeviceContainer) {
                        showInDeviceContainer.attrs.push(showInDeviceAttr);
                    }
                    if (accessRolesContainer) {
                        accessRolesContainer.attrs.push(accessRolesAttr);
                    }
                    if (deferLoadContainer) {
                        deferLoadContainer.attrs.push(deferLoadAttr);
                        if (showAttr) {
                            deferLoadContainer.attrs.push(showAttr);
                        }
                    }
                    remove(child.attrs, function (attr) {
                        // @ts-ignore
                        return attr.name === 'showindevice' || attr.name === 'accessroles' || attr.name === 'deferload'
                    });
                    let childContainer, parentContainer;
                    if (showInDeviceAttr && accessRolesAttr) {
                        childContainer = showInDeviceContainer;
                        parentContainer = accessRolesContainer;
                    } else if (showInDeviceAttr && deferLoadAttr) {
                        childContainer = showInDeviceContainer;
                        parentContainer = deferLoadContainer;
                    } else if (accessRolesAttr && deferLoadAttr) {
                        childContainer = deferLoadContainer;
                        parentContainer = accessRolesContainer;
                    }
                    // wrap current node elements inside first ng-container(childContainer) and that container's elements inside another ng-container(parentContainer)
                    childContainer.children = [child];
                    parentContainer.children = [childContainer];
                    // if all three directives exist, create another wrapper for third ng-container(grandParentContainer)
                    if (showInDeviceAttr && accessRolesAttr && deferLoadAttr) {
                        const grandParentContainer = deferLoadContainer;
                        grandParentContainer.children = [parentContainer];
                        child = grandParentContainer;
                    } else {
                        child = parentContainer;
                    }

                }
            }
            return markup += processNode(child, importCollector, providers);
        });

        if (nodeDef) {
            if (provideInfo) {
                providers.splice(providers.indexOf(provideInfo), 1);
            }
            markup += (<any>post)(attrMap, shared, ...requiredProviders);
        } else {
            if (node.endSourceSpan && !getHtmlTagDefinition(node.name).isVoid) {
                markup += `</${nodeName}>`;
            }
        }
    } else if (node instanceof Text) {
        markup += node.value;
    } else if (node instanceof Comment) {
        if (!ignoreComments) {
            markup += node.value;
        }
    }
    importCollector(WIDGET_IMPORTS.get(node.name));

    if (node.name === 'wm-table-column') {
        const formatpattern = attrMap.get('custompipeformat') || attrMap.get('formatpattern');
        if (!!formatpattern) {
            switch (formatpattern) {
                case 'toDate':
                    importCollector(PIPE_IMPORTS.get('toDate'));
                    break;
                case 'toCurrency':
                    importCollector(PIPE_IMPORTS.get('toCurrency'));
                    break;
                case 'numberToString':
                    importCollector(PIPE_IMPORTS.get('numberToString'));
                    break;
                case 'stringToNumber':
                    importCollector(PIPE_IMPORTS.get('stringToNumber'));
                    break;
                case 'timeFromNow':
                    importCollector(PIPE_IMPORTS.get('timeFromNow'));
                    break;
                case 'prefix':
                    importCollector(PIPE_IMPORTS.get('prefix'));
                    break;
                case 'suffix':
                    importCollector(PIPE_IMPORTS.get('suffix'));
                    break;
                default:
                    if(checkIsCustomPipeExpression(formatpattern)){
                        importCollector(PIPE_IMPORTS.get('custom'));
                    }
            }
        }
    }

    if (node.name === 'wm-liveform') {
        const formlayout = attrMap.get('formlayout');
        if (formlayout === 'dialog') {
            importCollector(WIDGET_IMPORTS.get('wm-dialog'));
        }
    }

    if (node.name === 'wm-form-field' || node.name === 'wm-filter-field') {
        const formfieldtype = attrMap.get('type');
        if (formfieldtype && [FormWidgetType.DATE, FormWidgetType.DATETIME, FormWidgetType.TIME, FormWidgetType.TIMESTAMP].includes(formfieldtype)) {
            importCollector(PIPE_IMPORTS.get('toDate'));
        }
    }

    if (nodeDef && nodeDef.imports) {
        let imports = [];
        if (typeof nodeDef.imports === 'function') {
            imports = nodeDef.imports(attrMap);
        } else {
            imports = nodeDef.imports;
        }
        imports.forEach( i => {
            importCollector(WIDGET_IMPORTS.get(i));
        });
    }
    return markup;
};

export const transpile = (markup: string = '') => {
    if (!markup.length) {
        return;
    }
    let requiredWMComponents = [];
    const nodes = htmlParser.parse(markup, '');

    if (nodes.errors.length) {
        return;
    }

    let output = '';
    for (const node of nodes.rootNodes) {
        output += processNode(node, (imports: ImportDef[]) => {
            if (imports) {
                requiredWMComponents = requiredWMComponents.concat(imports);
            }
        });
    }
    requiredWMComponents = uniqWith(requiredWMComponents, isEqual);
    requiredWMComponents = sortBy(requiredWMComponents, ['from', 'name']);
    return {
        markup: output,
        requiredWMComponents: requiredWMComponents
    };
};

export const register = (nodeName: string, nodeDefFn: () => IBuildTaskDef) => registry.set(nodeName, nodeDefFn());

export interface ImportDef {
    from: string;
    name: string;
    as?: string;
    forRoot?: boolean;
    platformType?: string;
}

export interface IBuildTaskDef {
    requires?: string | Array<string>;
    template?: (node: Element | Text | Comment, shared?: Map<any, any>, ...requires: Array<Map<any, any>>) => void;
    pre: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => string;
    provide?: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => Map<any, any>;
    post?: (attrs: Map<string, string>, shared ?: Map<any, any>, ...requires: Array<Map<any, any>>) => string;
    imports?:  string[] | ((attrs: Map<string, string>) => string[]);
}

export const scopeComponentStyles = (componentName, componentType, styles = '') => {
    componentName = componentName.toLowerCase();
    const comments = {};
    let commentCount = 0;
    if (styles.startsWith('/*DISABLE_SCOPING*/')) {
        return styles;
    }
    styles = styles.replace(CSS_REGEX.COMMENTS_FORMAT, comment => {
        const key = `@comment${commentCount++}{`;
        comments[key] = comment;
        return key;
    });
    styles = styles.replace(CSS_REGEX.SELECTOR_FORMAT, (selector) => {
        if (!CSS_REGEX.SELECTOR_EXCLUDE_FORMAT.test(selector)) {
            const firstNonSpaceCharIndex = selector.match(/\S/).index;
            let prefixSpaceCharSeq = '';
            if (firstNonSpaceCharIndex > 0) {
                prefixSpaceCharSeq = selector.substring(0, firstNonSpaceCharIndex);
                selector = selector.substring(firstNonSpaceCharIndex);
            }
            if (!selector.startsWith('/*') && selector.trim().length > 0) {
                // splits the selector by commas and we iterate over the array and add page level scoping and join it.
                selector = selector.split(',').map(s => {
                    let prefix = ELE_PREFIX;
                    s = s.trim();
                    const spaceIndex = s.indexOf(' ');
                    if (s.startsWith(ELE_PREFIX)) {
                        if (spaceIndex > 0) {
                            prefix = s.substring(0, spaceIndex);
                            s = s.substring(spaceIndex + 1);
                        } else {
                            return s;
                        }
                    }

                    if (componentType === 0 || componentType === 'PAGE') {
                        s = `${prefix} app-page-${componentName} ${s}`;
                    } else if (componentType === 1 || componentType === 'PREFAB') {
                        s = `${prefix} app-prefab-${componentName} ${s}`;
                    } else if (componentType === 2 || componentType === 'PARTIAL') {
                        s = `${prefix} app-partial-${componentName} ${s}`;
                    } else if(componentType === 3 || componentType === 'WIDGET'){
                        s = `${prefix} app-custom-${componentName} ${s}`;
                    }
                    return s;
                }).join(',');
            }
            selector = prefixSpaceCharSeq + selector;
        }
        return selector;
    });
    for (const key in comments) {
        styles = styles.replace(key, comments[key]);
    }
    return styles;
};

