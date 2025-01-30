import { IDGenerator } from '@wm/core';
import { getAttrMarkup, register } from '@wm/transpiler';

const tagName = 'section';
const idGen = new IDGenerator('wm_prefab');

register('wm-prefab', () => {
    return {
        pre: attrs => {
            const counter = idGen.nextUid();
            return `<${tagName} wmPrefab #${counter}="wmPrefab" redrawable data-role="prefab" ${getAttrMarkup(attrs)}>
            <ng-container *ngIf="${counter}.showLoader && ${counter}.app.Variables?.showSkeletonLoader?.dataSet.dataValue || false">
                <wm-skeleton-loader widget-type="default"></wm-skeleton-loader>
            </ng-container>`
        },
        post: () => `</${tagName}>`
    };
});

export default () => {};
