import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { WmComponentsModule } from '@wm/components/base';
import { NavModule } from '@wm/components/navigation/nav'

import { MenuComponent } from './menu.component';
import { MenuDropdownComponent } from './menu-dropdown/menu-dropdown.component';
import { MenuDropdownItemComponent } from './menu-dropdown-item/menu-dropdown-item.component';

const components = [
    MenuComponent,
    MenuDropdownComponent,
    MenuDropdownItemComponent
];

@NgModule({
    imports: [
        BsDropdownModule,
        CommonModule,
        NavModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: [
        MenuComponent,
        MenuDropdownComponent
    ]
})
export class MenuModule {
}
