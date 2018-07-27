import { Component } from '@angular/core';

import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';

@Component({
    selector: '[custom-toaster-component]',
    template: `
        <div wmContainer partialContainer content.bind="pagename"></div>
  `,
    preserveWhitespaces: false
})
export class CustomToasterComponent extends Toast {
    pagename: any;

    // constructor is only necessary when not using AoT
    constructor(
        protected toastrService: ToastrService,
        public toastPackage: ToastPackage,
    ) {
        super(toastrService, toastPackage);
        console.warn('pagename', this.message);
        this.pagename = this.message || '';
    }
}