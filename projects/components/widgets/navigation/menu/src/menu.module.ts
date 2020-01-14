import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { WmComponentsModule } from '@wm/components/base';
import { BasicModule } from '@wm/components/basic';
import { InputModule } from '@wm/components/input';

import { MenuComponent } from './menu.component';
import { MenuDropdownComponent } from './menu-dropdown/menu-dropdown.component';
import { MenuDropdownItemComponent } from './menu-dropdown-item/menu-dropdown-item.component';
import { NavComponent } from './nav/nav.component';
import { NavItemDirective } from './nav/nav-item/nav-item.directive';
import { NavigationControlDirective } from './nav/navigation-control.directive';

const components = [
    MenuComponent,
    MenuDropdownComponent,
    MenuDropdownItemComponent,
    NavigationControlDirective,
    NavComponent,
    NavItemDirective
];

@NgModule({
    imports: [
        BasicModule,
        BsDropdownModule,
        CommonModule,
        InputModule,
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
