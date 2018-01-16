import { setCSS } from './dom';
import { isDefined } from './utils';

export const propNameCSSKeyMap = {
    'backgroundattachment': 'backgroundAttachment',
    'backgroundcolor': 'backgroundColor',
    'backgroundgradient': 'backgroundGradient',
    'backgroundposition': 'backgroundPosition',
    'backgroundrepeat': 'backgroundRepeat',
    'backgroundsize': 'backgroundSize',
    'bordercolor': 'borderColor',
    'borderradius': 'borderRadius',
    'borderstyle': 'borderStyle',
    'borderwidth': 'borderWidth',
    'color': 'color',
    'cursor': 'cursor',
    'display': 'display',
    'fontsize': 'fontSize',
    'fontfamily': 'fontFamily',
    'fontstyle': 'fontStyle',
    'fontvariant': 'fontVariant',
    'fontweight': 'fontWeight',
    'height': 'height',
    'horizontalalign': 'textAlign',
    'lineheight': 'lineHeight',
    'margin': 'margin',
    'opacity': 'opacity',
    'overflow': 'overflow',
    'picturesource': 'backgroundImage',
    'textalign': 'textAlign',
    'textdecoration': 'textDecoration',
    'verticalalign': 'verticalAlign',
    'visibility': 'visibility',
    'whitespace': 'whiteSpace',
    'width': 'width',
    'wordbreak': 'wordbreak',
    'zindex': 'zIndex'
};

export const isStyle = key => !!propNameCSSKeyMap[key];

export function styler($node: HTMLElement, component: any) {
    // apply init styles;
    for (const [propName, cssName] of Object.entries(propNameCSSKeyMap)) {
        if (isDefined(component[propName])) {
            setCSS($node, cssName, component[propName]);
        }
    }

    // register onStyleChange
    component.onStyleChange = (k, v) => {
        setCSS($node, propNameCSSKeyMap[k], v);
    };
}
