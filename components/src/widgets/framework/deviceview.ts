import { setCSS } from '@wm/core';

enum CLASS_NAME {
    LEFT_PANEL = 'page-left-panel',
    RIGHT_PANEL = 'page-right-panel',
    SWIPE_ELEM = 'page-left-panel-icon',
    CONTENT = 'app-content-column',
    HEADER = 'page-header'
}

/**
 * method returns jquery class selector for given roleName
 * @param roleName
 * @returns {string}
 */
const roleSelector = (roleName: string) => {
    return `[data-role='${roleName}']`;
};

/*setup touch event handler*/
const bindTapEvtHandler = (selector, handler) => {
    /*
     * In Iphone safari browser, tap event of HammerJs is breaking
     * functionalities of other controls like input[type="range"].
     * So, replaced the hammer Js handler with click event handler.
     */
    $(selector).off('click.deviewview').on('click.deviewview', handler);
};

/**
 * hide the mobile toolbar actions
 */
const hidePageContainers = (leftNavEle: HTMLElement, searchEle?: HTMLElement) => {
    // TODO: should be executed only if isMobile() is true;
    if (leftNavEle) {
        (leftNavEle as any).widget.collapse();
    }
    if (searchEle) {
        setCSS(searchEle, 'display', 'none');
    }
};

/**
 * binds the touch event for content
 */
const bindContentEvents = (leftNavEle: HTMLElement, pageContainer: HTMLElement, searchContainer: any) => {
    // touch content to hide nav pane and left panel
    bindTapEvtHandler(pageContainer, hidePageContainers.bind(this, leftNavEle, searchContainer));
};

const bindLeftPanelEvents = (leftNavEle: HTMLElement, searchEle: HTMLElement) => {
    // tap left to show/hide left panel
    bindTapEvtHandler(roleSelector(CLASS_NAME.SWIPE_ELEM), function () {
        if (leftNavEle) {
            (leftNavEle as any).widget.toggle();

            // Hide search container when left panel is open
            if (leftNavEle.classList.contains('visible')) {
                if (searchEle) {
                    setCSS(searchEle, 'display', 'none');
                }
            }
        }
    });
};

/**
 * binds the touch event for content
 */
const bindRightPanelEvents = (rightNavEle: HTMLElement) => {
    bindTapEvtHandler(rightNavEle, hidePageContainers);
};


/**
 * toggles the search container
 */
function toggleSearchContainer(searchEle, leftNavEle: HTMLElement) {
    if (searchEle.css('display') === 'none') {
        hidePageContainers(leftNavEle);
        searchEle.css('display', 'inline-table');
    } else {
        hidePageContainers(leftNavEle, searchEle);
    }
}

/**
 * Bind event with Search icon in header
 */
const bindSearchIconEvent = (searchElements, leftNavEle: HTMLElement) => {

    $(searchElements).each((index, ele) => {
        const searchEle = $('<a class="app-header-action"><i class="wi wi-search"></i></a>');
        const element = $(ele);
        element.before(searchEle);
        // Tap icon to show/hide search box
        bindTapEvtHandler(searchEle, function () {
            toggleSearchContainer(element, leftNavEle);
        });
    });

};

export const updateDeviceView  = (element: HTMLElement) => {

    const leftNavEle: HTMLElement = element.querySelector(roleSelector(CLASS_NAME.LEFT_PANEL));
    const rightNavEle: HTMLElement = element.querySelector(roleSelector(CLASS_NAME.RIGHT_PANEL));
    const headerEle: HTMLElement = element.querySelector(roleSelector(CLASS_NAME.HEADER));
    const searchEle: HTMLElement =  headerEle.querySelector('[wmsearch]');
    const pageEle: HTMLElement = element.querySelector(`.${CLASS_NAME.CONTENT}`);

    bindContentEvents(leftNavEle, pageEle as HTMLElement, searchEle);

    if (leftNavEle) {
        bindLeftPanelEvents(leftNavEle, searchEle);
    } else {
        // remove the icon
        $(headerEle).find(roleSelector(CLASS_NAME.SWIPE_ELEM)).remove();
    }

    if (rightNavEle) {
        bindRightPanelEvents(rightNavEle);
    }

    if (searchEle) {
        bindSearchIconEvent(searchEle, leftNavEle);
    }

};