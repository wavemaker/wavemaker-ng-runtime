import { setCSS } from '@wm/core';

enum CLASS_NAME {
    LEFT_PANEL = 'page-left-panel',
    RIGHT_PANEL = 'page-right-panel',
    SWIPE_ELEM = 'page-left-panel-icon',
    CONTENT = 'app-content-column',
    HEADER = 'page-header',
    SEARCH = 'app-search'
}

/**
 * method returns jquery class selector for given roleName
 * @param roleName
 * @returns {string}
 */
const roleSelector = (roleName: string) => `[data-role='${roleName}']`;

/*setup touch event handler*/
const bindTapEvtHandler = (selector, handler) => {
    /*
     * In Iphone safari browser, tap event of HammerJs is breaking
     * functionalities of other controls like input[type="range"].
     * So, replaced the hammer Js handler with click event handler.
     */
    $(selector).off('click.deviceview').on('click.deviceview', handler);
};

/**
 * hide the mobile toolbar actions
 */
const hidePageContainers = (leftNavEle: HTMLElement, searchEle?: HTMLElement) => {
    // TODO: should be executed only if isMobile() is true;
    if (leftNavEle) {
        try {
            (leftNavEle as any).widget.collapse();
        } catch (e) {
            //
        }
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
    bindTapEvtHandler(roleSelector(CLASS_NAME.SWIPE_ELEM), () => {
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
const toggleSearchContainer = (searchEle: HTMLElement, leftNavEle: HTMLElement) => {
    if ($(searchEle).css('display') === 'none') {
        hidePageContainers(leftNavEle);
        setCSS(searchEle, 'display', 'inline-table');
    } else {
        hidePageContainers(leftNavEle, searchEle);
    }
};

/**
 * Bind event with Search icon in header
 */
const bindSearchIconEvent = (searchElements, leftNavEle: HTMLElement) => {

    $(searchElements).each((index, ele: HTMLElement) => {
        const searchEle = $('<a class="app-header-action"><i class="wi wi-search"></i></a>') as JQuery<HTMLElement>;
        $(ele).before(searchEle);
        // Tap icon to show/hide search box
        bindTapEvtHandler(searchEle, () => toggleSearchContainer(ele, leftNavEle));
    });

};

export const updateDeviceView  = (element: HTMLElement) => {

    const leftNavEle = element.querySelector(roleSelector(CLASS_NAME.LEFT_PANEL)) as HTMLElement;
    const rightNavEle = element.querySelector(roleSelector(CLASS_NAME.RIGHT_PANEL)) as HTMLElement;
    const headerEle = element.querySelector(roleSelector(CLASS_NAME.HEADER)) as HTMLElement;
    const searchEle =  headerEle && headerEle.querySelector(`.${CLASS_NAME.SEARCH}`) as HTMLElement;
    const pageEle = element.querySelector(`.${CLASS_NAME.CONTENT}`) as HTMLElement;

    bindContentEvents(leftNavEle, pageEle, searchEle);

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