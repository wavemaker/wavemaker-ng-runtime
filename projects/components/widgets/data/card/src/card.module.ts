import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { WmComponentsModule } from '@wm/components/base';
import { MenuModule } from '@wm/components/navigation/menu';

import { CardComponent } from './card.component';
import { CardActionsDirective } from './card-actions/card-actions.directive';
import { CardContentComponent } from './card-content/card-content.component';
import { CardFooterDirective } from './card-footer/card-footer.directive';

const components = [
    CardComponent,
    CardActionsDirective,
    CardContentComponent,
    CardFooterDirective
];

@NgModule({
    imports: [
        BsDropdownModule,
        CommonModule,
        MenuModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class CardModule {
}
