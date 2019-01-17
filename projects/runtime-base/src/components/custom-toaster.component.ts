import { AfterViewInit, Component, ViewChild, ViewContainerRef, Injector } from '@angular/core';

import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';

import { App, IDGenerator, DynamicComponentRefProvider } from '@wm/core';
import { getBoundToExpr } from '@wm/transpiler';

declare const _, $;

const idGen = new IDGenerator('-dynamic-');

@Component({
    selector: '[custom-toaster-component]',
    template: `
        <div class="parent-custom-toast"></div>
        <ng-container #customToast></ng-container>
  `,
    preserveWhitespaces: false
})
export class CustomToasterComponent extends Toast implements AfterViewInit {

    @ViewChild('customToast', {read: ViewContainerRef}) customToastRef: ViewContainerRef;
    pagename: any;

    // constructor is only necessary when not using AoT
    constructor(
        private inj: Injector,
        protected toastrService: ToastrService,
        public toastPackage: ToastPackage,
        private app: App,
        private dynamicComponentProvider: DynamicComponentRefProvider
    ) {
        super(toastrService, toastPackage);
        this.pagename = this.message || '';
    }

    async generateDynamicComponent() {
        const selector = 'app-custom-toaster-component';
        const $targetLayout = $('.parent-custom-toast');
        let markup = `<div wmContainer partialContainer content="${this.pagename}">`;
        _.forEach((<any>this.options).partialParams, (paramValue, paramName) => {
            const val = paramValue.startsWith('bind:') ? `value.bind="${getBoundToExpr(paramValue)}"` : `value="${paramValue}"`;
            markup = markup + `<div wmParam name="${paramName}" ${val} hidden></div>`;
        });
        markup = markup + '</div>';

        this.customToastRef.clear();

        const componentFactoryRef = await this.dynamicComponentProvider.getComponentFactoryRef(
            selector + idGen.nextUid(),
            markup
        );
        const component = this.customToastRef.createComponent(componentFactoryRef, 0, this.inj);
        $targetLayout[0].appendChild(component.location.nativeElement);
    }

    ngAfterViewInit() {
        this.generateDynamicComponent();
    }
}
