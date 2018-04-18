import { setCSS } from '@wm/utils';

import { getBackGroundImageUrl } from '../../utils/widget-utils';
import { StylableComponent } from '../web/base/stylable.component';

export enum APPLY_STYLES_TYPE {
    CONTAINER,
    SCROLLABLE_CONTAINER,
    INNER_SHELL,
    SHELL
}

export const propNameCSSKeyMap = {
    'backgroundattachment': 'backgroundAttachment',
    'backgroundcolor': 'backgroundColor',
    'backgroundgradient': 'backgroundGradient',
    'backgroundimage': 'backgroundImage',
    'backgroundposition': 'backgroundPosition',
    'backgroundrepeat': 'backgroundRepeat',
    'backgroundsize': 'backgroundSize',
    'bordercolor': 'borderColor',
    'borderradius': 'borderRadius',
    'borderstyle': 'borderStyle',
    'borderwidth': 'borderWidth',
    'borderbottomwidth': 'borderBottomWidth',
    'borderleftwidth': 'borderLeftWidth',
    'borderrightwidth': 'borderRightWidth',
    'bordertopwidth': 'borderTopWidth',
    'color': 'color',
    'cursor': 'cursor',
    'display': 'display',
    'fontsize': 'fontSize',
    'fontfamily': 'fontFamily',
    'fontstyle': 'fontStyle',
    'fontunit': 'fontunit',
    'fontvariant': 'fontVariant',
    'fontweight': 'fontWeight',
    'height': 'height',
    'horizontalalign': 'textAlign',
    'lineheight': 'lineHeight',
    'margin': 'margin',
    'marginbottom': 'marginBottom',
    'marginleft': 'marginLeft',
    'marginright': 'marginRight',
    'margintop': 'marginTop',
    'opacity': 'opacity',
    'overflow': 'overflow',
    'padding': 'padding',
    'paddingbottom': 'paddingBottom',
    'paddingleft': 'paddingLeft',
    'paddingright': 'paddingRight',
    'paddingtop': 'paddingTop',
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

const MAP_SHELL_TYPE_IGNORE_LIST = {
    height: true,
    overflow: true,
    padding: true,
    paddingbottom: true,
    paddingleft: true,
    paddingright: true,
    paddingtop: true
};

const MAP_CONTAINER_TYPE_IGNORE_LIST = {
    textalign: true
};

const MAP_SCROLLABLE_CONTAINER_TYPE_IGNORE_LIST = {
    textalign: true,
    width: true
};


export function styler($node: HTMLElement, component: StylableComponent, type?: APPLY_STYLES_TYPE, skipList?: Array<string>) {
    // apply init styles;
    const skipListMap = Object.create(null);
    if (skipList) {
        skipList.forEach(k => skipListMap[k] = true);
    }

    component.registerStyleChangeListener((key, nv) => {

        if (skipListMap[key]) {
            return;
        }

        // if the type is `shell` and the key is in the SHELL_TYPE_IGNORE_LIST, return
        if (type === APPLY_STYLES_TYPE.SHELL && MAP_SHELL_TYPE_IGNORE_LIST[key]) {
            return;
        }

        // if the type is `inner-shell` and the key is NOT in the SHELL_TYPE_IGNORE_LIST, return
        if (type === APPLY_STYLES_TYPE.INNER_SHELL) {
            if (!MAP_SHELL_TYPE_IGNORE_LIST[key]) {
                return;
            }
            if (key === 'height') {
                setCSS($node, 'overflow', nv ? 'auto' : '');
            }
        }

        // if the type is `container` and the key is in the CONTAINER_TYPE_IGNORE_LIST, return
        if (type === APPLY_STYLES_TYPE.CONTAINER && MAP_CONTAINER_TYPE_IGNORE_LIST[key]) {
            return;
        }

        if (type === APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER) {
            if (MAP_SCROLLABLE_CONTAINER_TYPE_IGNORE_LIST[key]) {
                return;
            }

            if (key === 'height') {
                setCSS($node, 'overflow', nv ? 'auto' : '');
            }
        }

        if (key === 'fontsize' || key === 'fontunit') {
            setCSS($node, 'fontSize', component.fontsize === '' ? '' : component.fontsize + (component.fontunit || 'px'));
        } else if (key === 'backgroundimage') {
            setCSS($node, 'backgroundImage', component.picturesource || getBackGroundImageUrl(nv));
        } else if (propNameCSSKeyMap[key]) {
            setCSS($node, propNameCSSKeyMap[key], nv);
        }
    });
}
