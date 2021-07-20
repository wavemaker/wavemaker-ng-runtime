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
import { getScopePrototypeObject } from './utils';

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
    cAst; // current AST node in the process
    pipeNameVsIsPureMap;
    context:any;

    constructor(ast,  pipeNameVsIsPureMap?, ctx?) {
        this.ast = ast;
        this.pipeNameVsIsPureMap = pipeNameVsIsPureMap;
        this.context = ctx;
    }


    processImplicitReceiver() {
        return this.context;
    }

    processLiteralPrimitive() {
        const ast = this.cAst;
        return ast.value;
    }

    processLiteralArray() {
        const ast = this.cAst;
        const s = [];
        for (const item of ast.expressions) {
            s.push(this.build(item));
        }
        return [...s];
    }

    processLiteralMap() {
        const ast = this.cAst;
        const _values = [];
        for (const _value of ast.values) {
            _values.push(this.build(_value));
        }
        let liternalMap = {};
         ast.keys.map((k, i) => {
            return liternalMap[k.key] = _values[i];
        });
        return liternalMap;
    }

    processPropertyRead() {
        const ast = this.cAst;
        const r = this.build(ast.receiver);
        if(!r){
            return r;
        }
        return r[ast.name];
    }

    processKeyedRead() {
        const ast = this.cAst;
        const k = this.build(ast.key);
        const o = this.build(ast.obj);
        return o[k];
    }

    processPrefixNot() {
        const ast = this.cAst;
        const r = this.build(ast.expression);
        return !r;
    }

    handleBinaryPlus_Minus() {
        const ast = this.cAst;
        const l = this.build(ast.left);
        const r = this.build(ast.right);
        if(ast.operation === '+'){
          return  plus(l, r)
        }else if(ast.operation === '-'){
           return minus(l, r)
        }
    }

    handleBinaryAND_OR() {
        const ast = this.cAst;
        const l = this.build(ast.left);
        const r = this.build(ast.right);

        if (ast.operation === '&&') {
            return l === true ? r : false;
        } else {
            return !l  ? r : l;
        }
    }

    handleBinaryDefault() {
        const ast = this.cAst;
        const l = this.build(ast.left);
        const r = this.build(ast.right);
        if(ast.operation === '!==' || ast.operation === '!='){
            return l !== r;
        }else if(ast.operation === '==' || ast.operation === '==='){
            return l === r;
        }
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
        const condition = this.build(ast.condition);
        const trueExp = this.build(ast.trueExp);
        const falseExp = this.build(ast.falseExp);

        if(condition){
            return trueExp;
        }else{
            return falseExp;
        }
    }

    processMethodCall() {
        const ast = this.cAst;
        const _args = [];
        for (const arg of ast.args) {
            _args.push(this.build(arg));
        }
        const reciever = this.build(ast.receiver);
        const isImplicitReceiver = ast.receiver instanceof ImplicitReceiver;
        if(!reciever || !reciever[ast.name]){
            return;
        }
        if(isImplicitReceiver){
           return reciever[ast.name].bind(this.context)(..._args);
        }else{
            return  reciever[ast.name](..._args);
        }
    }

    processChain() {
        const ast = this.cAst;
        let exprsn =  ast.expressions.map(e => this.build(e));
        return exprsn.join(';');
    }

    processPropertyWrite() {
        const ast = this.cAst;
        let receiver, lhs;
        if (ast.receiver instanceof ImplicitReceiver) {
            lhs =   this.context[ast.name];
        } else {
            receiver = this.build(ast.receiver);
            lhs = receiver && receiver.length ? receiver[ast.name] :ast.name; 
        }

        const rhs = this.build(ast.value);
        return rhs;
    }

    processPipe() {
        const ast = this.cAst;
        const _args = [];
        const exp = this.build(ast.exp);
        for (const arg of ast.args) {
            _args.push(this.build(arg));
        }

        _args.unshift(exp);
        const pipeInstance = pipeProvider.getInstance(ast.name);
        if(this.pipeNameVsIsPureMap.get(ast.name)){
            const pipeInfo = pipeProvider.meta(ast.name);
            return getPurePipeVal(
                pipeInstance,
                pipeInfo.pure ? new Map() : undefined, 
                ast.name, 
                ..._args
                );
           
        } else {
           return pipeInstance.transform(..._args);
        }
       
    }

  
    build(ast) {
        this.cAst = ast;

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


    compile() {
        let result = this.build(this.ast);
        return result;
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

/**
 * 
 * @param expr Angular expression
 * @param scope  scope of the component where expression will be evaluated
 * @param locale  It is an optional argument 
 * @returns 
 */
export function $parseExpr(expr: string, scope, locale?): ParseExprResult {
    let ctx = getScopePrototypeObject(scope, locale);
    if(!ctx){
        return;
    }
    if (!pipeProvider) {
        console.log('set pipe provider');
        return;
    }

    if (!isString(expr)) {
        return;
    }

    expr = expr.trim();

    if (expr.endsWith(';')) {
        expr = expr.slice(0, -1); // remove the trailing semicolon
    }

    if (!expr.length) {
        return;
    }

    let exprValue = undefined; 

    const parser = new Parser(new Lexer);
    const ast = parser.parseBinding(expr, '',0);

    if (ast.errors.length) {
        exprValue = undefined;
    } else {
        const pipeNameVsIsPureMap = pipeProvider.getPipeNameVsIsPureMap();
        const astCompiler = new ASTCompiler(ast.ast,  pipeNameVsIsPureMap, ctx);
        exprValue = astCompiler.compile();
        return exprValue;
       
    }
   
}

/**
 * 
 * @param expr Evaluated expression
 * @param scope scope of the component to be evaluated in the context
 * @param locale 
 * @returns 
 */
export function $parseEvent(expr, scope, locale?): ParseExprResult {
    let ctx = getScopePrototypeObject(scope, locale);

    if(!ctx){
        return;
    }
    if (!isString(expr)) {
        return;
    }

    expr = expr.trim();

    if (!expr.length) {
        return;
    }

    let exprValue = eventFnCache.get(expr);

    if (exprValue) {
        return exprValue;
    }
    const parser = new Parser(new Lexer);
    const ast = parser.parseAction(expr, '',0);

    if (ast.errors.length) {
        return;
    }
    const astCompiler = new ASTCompiler(ast.ast,  null, ctx);
    exprValue = astCompiler.compile();
    eventFnCache.set(expr, exprValue);
    return exprValue;
}
