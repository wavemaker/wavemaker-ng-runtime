import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

import { ModalModule } from 'ngx-bootstrap/modal';

import { AbstractDialogService } from '@wm/core';
import { SecurityModule } from '@wm/security';

import { ContainerDirective } from './widgets/common/container/container.directive';
import { DialogBodyDirective } from './widgets/common/dialog/base/dialog-body/dialog-body.directive';
import { DialogFooterDirective } from './widgets/common/dialog/base/dialog-footer/dialog-footer.directive';
import { DialogHeaderComponent } from './widgets/common/dialog/base/dialog-header/dialog-header.component';
import { ImagePipe } from './pipes/image.pipe';
import { LazyLoadDirective } from './widgets/common/lazy-load/lazy-load.directive';
import { MessageComponent } from './widgets/common/message/message.component';
import { PartialDirective } from './widgets/common/partial/partial.directive';
import {
    PartialParamDirective,
    PartialParamHandlerDirective
} from './widgets/common/partial-param/partial-param.directive';
import { RedrawableDirective } from './widgets/common/redraw/redrawable.directive';
import { ShowInDeviceDirective } from './directives/show-in-device.directive';
import { SmoothScrollDirective } from './widgets/common/smooth-scroll/smooth-scroll.directive';
import { TextContentDirective } from './widgets/common/base/text-content.directive';
import {
    FileExtensionFromMimePipe,
    FileIconClassPipe,
    FileSizePipe,
    FilterPipe,
    NumberToStringPipe,
    PrefixPipe,
    StateClassPipe,
    StringToNumberPipe,
    SuffixPipe,
    TimeFromNowPipe,
    ToCurrencyPipe,
    ToDatePipe,
    ToNumberPipe
} from './pipes/custom-pipes';
import { TrustAsPipe } from './pipes/trust-as.pipe';
import { DialogServiceImpl } from './widgets/common/dialog/dialog.service';

const wmComponents = [
    ContainerDirective,
    DialogBodyDirective,
    DialogFooterDirective,
    DialogHeaderComponent,
    LazyLoadDirective,
    MessageComponent,
    PartialDirective,
    PartialParamHandlerDirective,
    PartialParamDirective,
    RedrawableDirective,
    ShowInDeviceDirective,
    SmoothScrollDirective,
    TextContentDirective
];

const PIPES = [
    ToDatePipe,
    FileIconClassPipe,
    FileExtensionFromMimePipe,
    FilterPipe,
    FileSizePipe,
    ToNumberPipe,
    ToCurrencyPipe,
    PrefixPipe,
    SuffixPipe,
    TimeFromNowPipe,
    NumberToStringPipe,
    StateClassPipe,
    StringToNumberPipe,
    TrustAsPipe,
    ImagePipe
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ModalModule,
        SecurityModule
    ],
    declarations: [...wmComponents, ...PIPES],
    exports: [...wmComponents, ...PIPES]
})
export class WmComponentsModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: WmComponentsModule,
            providers: [
                ToDatePipe,
                FilterPipe,
                TrustAsPipe,
                ImagePipe,
                Location,
                {provide: AbstractDialogService, useClass: DialogServiceImpl}
            ]
        };
    }
}
