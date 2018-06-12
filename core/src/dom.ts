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

export const appendNode = (node: HTMLElement, parent: HTMLElement, sync?: boolean) => {
    const task = () => parent.appendChild(node);
    sync ? task() : invokeLater(task);
};

export const insertBefore = (node: HTMLElement, ref: HTMLElement, sync?: boolean) => {
    const task = () => ref.parentNode.insertBefore(node, ref);
    sync ? task() : invokeLater(task);
};

export const insertAfter = (node: HTMLElement, ref: HTMLElement, sync?: boolean) => {
    const task = () => ref.parentNode.insertBefore(node, ref.nextSibling);
    sync ? task() : invokeLater(task);
};

export const removeNode = (node: HTMLElement, sync?: boolean) => {
    const task = () => node.remove();
    sync ? task() : invokeLater(task);
};

export const removeClass = (node: HTMLElement, ov: string, sync?: boolean) => {
    ov = ov || '';
    const task = c => node.classList.remove(c);
    ov.split(' ').forEach(c => {
        if (c.length) {
            sync ? task(c) : invokeLater(() => task(c));
        }
    });
};

export const addClass = (node: HTMLElement, nv: string, sync?: boolean) => {
    nv = nv || '';
    const task = c => node.classList.add(c);
    nv.split(' ').forEach(c => {
        if (c.length) {
            sync ? task(c) : invokeLater(() => task(c));
        }
    });
};

export const switchClass = (node: HTMLElement, toAdd: string = '', toRemove: string = '', sync?: boolean) => {
    removeClass(node, toRemove, sync);
    addClass(node, toAdd, sync);
};

export const toggleClass = (node: HTMLElement, cls: string, condition: boolean, sync?: boolean) => {
    if (condition) {
        addClass(node, cls, sync);
    } else {
        removeClass(node, cls, sync);
    }
};

export const setCSS = (node: HTMLElement, cssName: string, val?: string | number, sync?: boolean) => {
    const task = () => node.style[cssName] = val;
    if (val && (cssName === 'width' || cssName === 'height')) {
        val = toDimension(val);
    }
    sync ? task() : invokeLater(task);
};

export const setCSSFromObj = (node: HTMLElement, cssObj: any, sync?: boolean) => {
    const keys = Object.keys(cssObj || {});
    keys.forEach(key => setCSS(node, key, cssObj[key], sync));
};

export const setProperty = (node: HTMLElement, propName: string, val: any, sync?: boolean) => {
    const task = () => node[propName] = val;
    sync ? task() : invokeLater(task);
};

export const setAttr = (node: HTMLElement, attrName: string, val: any, sync?: boolean) => {
    const task = () => node instanceof Element && node.setAttribute(attrName, val);
    sync ? task() : invokeLater(task);
};

export const setHtml = (node: HTMLElement, html: string, sync?: boolean) => {
    const task = () => node.innerHTML = html;
    sync ? task() : invokeLater(task);
};

export const removeAttr = (node: HTMLElement, attrName: string, sync?: boolean) => {
    const task = () => node.removeAttribute(attrName);
    sync ? task() : invokeLater(task);
};

export const createElement = (nodeType: string, attrs: any, sync?: boolean): HTMLElement => {
    const node = document.createElement(nodeType);

    if (attrs) {
        Object.keys(attrs).forEach(attrName => {
            setAttr(node, attrName, attrs[attrName], sync);
        });
    }
    return node;
};

// for width and height if a numeric value is specified return in px
// else return the same value
export const toDimension = (v: string | number) => {
    // @ts-ignore
    if (v == +v) {
        return `${v}px`;
    }
    return v;
};