import { NgModule } from '@angular/core';
import { ButtonComponent } from '../../../widgets/input/default/src/button/button.component';
import { ImagePipe } from '../pipes/image.pipe'
import { TrustAsPipe } from '../pipes/trust-as.pipe';
import { App } from '@wm/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TypeaheadModule } from 'ngx-bootstrap';

let mockApp = {};

@NgModule({
    declarations: [
        ButtonComponent,
        ImagePipe,
        TrustAsPipe
    ],
    providers: [
        { provide: App, useValue: mockApp },

    ],
    imports: [
        CommonModule,
        FormsModule,
        BrowserAnimationsModule,
        TypeaheadModule.forRoot()
    ],
    exports: [ButtonComponent, ImagePipe, TrustAsPipe]
})
export class ComponentsTestModule { }
