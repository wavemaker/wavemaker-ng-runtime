import { AfterViewInit, Component, ViewChild, ViewContainerRef, TemplateRef, OnDestroy } from '@angular/core';

import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';

import { $watch, $appDigest } from '@wm/core';

declare const _, $;

@Component({
    selector: '[custom-toaster-component]',
    template: `
        <div class="parent-custom-toast"></div>
        <ng-container #customToast></ng-container>
        <ng-template #customToastTmpl>
            <div wmContainer partialContainer content.bind="pagename">
                <div *ngFor="let param of params | keyvalue" wmParam hidden
                    [name]="param.key" [value]="param.value"></div>
            </div>
        </ng-template>`,
    preserveWhitespaces: false
})
export class CustomToasterComponent extends Toast implements AfterViewInit, OnDestroy {

    @ViewChild('customToast', /* TODO: add static flag */ { static: false, read: ViewContainerRef }) customToastRef: ViewContainerRef;
    @ViewChild('customToastTmpl', /* TODO: add static flag */ {static: false}) customToastTmpl: TemplateRef<any>;
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
        _.forEach((<any>this.options).partialParams, (param) => {
            if (_.isString(param.value) && param.value.indexOf('bind:') === 0) {
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
        _.forEach(this.watchers, watcher => watcher());
    }
}
