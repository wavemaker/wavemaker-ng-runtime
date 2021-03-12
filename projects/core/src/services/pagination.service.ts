import { isDefined } from '../utils/utils';
import { Injectable } from '@angular/core';

declare const _;

@Injectable({ providedIn: 'root' })

export class PaginationService {
    public updateFieldsOnPagination = (fieldDefs, dataNavigator, currentPage, pagesize, newVal) => {
        if (!isDefined(fieldDefs) || dataNavigator.isFirstPage()) {
            fieldDefs = [];
            currentPage = 1;
        } else if (fieldDefs.length / pagesize <= dataNavigator.pageCount) {
            let itemsLength,
                itemsToPush = [];
            // we push the newVal only when dn.currentPage gets incremented because that is when new items gets added to newVal
            if (fieldDefs.length === currentPage * pagesize && (currentPage + 1 ) === dataNavigator.dn.currentPage) {
                itemsToPush = newVal;
                currentPage ++;
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
                    currentPage ++;
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
}