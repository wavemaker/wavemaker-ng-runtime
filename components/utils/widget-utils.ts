import { stringStartsWith, getEvaluatedExprValue } from '@utils/utils';

declare const _;
/**
 * Returns the parsed, updated bound expression
 * if the expression is $[data[$i][firstName]] + '--' + $[lastName] + '--' + $['@ID@']
 * returns __1.firstName + '--' + lastName + '--' + __1['@ID@']
 */
const getUpdatedExpr = (expr: string) => {
    let updated = '', ch, next, i, j, matchCh, matchCount, isQuotedStr, subStr, isQuotedStrEvaluated;

    expr = expr.replace(/\$\[data\[\$i\]/g, '$[__1');

    for (i = 0; i < expr.length; i++) {
        ch = expr[i];
        next = expr[i + 1];

        /**
         * if the expression starts with $[, check the next(ch) character,
         *    if ch is a quote(', ") change the expr to __[
         *    if ch is a whiteSpace, remove it
         *    else remove $[
         */
        if (ch === '$' && next === '[') {
            matchCount = 1;
            subStr = '';
            isQuotedStrEvaluated = false;
            isQuotedStr = false;

            for (j = i + 2; j < expr.length; j++) {

                matchCh = expr[j];

                if (matchCh === ' ') {
                    continue;
                }

                if (!isQuotedStrEvaluated) {
                    isQuotedStr = expr[j] === '"' || expr[j] === '\'';
                    isQuotedStrEvaluated = true;
                }

                if (matchCh === '[') {
                    matchCount++;
                } else if (matchCh === ']') {
                    matchCount--;
                }

                if (!matchCount) {
                    subStr = expr.substring(i + 2, j);
                    if (isQuotedStr) {
                        updated += '__1[' + subStr + ']';
                    } else {
                        updated += subStr;
                    }

                    break;
                }
            }
            i = j;
        } else {
            updated += ch;
        }
    }

    return updated;
};

/**
 * Returns the value for the provided key in the object
 */
export const getObjValueByKey = (obj: any, strKey: string) => {
    /* check for the key-string */
    if (strKey) {
        let val;
        /* convert indexes to properties, so as to work for even 'key1[0].child1'*/
        strKey.replace(/\[(\w+)\]/g, '.$1').split('.').forEach(function (key) {
            // If obj is null, then assign val to null.
            val = (val && val[key]) || (_.isNull(obj) ? obj : obj[key]);
        });
        return val;
    }
    return obj;
};

/**
 * returns the display field data for select, radioboxset and checkboxset widgets
 * Based on the bind display expression or display expression or display name,
 * data is extracted and formatted from the passed option object
 */
export const getEvaluatedData = (dataObj: any, options: any) => {
    let expressionValue;
    const displayField = options.displayfield,
        displayExp = options.displayexpression;

    // if key is bound expression
    if (displayExp) {
        if (stringStartsWith(displayExp, 'bind:')) {
            // remove 'bind:' prefix from the boundExpressionName
            expressionValue = displayExp.replace('bind:', '');
            // parse the expressionValue for replacing all the expressions with values in the object
            expressionValue = this.getUpdatedExpr(expressionValue);

            // TODO: Optimize the behavior
            const f = new Function('__1', '__2', '__3', 'return ' + expressionValue);
            // evaluate the expression in the given scope and return the value
            return f(_.assign({}, dataObj, {'__1': dataObj}));
        }
        return getEvaluatedExprValue(dataObj, displayExp);
    }

    /*If value is passed*/
    if (displayField) {
        return this.getObjValueByKey(dataObj, displayField);
    }
};

/**
 * This handler will invoke the function reference passed to the event
 * @param component
 * @param eventName
 * @param args
 */
export const invokeEventHandler = (component, eventName, args?) => {

    if (!component) {
        return;
    }

    if (!args) {
        args = {};
    }

    const fn = component.eventHandlers.get(eventName);

    if (fn) {
        args.widget = args.widget || component.widget;
        fn(args);
    }
};
