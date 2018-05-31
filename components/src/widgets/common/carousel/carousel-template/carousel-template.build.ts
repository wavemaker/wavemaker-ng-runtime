import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';

const carouselContentTagName = 'slide';

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
            let ParentRef = parentCarousel.get('carousel_ref');
            return `<div *ngIf="!${ParentRef}.fieldDefs">{{${ParentRef}.nodatamessage}}</div>
                    <${carouselContentTagName} wmCarouselTemplate  ${getAttrMarkup(attrs)} *ngFor="let item of ${ParentRef}.fieldDefs">`
        },
        post: () => `</${carouselContentTagName}>`
    };
});

export default () => {};