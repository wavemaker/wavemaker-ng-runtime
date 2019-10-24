import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CarouselModule as ngxCarouselModule } from 'ngx-bootstrap/carousel';

import { WmComponentsModule } from '@wm/components/base';

import { CarouselDirective } from './carousel.directive';
import { CarouselTemplateDirective } from './carousel-template/carousel-template.directive';

const components = [
    CarouselDirective,
    CarouselTemplateDirective
];

@NgModule({
    imports: [
        CommonModule,
        ngxCarouselModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class CarouselModule {
}
