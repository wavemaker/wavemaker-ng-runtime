import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, ViewContainerRef, TemplateRef, OnDestroy } from '@angular/core';

import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';

import { $watch, $appDigest } from '@wm/core';
import {forEach, isString} from "lodash-es";
import { ContainerDirective, PartialContainerDirective, PartialParamDirective, PartialParamHandlerDirective } from '@wm/components/base';

declare const $;

@Component({
    standalone: true,
    imports: [CommonModule, ContainerDirective, PartialParamHandlerDirective, PartialContainerDirective, PartialParamDirective],
    selector: '[custom-toaster-component]',
    template: `
        <div class="parent-custom-toast"></div>
        <ng-container #customToast></ng-container>
        <ng-template #customToastTmpl>
          <div wmContainer partialContainer content.bind="pagename">
            @for (param of params | keyvalue; track param) {
              <div wmParam hidden
              [name]="param.key" [value]="param.value"></div>
            }
          </div>
        </ng-template>`,
    preserveWhitespaces: false
})
export class CustomToasterComponent extends Toast implements AfterViewInit, OnDestroy {

    @ViewChild('customToast', { static: true, read: ViewContainerRef }) customToastRef: ViewContainerRef;
    @ViewChild('customToastTmpl') customToastTmpl: TemplateRef<any>;
    pagename: any;
    watchers: any = [];
    params: any = {};

    // constructor is only necessary when not using AoT
    constructor(
        protected toastrService: ToastrService,
        public toastPackage: ToastPackage
    ) {
        super(toastrService, toastPackage);
        this.pagename = this.message || '';
        this.generateParams();
    }

    // Generate the params for partial page. If bound, watch the expression and set the value
    generateParams() {
        forEach((<any>this.options).partialParams, (param) => {
            if (isString(param.value) && param.value.indexOf('bind:') === 0) {
                //[Todo-CSP]: bind expr fn should be generated in the toaster action for this
                this.watchers.push($watch(
                    param.value.substr(5),
                    (<any>this.options).context,
                    {},
                    nv => {
                        this.params[param.name] = nv;
                        $appDigest();
                    }
                ));
            } else {
                this.params[param.name] = param.value;
            }
        });
    }

    async generateDynamicComponent() {
        const $targetLayout = $('.parent-custom-toast');

        this.customToastRef.clear();

        $targetLayout[0].appendChild(this.customToastRef.createEmbeddedView(this.customToastTmpl).rootNodes[0]);
    }

    ngAfterViewInit() {
        this.generateDynamicComponent();
    }

    ngOnDestroy() {
        forEach(this.watchers, watcher => watcher());
        super.ngOnDestroy();
    }
}
