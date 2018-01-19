var nodeTypeMetaMap = {
    'wm-page': {
        directives: {
            wmPage: undefined
        }
    },
    'wm-content': {
        nodeName: 'main',
        directives: {
            wmContent: undefined
        }
    },
    'wm-page-content': {
        directives: {
            wmPageContent: undefined
        }
    },
    'wm-layoutgrid': {
        directives: {
            wmLayoutgrid: undefined
        }
    },
    'wm-gridrow': {
        directives: {
            wmGridrow: undefined
        }
    },
    'wm-gridcolumn': {
        directives: {
            wmGridcolumn: undefined
        }
    },
    'wm-button': {
        nodeName: 'button',
        directives: {
            wmButton: undefined
        }
    },
    'wm-anchor': {
        nodeName: 'a',
        directives: {
            wmAnchor: undefined
        }
    },
    'wm-label': {
        nodeName: 'label',
        directives: {
            wmLabel: undefined
        }
    }
};
var DEFALUT_NODE_NAME = 'div';
var getOptimizedMarkupByNode = function (node) {
    var markup = '', nodeName = node.name, directives = '', meta = nodeTypeMetaMap[nodeName];
    if (meta) {
        nodeName = meta.nodeName || DEFALUT_NODE_NAME;
        for (var _i = 0, _a = Object.keys(meta.directives || {}); _i < _a.length; _i++) {
            var k = _a[_i];
            var v = meta.directives[k];
            directives += " " + k;
            if (v !== undefined) {
                directives += "=\"" + v + "\"";
            }
        }
    }
    markup += "<" + nodeName + directives;
    for (var _b = 0, _c = (node.attrs || []); _b < _c.length; _b++) {
        var attr = _c[_b];

        if (attr.name.startsWith('on-')) {
            attr.name = '(' + attr.name.substr(3) + ')';
        }

        if (attr.valueSpan) {
            if (attr.value.startsWith('bind:')) {
                attr.name = attr.name + '.bind';
                attr.value = attr.value.substr(5);
            }

            markup += " " + attr.name + "=\"" + attr.value + "\"";
        }
        else {
            markup += " " + attr.name;
        }
    }
    return {
        startNode: markup + ">",
        endNode: node.endSourceSpan ? "</" + nodeName + ">" : ''
    };
};
export const getNgMarkup = function (nodes) {
    if (nodes === void 0) { nodes = []; }
    if (nodes.rootNodes) {
        nodes = nodes.rootNodes;
    }
    var markup = '';
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        if (node.constructor.name === 'Text') {
            markup += node.value;
        }
        else if (node.constructor.name === 'Comment') {
            markup += "<!-- " + node.value + " -->";
        }
        else {
            var _a = getOptimizedMarkupByNode(node), startNode = _a.startNode, endNode = _a.endNode;
            markup += startNode;
            if (node.children && node.children.length) {
                markup += getNgMarkup(node.children);
            }
            if (node.endSourceSpan) {
                markup += endNode;
            }
        }
    }
    return markup;
};
