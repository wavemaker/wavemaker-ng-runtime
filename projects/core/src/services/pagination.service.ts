import { isDefined } from '../utils/utils';
import { Injectable } from '@angular/core';
declare const _, $;

@Injectable({ providedIn: 'root' })

export class PaginationService {
    public updateFieldsOnPagination(fieldDefs, dataNavigator, currentPage, pagesize, newVal) {
        if (!isDefined(fieldDefs) || dataNavigator.isFirstPage()) {
            fieldDefs = [];
            currentPage = 1;
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

    public bindScrollEvt($element, nodeName, dataNavigator, debounceNum) {
        const $el = $element;
        const $ul = $el.find(nodeName);
        const $firstChild = $ul.children().first();
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
                        self.debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum);
                    }

                    lastScrollTop = scrollTop;
                });
            $ul.off('wheel.scroll_evt');
        } else {
            // if there is no scrollable element register wheel event on ul element
            $ul.on('wheel.scroll_evt', e => {
                if (e.originalEvent.deltaY > 0) {
                    $ul.off('wheel.scroll_evt');
                    this.debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum);
                }
            });
        }
    }

    public debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum) {
        _.debounce(() => this.fetchNextDatasetOnScroll(dataNavigator), debounceNum)();
    }

    public fetchNextDatasetOnScroll(dataNavigator) {
        dataNavigator.navigatePage('next');
    }

    public bindIScrollEvt($element, app, dataNavigator, debounceNum) {
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

    public setIscrollHandlers(el, dataNavigator, debounceNum) {
        let lastScrollTop = 0;
        const wrapper = _.get(el.iscroll, 'wrapper');
        const self = el.iscroll;

        el.iscroll.on('scrollEnd', () => {
            const clientHeight = wrapper.clientHeight,
                totalHeight = wrapper.scrollHeight,
                scrollTop = Math.abs(el.iscroll.y);

            if ((lastScrollTop < scrollTop) && (totalHeight * 0.9 < scrollTop + clientHeight)) {
                this.debouncedFetchNextDatasetOnScroll(dataNavigator, debounceNum);
                if (self.indicatorRefresh) {
                    self.indicatorRefresh();
                }
            }

            lastScrollTop = scrollTop;
        });
    }
}