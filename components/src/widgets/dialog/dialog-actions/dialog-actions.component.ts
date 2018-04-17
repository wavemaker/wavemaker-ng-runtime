import { AfterViewInit, Component, ContentChildren, Injector } from '@angular/core';

import { BaseComponent } from '../../base/base.component';
import { DialogService } from '../dialog.service';
import { ButtonComponent } from '../../button/button.component';
import { registerProps } from './dialog-actions.props';

const WIDGET_INFO = {widgetType: 'wm-dialogactions', hostClass: 'app-dialog-footer modal-footer'};

registerProps();

declare const _;

@Component({
    selector: 'div[wmDialogActions]',
    template: '<ng-content></ng-content>'
})
export class DialogActionsComponent extends BaseComponent implements AfterViewInit {

    @ContentChildren(ButtonComponent) buttonComponents;

    constructor(inj: Injector, private dialogService: DialogService) {
        super(inj, WIDGET_INFO);
    }

    dialogId;

    closeDialog() {
        this.dialogService.closeDialog(this.dialogId);
    }

    ngAfterViewInit() {
        this.buttonComponents._results.forEach(buttonComponent => {
            if (_.includes(buttonComponent.nativeElement.getAttribute('click.event'), 'closeDialog()')) {
                buttonComponent.nativeElement.addEventListener('click', () => this.closeDialog());
            }
        });
    }
}
