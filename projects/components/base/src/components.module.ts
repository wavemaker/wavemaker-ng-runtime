import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

import { AbstractDialogService } from '@wm/core';
import { SecurityService } from '@wm/security';

import { ContainerDirective } from './widgets/common/container/container.directive';
import { ImagePipe } from './pipes/image.pipe';
import { ItemTemplateDirective } from "./widgets/common/item-template/item-template.directive";
import { RepeatTemplateDirective } from "./widgets/common/repeat-template/repeat-template.directive";
import { LazyLoadDirective } from './widgets/common/lazy-load/lazy-load.directive';
import { MessageComponent } from './widgets/common/message/message.component';
import { PartialDirective } from './widgets/common/partial/partial.directive';
import {
    PartialParamDirective,
    PartialParamHandlerDirective
} from './widgets/common/partial-param/partial-param.directive';
import { PartialContainerDirective } from "./widgets/common/base/partial-container.directive";
import { CustomWidgetContainerDirective } from "./widgets/common/base/custom-widget-container.directive";
import { RedrawableDirective } from './widgets/common/redraw/redrawable.directive';
import { ShowInDeviceDirective } from './directives/show-in-device.directive';
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
    ToNumberPipe,
    CustomPipe,
    TrailingZeroDecimalPipe, TemplateReplacePipe
} from './pipes/custom-pipes';
import { TrustAsPipe } from './pipes/trust-as.pipe';
import { DialogServiceImpl } from './widgets/common/dialog/dialog.service';
import { SanitizePipe } from "./pipes/sanitize.pipe";

const wmComponents = [
    ContainerDirective,
    ItemTemplateDirective,
    RepeatTemplateDirective,
    LazyLoadDirective,
    MessageComponent,
    PartialDirective,
    PartialParamHandlerDirective,
    PartialParamDirective,
    PartialContainerDirective,
    CustomWidgetContainerDirective,
    RedrawableDirective,
    ShowInDeviceDirective,
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
    TrailingZeroDecimalPipe,
    TrustAsPipe,
    ImagePipe,
    CustomPipe,
    SanitizePipe,
    TemplateReplacePipe
];

@NgModule({
    imports: [
        CommonModule,
        ...wmComponents, ...PIPES
    ],
    exports: [...wmComponents, ...PIPES]
})
export class WmComponentsModule {

    static forRoot(): ModuleWithProviders<WmComponentsModule> {
        return {
            ngModule: WmComponentsModule,
            providers: [
                ToDatePipe,
                FilterPipe,
                TrailingZeroDecimalPipe,
                TrustAsPipe,
                ImagePipe,
                CustomPipe,
                SanitizePipe,
                Location,
                SecurityService,
                { provide: AbstractDialogService, useClass: DialogServiceImpl }
            ]
        };
    }
}
