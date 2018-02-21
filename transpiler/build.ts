import {
    HtmlParser,
    Element,
    Text,
    Comment,
    Parser,
    Lexer,
    MethodCall,
    PropertyRead,
    Chain,
    PropertyWrite,
    ImplicitReceiver,
    LiteralPrimitive,
    LiteralArray,
    LiteralMap, PrefixNot, Binary, Conditional
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
const expParser = new Parser(new Lexer);

const processAST = (ast, argInfo) => {
    let retValue = '';

    if (ast instanceof LiteralPrimitive) {
        if (typeof ast.value === 'string') {
            return `'${ast.value}'`;
        }
        return ast.value;
    } else if (ast instanceof LiteralArray) {
        return `[${ast.expressions.map(e => processAST(e, argInfo))}]`;
    } else if (ast instanceof LiteralMap) {
        const keys = ast.keys.map(k => {
            if (k.quoted) {
                return `'${k.key}'`;
            } else {
                return k.key;
            }
        });

        const values = ast.values.map(v => {
            return processAST(v, argInfo);
        });

        const map = [];
        keys.forEach((k, i) => {
            map.push(`${k}:${values[i]}`);
        });

        return `{${map.join(',')}}`;
    } else if (ast instanceof MethodCall) {
        const args = ast.args.map(arg => {
            if (argInfo[arg.name]) {

                return argInfo[arg.name];
            } else {
                return processAST(arg, argInfo);
            }
        });

        let receiver = processAST(ast.receiver, argInfo);
        return `${receiver}${receiver.length ? '.' : ''}${ast.name}(${args.join(',')})`;
    } else if (ast instanceof Chain) {
        retValue += ast.expressions.map(e => {
            return processAST(e, argInfo);
        }).join(';');
        return retValue;
    } else if (ast instanceof ImplicitReceiver) {
        return '';
    } else if (ast instanceof PropertyRead) {
        const receiver = processAST(ast.receiver, argInfo);
        return `${receiver}${receiver.length ? '.' : ''}${ast.name}`;
    } else if (ast instanceof PropertyWrite) {
        let receiver = processAST(ast.receiver, argInfo);
        let lhs = `${receiver}${receiver.length ? '.' : ''}${ast.name}`;
        let rhs = processAST(ast.value, argInfo);

        return `${lhs}=${rhs}`;
    } else if (ast instanceof PrefixNot) {
        ast = ast.expression;
        let receiver = processAST(ast.receiver, argInfo);
        return `!${receiver}${receiver.length ? '.' : ''}${ast.name}`;
    } else if (ast instanceof Binary) {
        return `${processAST(ast.left, argInfo)}${ast.operation}${processAST(ast.right, argInfo)}`;
    } else if (ast instanceof Conditional) {
        return `${processAST(ast.condition, argInfo)} ? ${processAST(ast.trueExp, argInfo)} : ${processAST(ast.falseExp, argInfo)}`;
    }

    return retValue;
};

const isEvent = name => name[0] === 'o' && name[1] === 'n' && name[2] === '-';

const getEventName = key => key.substr(3);

const processBinding = (attr, expr) => `${attr.name}.bind="${quoteAttr(expr)}"`;

const processEventValue = (value, argInfo) => {
    let parsed = expParser.parseAction(value, '');

    if (parsed.errors.length) {
        return '';
    }

    let ast = parsed.ast;

    return processAST(ast, argInfo);
};

const processEvent = (attr, eventArgOverrides) => {
    const evtName = getEventName(attr.name);

    const value = processEventValue(attr.value, eventArgOverrides);

    return `(${evtName})="${value}"`;
};

const processAttr = (attr, nodeDef, widgetName) => {
    let overridden = OVERRIDES[attr.name];
    let value = attr.valueSpan ? `="${attr.value}"` : '';
    if (overridden) {
        return `${overridden}${value}`;
    }

    if (isEvent(attr.name)) {
        let eventArgOverrides = ((nodeDef.events || {})[attr.name] || {...DEFAULT_EVENT_DEF});

        if (widgetName) {
            Object.keys(eventArgOverrides).forEach(k => {
                let v = eventArgOverrides[k];

                if (v === 'WIDGET') {
                    eventArgOverrides[k] = `Widgets.${widgetName}`;
                }
            });
        }

        return processEvent(attr, eventArgOverrides);
    }

    let boundExpr = getBoundToExpr(attr.value);
    if (boundExpr) {
        return processBinding(attr, boundExpr);
    }

    return `${attr.name}${value}`;
};

const processAttrs = (attrs, nodeDef) => {
    let widgetName;
    attrs.some(attr => {
        if (attr.name === 'name') {
            widgetName = attr.value;
            return true;
        }
    });
    return attrs.map(attr => processAttr(attr, nodeDef, widgetName)).join(' ');
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

        startTag = `<${tagName} ${getAttrs(nodeDef)} ${processAttrs(node.attrs, nodeDef)}>`;
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

export const DEFAULT_EVENT_DEF = {
    $event: '$event',
    $scope: 'WIDGET'
};
