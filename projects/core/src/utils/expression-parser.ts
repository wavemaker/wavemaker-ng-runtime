import {
    Lexer,
    Parser,
    BindingPipe,
    ReadPropExpr,
    PropertyRead,
    ImplicitReceiver,
    LiteralPrimitive,
    MethodCall,
    Conditional,
    Binary,
    PrefixNot,
    KeyedRead,
    LiteralMap,
    LiteralArray,
    Chain,
    PropertyWrite
} from '@angular/compiler';

const isString = v => typeof v === 'string';
const isDef = v => v !== void 0;
const ifDef = (v, d) => v === void 0 ? d : v;
const plus = (a, b) => void 0 === a ? b : void 0 === b ? a : a + b;
const minus = (a, b) => ifDef(a, 0) - ifDef(b, 0);
const noop = () => {};

export type ParseExprResult = (data?: any, locals?: any) => any;

const exprFnCache = new Map();
const eventFnCache = new Map();
const purePipes = new Map();

const primitiveEquals = (a, b) => {
    if (typeof a === 'object' || typeof b === 'object') {
        return false;
    }
    if (a !== a && b !== b) { // NaN case
        return true;
    }
    return a === b;
};

const detectChanges = (ov, nv) => {
    const len = nv.length;
    let hasChange = len > 10;
    switch (len) {
        case 10:
            hasChange = !primitiveEquals(ov[9], nv[9]);
            if (hasChange) {
                break;
            }
        case 9:
            hasChange = !primitiveEquals(ov[8], nv[8]);
            if (hasChange) {
                break;
            }
        case 8:
            hasChange = !primitiveEquals(ov[7], nv[7]);
            if (hasChange) {
                break;
            }
        case 7:
            hasChange = !primitiveEquals(ov[6], nv[6]);
            if (hasChange) {
                break;
            }
        case 6:
            hasChange = !primitiveEquals(ov[5], nv[5]);
            if (hasChange) {
                break;
            }
        case 5:
            hasChange = !primitiveEquals(ov[4], nv[4]);
            if (hasChange) {
                break;
            }
        case 4:
            hasChange = !primitiveEquals(ov[3], nv[3]);
            if (hasChange) {
                break;
            }
        case 3:
            hasChange = !primitiveEquals(ov[2], nv[2]);
            if (hasChange) {
                break;
            }
        case 2:
            hasChange = !primitiveEquals(ov[1], nv[1]);
            if (hasChange) {
                break;
            }
        case 1:
            hasChange = !primitiveEquals(ov[0], nv[0]);
            if (hasChange) {
                break;
            }
    }
    return hasChange;
};

const getPurePipeVal = (pipe, cache, identifier, ...args) => {
    let lastResult = cache.get(identifier);
    let result;
    if (lastResult) {
        const isModified = detectChanges(lastResult.args, args);
        if (!isModified) {
            return lastResult.result;
        }
    }
    result = pipe.transform(...args);
    lastResult = {args, result};
    cache.set(identifier, lastResult);
    return result;
};

const STR_ESCAPE_REGEX = /[^ a-zA-Z0-9]/g;

const stringEscapeFn = str => {
    return '\\u' + ('0000' + str.charCodeAt(0).toString(16)).slice(-4);
};

class ASTCompiler {
    ast; // ast to be compiled
    declarations; // variable names
    stmts; // function body statements
    pipes; // used pipes
    vIdx; // variable name index
    cAst; // current AST node in the process
    cStmts;
    pipeNameVsIsPureMap;
    exprType: ExpressionType;

    constructor(ast, exprType, pipeNameVsIsPureMap?) {
        this.ast = ast;
        this.declarations = [];
        this.stmts = [];
        this.pipes = [];
        this.vIdx = 0;
        this.exprType = exprType;
        this.pipeNameVsIsPureMap = pipeNameVsIsPureMap;
    }

    createVar() {
        const v = `v${this.vIdx++}`;
        this.declarations.push(v);
        return v;
    }

    processImplicitReceiver() {
        return 'ctx';
    }

    processLiteralPrimitive() {
        const ast = this.cAst;
        return isString(ast.value) ? `"${ast.value.replace(/"/g, '\"').replace(STR_ESCAPE_REGEX, stringEscapeFn)}"` : ast.value;
    }

    processLiteralArray() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const v = this.createVar();
        const s = [];
        for (const item of ast.expressions) {
            s.push(this.build(item, stmts));
        }
        stmts.push(`${v}=[${s.join(',')}]`);
        return v;
    }

    processLiteralMap() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const v = this.createVar();
        const _values = [];
        for (const _value of ast.values) {
            _values.push(this.build(_value, stmts));
        }
        stmts.push(`${v}={${ast.keys.map((k, i) => `'${k.key}':${_values[i]}`)}}`);
        return v;
    }

    processPropertyRead() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const r = this.build(ast.receiver, stmts);
        const v = this.createVar();
        stmts.push(`${v}=${r}&&${r}.${ast.name}`);
        return v;
    }

    processKeyedRead() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const k = this.build(ast.key, stmts);
        const o = this.build(ast.obj, stmts);
        const v = this.createVar();
        stmts.push(`${v}=${o}&&${o}[${k}]`);
        return v;
    }

    processPrefixNot() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const r = this.build(ast.expression, stmts);
        stmts.push(`${r}=!${r}`);
        return r;
    }

    handleBinaryPlus_Minus() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const l = this.build(ast.left, stmts);
        const r = this.build(ast.right, stmts);
        const v = this.createVar();
        const m = ast.operation === '+' ? '_plus' : '_minus';
        stmts.push(`${v}=${m}(${l},${r})`);
        return v;
    }

    handleBinaryAND_OR() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const _s1 = [];
        const _sl = [];
        const _sr = [];
        const l = this.build(ast.left, _sl);
        const r = this.build(ast.right, _sr);

        const v = this.createVar();

        if (ast.operation === '&&') {
            _s1.push(
                _sl.join(';'),
                `;${v}=false`,
                `;if(${l}){`,
                _sr.join(';'),
                `;${v}=${r};`,
                `}`
            );
        } else {
            _s1.push(
                _sl.join(';'),
                `;${v}=${l}`,
                `;if(!${l}){`,
                _sr.join(';'),
                `;${v}=${r};`,
                `}`
            );
        }
        stmts.push(_s1.join(''));
        return v;
    }

    handleBinaryDefault() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const l = this.build(ast.left, stmts);
        const r = this.build(ast.right, stmts);
        const v = this.createVar();
        stmts.push(`${v}=${l}${ast.operation}${r}`);
        return v;
    }

    processBinary() {
        const ast = this.cAst;
        const op = ast.operation;
        if (op === '+' || op === '-') {
            return this.handleBinaryPlus_Minus();
        }
        if (op === '&&' || op === '||') {
            return this.handleBinaryAND_OR();
        }

        return this.handleBinaryDefault();
    }

    processConditional() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const condition = this.build(ast.condition, stmts);
        const v = this.createVar();
        const _s1 = [];
        const _s2 = [];
        const _s3 = [];
        const trueExp = this.build(ast.trueExp, _s2);
        const falseExp = this.build(ast.falseExp, _s3);

        _s1.push(
            `if(${condition}){`,
            _s2.join(';'),
            `;${v}=${trueExp};`,
            `}else{`,
            _s3.join(';'),
            `;${v}=${falseExp};`,
            `}`
        );

        stmts.push(_s1.join(' '));
        return v;
    }

    processMethodCall() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const _args = [];
        for (const arg of ast.args) {
            _args.push(this.build(arg, stmts));
        }
        const fn = this.build(ast.receiver, stmts);
        const v = this.createVar();
        const isImplicitReceiver = ast.receiver instanceof ImplicitReceiver;
        stmts.push(`${v}= ${fn}&&${fn}.${ast.name}&&${fn}.${ast.name}${isImplicitReceiver ? '.bind(_ctx)' : ''}(${_args.join(',')})`);
        return v;
    }

    processChain() {
        const ast = this.cAst;
        return ast.expressions.map(e => this.build(e)).join(';');
    }

    processPropertyWrite() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        let receiver, lhs;
        if (ast.receiver instanceof ImplicitReceiver) {
            lhs = `_ctx.${ast.name}`;
        } else {
            receiver = this.build(ast.receiver, stmts);
            lhs = `${receiver}${receiver.length ? '.' : ''}${ast.name}`;
        }

        const rhs = this.build(ast.value, stmts);
        stmts.push(`${lhs}=${rhs}`);
    }

    processPipe() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const t = this.createVar();
        const _args = [];
        const _s1 = [];
        const _s2 = [];
        const exp = this.build(ast.exp, stmts);
        for (const arg of ast.args) {
            _args.push(this.build(arg, _s2));
        }

        const p = `_p${this.pipes.length}`;
        this.pipes.push([ast.name, p]);

        _args.unshift(exp);

        _s1.push(
            _s2.length ? _s2.join(';') + ';' : '',
            this.pipeNameVsIsPureMap.get(ast.name) ? `${t}=getPPVal(${p},_ppc,"${p}",${_args})` : `${t}=${p}.transform(${_args})`
        );

        stmts.push(_s1.join(''));
        return t;
    }

    build(ast, cStmts?) {
        this.cAst = ast;
        this.cStmts = cStmts || this.stmts;

        if (ast instanceof ImplicitReceiver) {
            return this.processImplicitReceiver();
        } else if (ast instanceof LiteralPrimitive) {
            return this.processLiteralPrimitive();
        } else if (ast instanceof LiteralArray) {
            return this.processLiteralArray();
        } else if (ast instanceof LiteralMap) {
            return this.processLiteralMap();
        } else if (ast instanceof PropertyRead) {
            return this.processPropertyRead();
        } else if (ast instanceof PropertyWrite) {
            return this.processPropertyWrite();
        } else if (ast instanceof KeyedRead) {
            return this.processKeyedRead();
        } else if (ast instanceof PrefixNot) {
            return this.processPrefixNot();
        } else if (ast instanceof Binary) {
            return this.processBinary();
        } else if (ast instanceof Conditional) {
            return this.processConditional();
        } else if (ast instanceof MethodCall) {
            return this.processMethodCall();
        } else if (ast instanceof Chain) {
            return this.processChain();
        } else if (ast instanceof BindingPipe) {
            return this.processPipe();
        }
    }

    extendCtxWithLocals() {
        const v1 = this.createVar();
        this.stmts.push(
            `${v1}=Object.assign({}, locals)`,
            `Object.setPrototypeOf(${v1}, _ctx)`,
            `ctx=${v1}`
        );
    }

    fnBody() {
        this.declarations.push('ctx');
        return '"use strict";\nvar ' + this.declarations.join(',') + ';\n' + this.stmts.join(';');
    }

    fnArgs() {
        const args = ['_plus', '_minus', '_isDef'];

        if (this.exprType === ExpressionType.Binding) {
            args.push('getPPVal', '_ppc');
            for (const [, pipeVar] of this.pipes) {
                args.push(pipeVar);
            }
        }

        args.push('_ctx', 'locals');

        return args.join(',');
    }

    addReturnStmt(result) {
        // if (this.exprType === ExpressionType.Binding) {
            this.stmts.push(`return ${result};`);
        // }
    }

    cleanup() {
        this.ast = this.cAst = this.stmts = this.cStmts = this.declarations = this.pipes = this.pipeNameVsIsPureMap = undefined;
    }

    compile(defOnly?) {
        this.extendCtxWithLocals();
        this.addReturnStmt(this.build(this.ast));
        if (defOnly) {
            return {fnBody: this.fnBody(), fnArgs: this.fnArgs(), pipes: this.pipes};
        }
        const fn = new Function(this.fnArgs(), this.fnBody());
        let boundFn;
        if (this.exprType === ExpressionType.Binding) {
            boundFn = fn.bind(undefined, plus, minus, isDef, getPurePipeVal);
            boundFn.usedPipes = this.pipes.slice(0); // clone
        } else {
            boundFn = fn.bind(undefined, plus, minus, isDef);
        }

        this.cleanup();
        return boundFn;
    }
}

const nullPipe = () => {
    return {
        transform: noop
    };
};

let pipeProvider;

export function setPipeProvider(_pipeProvider) {
    pipeProvider = _pipeProvider;
}

enum ExpressionType {
    Binding,
    Action
}

export function $parseExpr(expr: string, defOnly?: boolean): ParseExprResult {

    if (!pipeProvider) {
        console.log('set pipe provider');
        return noop;
    }

    if (!isString(expr)) {
        return noop;
    }

    expr = expr.trim();

    if (expr.endsWith(';')) {
        expr = expr.slice(0, -1); // remove the trailing semicolon
    }

    if (!expr.length) {
        return noop;
    }

    let fn = exprFnCache.get(expr);

    if (fn) {
        return fn;
    }

    let boundFn;
    if (!defOnly) {
        boundFn = getFnForBindExpr(expr);
    }

    // fallback to generate function in runtime. This will break if CSP is enabled
    if (!boundFn) {
        const parser = new Parser(new Lexer);
        const ast = parser.parseBinding(expr, '',0);

        if (ast.errors.length) {
            fn = noop;
            boundFn = fn;
        } else {
            const pipeNameVsIsPureMap = pipeProvider.getPipeNameVsIsPureMap();
            const astCompiler = new ASTCompiler(ast.ast, ExpressionType.Binding, pipeNameVsIsPureMap);
            fn = astCompiler.compile(defOnly);
            if (defOnly) {
                return fn;
            }

            if (fn.usedPipes.length) {
                const pipeArgs = [];
                let hasPurePipe = false;
                for (const [pipeName] of fn.usedPipes) {
                    const pipeInfo = pipeProvider.meta(pipeName);
                    let pipeInstance;
                    if (!pipeInfo) {
                        pipeInstance = nullPipe;
                    } else {
                        if (pipeInfo.pure) {
                            hasPurePipe = true;
                            pipeInstance = purePipes.get(pipeName);
                        }

                        if (!pipeInstance) {
                            pipeInstance = pipeProvider.getInstance(pipeName);
                        }

                        if (pipeInfo.pure) {
                            purePipes.set(pipeName, pipeInstance);
                        }
                    }
                    pipeArgs.push(pipeInstance);
                }

                pipeArgs.unshift(hasPurePipe ? new Map() : undefined);
                boundFn = fn.bind(undefined, ...pipeArgs);
            } else {
                boundFn = fn.bind(undefined, undefined);
            }
        }
    }

    exprFnCache.set(expr, boundFn);

    return boundFn;
}

export function $parseEvent(expr, defOnly?): ParseExprResult {
    if (!isString(expr)) {
        return noop;
    }

    expr = expr.trim();

    if (!expr.length) {
        return noop;
    }

    let fn = eventFnCache.get(expr);

    if (fn) {
        return fn;
    }

    if (!defOnly) {
        fn = getFnForEventExpr(expr) || noop;
    }

    // fallback to generate function in runtime. This will break if CSP is enabled
    if(!fn) {
        const parser = new Parser(new Lexer);
        const ast = parser.parseAction(expr, '',0);

        if (ast.errors.length) {
            return noop;
        }
        const astCompiler = new ASTCompiler(ast.ast, ExpressionType.Action);
        fn = astCompiler.compile(defOnly);
    }

    eventFnCache.set(expr, fn);
    return fn;
}

const fnNameMap = new Map();

export const registerFnByExpr = (expr, fn, usedPipes) => {
    console.log('registering function for: ', expr);
    fn.usedPipes = usedPipes || [];
    fnNameMap.set(expr, fn);
}

export const getFnByExpr = (expr) => fnNameMap.get(expr)

const fnExecutor = (expr, exprType) => {
    let fn = getFnByExpr(expr);
    if (!fn) {
        console.warn('oops, didnt find fn for this expr', expr);
        return function(){};
    }
    const usedPipes = fn.usedPipes || [];

    if(exprType === ExpressionType.Binding) {
        fn = fn.bind(undefined, plus, minus, isDef, getPurePipeVal);
    } else {
        fn = fn.bind(undefined, plus, minus, isDef);
    }

    if (usedPipes.length) {
        const pipeArgs = [];
        let hasPurePipe = false;
        for (const [pipeName] of usedPipes) {
            const pipeInfo = pipeProvider.meta(pipeName);
            let pipeInstance;
            if (!pipeInfo) {
                pipeInstance = nullPipe;
            } else {
                if (pipeInfo.pure) {
                    hasPurePipe = true;
                    pipeInstance = purePipes.get(pipeName);
                }

                if (!pipeInstance) {
                    pipeInstance = pipeProvider.getInstance(pipeName);
                }

                if (pipeInfo.pure) {
                    purePipes.set(pipeName, pipeInstance);
                }
            }
            pipeArgs.push(pipeInstance);
        }

        pipeArgs.unshift(hasPurePipe ? new Map() : undefined);
        fn = fn.bind(undefined, ...pipeArgs);
    } else {
        if (exprType === ExpressionType.Binding) {
            fn = fn.bind(undefined, undefined);
        }
    }

    return fn;
}

export const getFnForBindExpr = (expr) => {
    return fnExecutor(expr, ExpressionType.Binding);
}

export const getFnForEventExpr = (expr) => {
    return fnExecutor(expr, ExpressionType.Action);
}
