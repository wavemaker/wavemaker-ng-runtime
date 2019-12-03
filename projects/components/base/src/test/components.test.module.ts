import {NgModule} from '@angular/core'
import {ButtonComponent} from "../../../widgets/input/default/src/button/button.component";
import {ImagePipe} from "../pipes/image.pipe";
import {TrustAsPipe} from "../pipes/trust-as.pipe";
import {App} from '@wm/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap';
import {SearchComponent} from "../../../widgets/basic/search/src/search.component";

let mockApp = {};

@NgModule({
    declarations: [
        ButtonComponent,
        SearchComponent,
        ImagePipe,
        TrustAsPipe
    ],
    providers: [
        {provide: App, useValue: mockApp}
    ],
    imports: [
        CommonModule,
        FormsModule,
        TypeaheadModule.forRoot()
    ],
    exports: [ButtonComponent, ImagePipe, TrustAsPipe]
})
export class ComponentsTestModule { }
