const $RAF = window.requestAnimationFrame;
const $RAFQueue = [];

const invokeLater = fn => {
    if (!$RAFQueue.length) {
        $RAF(() => {
            $RAFQueue.forEach(f => f());
            $RAFQueue.length = 0;
        });
    }
    $RAFQueue.push(fn);
};

export const appendNode = ($node: HTMLElement, $parent: HTMLElement) => {
    invokeLater(() => $parent.appendChild($node));
};

export const insertBefore = ($node: HTMLElement, $ref: HTMLElement) => {
    invokeLater(() => $ref.parentNode.insertBefore($node, $ref));
};

export const insertAfter = ($node: HTMLElement, $ref: HTMLElement) => {
    invokeLater(() => $ref.parentNode.insertBefore($node, $ref.nextSibling));
};

export const removeNode = ($node: HTMLElement) => {
    invokeLater(() => $node.remove());
};

export const removeClass = ($node: HTMLElement, ov: string = '') => {
    ov.split(' ').forEach(c => {
        if (c.length) {
            invokeLater(() => $node.classList.remove(c));
        }
    });
};

export const addClass = ($node: HTMLElement, nv: string = '') => {
    nv.split(' ').forEach(c => {
        if (c.length) {
            invokeLater(() => $node.classList.add(c));
        }
    });
};

export const switchClass = ($node: HTMLElement, toAdd: string = '', toRemove: string = '') => {
    removeClass($node, toRemove);
    addClass($node, toAdd);
};

export const toggleClass = ($node: HTMLElement, cls: string, condition: boolean) => {
    if (condition) {
        addClass($node, cls);
    } else {
        removeClass($node, cls);
    }
};

export const setCSSObj = ($node: HTMLElement, cssObj: any) => {
    const keys = Object.keys(cssObj || {});
    keys.forEach(key => setCSS($node, key, cssObj[key]));
};

export const setCSS = ($node: HTMLElement, cssName: string, val?: string | number) => {
    if (val && (cssName === 'width' || cssName === 'height')) {
        val = toDimension(val);
    }
    invokeLater(() => $node.style[cssName] = val);
};

export const setProperty = ($node: HTMLElement, propName: string, val: any) => {
    invokeLater(() => $node[propName] = val);
};

export const setAttr = ($node: HTMLElement, attrName: string, val: any) => {
    invokeLater(() => $node.setAttribute(attrName, val));
};

export const setHtml = (node: HTMLElement, html: string) => {
    invokeLater(() => node.innerHTML = html);
};

export const removeAttr = ($node: HTMLElement, attrName: string) => {
    invokeLater(() => $node.removeAttribute(attrName));
};

// for width and height if a numeric value is specified return in px
// else return the same value
const toDimension = (v: string | number) => {
    // @ts-ignore
    if (v == +v) {
        return `${v}px`;
    }
    return v;
};
