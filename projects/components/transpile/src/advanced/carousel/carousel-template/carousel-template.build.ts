import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const carouselContentTagName = 'slide';
let counter = 1;
// For static carousel
register('wm-carousel-content', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${carouselContentTagName} wmCarouselTemplate  ${getAttrMarkup(attrs)}>`,
        post: () => `</${carouselContentTagName}>`
    };
});

// For dynamic carousel
register('wm-carousel-template', (): IBuildTaskDef => {
    return {
        requires: ['wm-carousel'],
        pre: (attrs, shared, parentCarousel) => {
            const carouselRef = parentCarousel.get('carousel_ref');
            return `<div *ngIf="!${carouselRef}.fieldDefs">{{${carouselRef}.nodatamessage}}</div>
                    <${carouselContentTagName} wmCarouselTemplate  ${getAttrMarkup(attrs)} *ngFor="let item of ${carouselRef}.fieldDefs; let i = index;">
                        <ng-container [ngTemplateOutlet]="carouselTempRef${counter}" [ngTemplateOutletContext]="{item:item, index:i}"></ng-container>
                    </${carouselContentTagName}>
                    <ng-template #carouselTempRef${counter++} let-item="item" let-index="index">`;
        },
        post: () => `</ng-template>`
    };
});

export default () => {};
