import { isDefined } from '../utils/utils';
import { Injectable } from '@angular/core';
declare const _, $;

@Injectable({ providedIn: 'root' })

export class PaginationService {
    /**
     * @description
     * This function returns the updated fields and the current page index when navigated to the next set of data
     * @param {object} parent table / list instance
     * @param {object} newVal updated fields info
     * @returns fieldDefs and current page index
     */
    public updateFieldsOnPagination(parent, newVal) {
        let fieldDefs = parent.widgetType === 'wm-table' ? parent.gridData : parent.fieldDefs;
        let currentPage = parent.currentPage;
        const dataNavigator = parent.dataNavigator;
        const pagesize = parent.pagesize;

        if (!isDefined(fieldDefs) || dataNavigator.isFirstPage()) {
            fieldDefs = [];
            currentPage = 1;
        } else if (!currentPage && !dataNavigator.isFirstPage() && newVal) {
            // In case of dialog, when dialog is opened fetch the records from first page 
            dataNavigator.navigatePage('first');
        } else if (fieldDefs.length / pagesize <= dataNavigator.pageCount) {
            let itemsLength,
                itemsToPush = [];
            // we push the newVal only when dn.currentPage gets incremented because that is when new items gets added to newVal
            if (fieldDefs.length === currentPage * pagesize && (currentPage + 1) === dataNavigator.dn.currentPage) {
                itemsToPush = newVal;
                currentPage++;
            } else if (fieldDefs.length < currentPage * pagesize) {
                if ((fieldDefs.length === (currentPage - 1) * pagesize) && ((currentPage - 1) === dataNavigator.dn.currentPage)) {
                    // if dn.currentPage is not incremented still only old newVal is present hence we push empty array
                    newVal = [];
                } else if (dataNavigator.dataSize < currentPage * pagesize) {
                    // if number of elements added to datanavigator is less than  product of currentpage and pagesize we only add elements extra elements added
                    itemsLength = dataNavigator.dataSize - fieldDefs.length;
                } else {
                    // if number of elements added to datanavigator is greater than  product of currentpage and pagesize we add elements the extra elements in newVal
                    itemsLength = currentPage * pagesize - fieldDefs.length;
                    currentPage++;
                }
                const startIndex = newVal.length - itemsLength;
                itemsToPush = newVal.slice(startIndex);
            } else if (fieldDefs.length === currentPage * pagesize && currentPage === dataNavigator.dn.currentPage) {
                // if dn.currentPage is not incremented still only old newVal is present hence we push empty array
                itemsToPush = [];
            }
            newVal = itemsToPush;
        }
        fieldDefs = [...fieldDefs, ...newVal];
        return [fieldDefs, currentPage];
    }

    /**
     * @description
     * This function registers scroll events on the scrollable el, if the page doesn't have a scroll el then wheel event is registered on the requested node
     * @param {object} parent table / list instance
     * @param {string} nodeName tbody/ul
     * @param {number} debounceNum provided to lodash debounce
     * @returns null
     */
    public bindScrollEvt(parent, nodeName, debounceNum) {
        const dataNavigator = parent.dataNavigator;        
        const $el = parent.$element;
        const $rootEl = $el.find(nodeName);
        const $firstChild = $rootEl.children().first();

        const self = this;
        let $scrollParent;
        let scrollNode;
        let lastScrollTop = 0;

        if (!$firstChild.length) {
            return;
        }

        $scrollParent = $firstChild.scrollParent(false);

        if ($scrollParent[0] === document) {
            scrollNode = document.body;
        } else {
            scrollNode = $scrollParent[0];
        }

        // has scroll
        if (scrollNode.scrollHeight > scrollNode.clientHeight) {
            $scrollParent
                .each((index: number, node) => {
                    // scrollTop property is 0 or undefined for body in IE, safari.
                    lastScrollTop = node === document ? (node.body.scrollTop || $(window).scrollTop()) : (node as HTMLElement).scrollTop;
                })
                .off('scroll.scroll_evt')
                .on('scroll.scroll_evt', function (evt) {
                    let target = evt.target;
                    let clientHeight;
                    let totalHeight;
                    let scrollTop;
                    // scrollingElement is undefined for IE, safari. use body as target Element
                    target = target === document ? (target.scrollingElement || document.body) : target;

                    clientHeight = target.clientHeight;
                    totalHeight = target.scrollHeight;
                    scrollTop = target === document.body ? $(window).scrollTop() : target.scrollTop;

                    if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                        $(this).off('scroll.scroll_evt');
                        self.debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum)();
                    }

                    lastScrollTop = scrollTop;
                });
            $rootEl.off('wheel.scroll_evt');
        } else {
            // if there is no scrollable element register wheel event on ul element
            $rootEl.on('wheel.scroll_evt', e => {
                if (e.originalEvent.deltaY > 0) {
                    $rootEl.off('wheel.scroll_evt');
                    this.debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum)();
                }
            });
        }
    }

    /**
     * @description
     * This function calls fetchNextDatasetOnScroll fn on debounced time 
     * @param {object} dataNavigator pagination instance
     * @param {number} debounceNum provided to lodash debounce
     * @returns debounced function definition
     */
    public debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum) {
        return _.debounce(() => this.fetchNextDatasetOnScroll(dataNavigator), debounceNum);
    }

    /**
     * @description
     * This function calls next set of data when navigated to next page 
     * @param {object} dataNavigator pagination instance
     * @returns null
     */
    public fetchNextDatasetOnScroll(dataNavigator) {
        dataNavigator.navigatePage('next');
    }

    /**
     * @description
     * This function registers scroll events on the scrollable el for mobile projects
     * @param {object} parent list instance
     * @param {number} debounceNum provided to lodash debounce
     * @returns null
     */
    public bindIScrollEvt(parent, debounceNum) {
        const $element = parent.$element;
        const dataNavigator = parent.dataNavigator;
        const app = parent.app;

        const $scrollParent = $element.closest('[wmsmoothscroll="true"]');

        const iScroll = _.get($scrollParent[0], 'iscroll');

        // when iscroll is not initialised the notify the smoothscroll and subscribe to the iscroll update
        if (!iScroll) {
            const iScrollSubscription = app.subscribe('iscroll-update', (_el) => {
                if (!_.isEmpty(_el) && _el.isSameNode($scrollParent[0])) {
                    this.setIscrollHandlers($scrollParent[0], dataNavigator, debounceNum);
                    iScrollSubscription();
                }
            });
            app.notify('no-iscroll', $scrollParent[0]);
            return;
        }
        this.setIscrollHandlers($scrollParent[0], dataNavigator, debounceNum);
    }

    /**
     * @description
     * This function registers scrollEnd event on the scrollable el for mobile projects
     * @param {object} el scrollable element scope
     * @param {object} dataNavigator pagination instance
     * @param {number} debounceNum provided to lodash debounce
     * @returns null
     */
    public setIscrollHandlers(el, dataNavigator, debounceNum) {
        let lastScrollTop = 0;
        const wrapper = _.get(el.iscroll, 'wrapper');
        const self = el.iscroll;

        el.iscroll.on('scrollEnd', () => {
            const clientHeight = wrapper.clientHeight,
                totalHeight = wrapper.scrollHeight,
                scrollTop = Math.abs(el.iscroll.y);

            if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                this.debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum)();
                if (self.indicatorRefresh) {
                    self.indicatorRefresh();
                }
            }

            lastScrollTop = scrollTop;
        });
    }
}