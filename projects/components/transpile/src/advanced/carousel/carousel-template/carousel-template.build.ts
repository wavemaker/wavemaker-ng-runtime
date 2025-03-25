import {getAttrMarkup, IBuildTaskDef, register} from '@wm/transpiler';

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
            return `@if(!${carouselRef}.fieldDefs){<div >{{${carouselRef}.nodatamessage}}</div>}
                    @for (item of ${carouselRef}.fieldDefs; track $index; let i = $index) {
                        <${carouselContentTagName} wmCarouselTemplate #carouselTemplateRef="carouselTemplateRef" ${getAttrMarkup(attrs)}>
                        <ng-container [ngTemplateOutlet]="carouselTempRef${counter}"
                        [ngTemplateOutletContext]="{item:item, index:i}"
                        [ngTemplateOutletInjector]="${carouselRef}.createCustomInjector('carousel_item_' + carouselTemplateRef.trackId, {item:item, index:i})"></ng-container>
                        </${carouselContentTagName}>
                       }
                    <ng-template #carouselTempRef${counter++} let-item="item" let-index="index">`;

        },
        post: () => `</ng-template>`
    };
});

export default () => {};
