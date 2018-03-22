import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, ElementRef, Injector } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './dialog-actions.props';
import { DialogService } from '../dialog.service';
import { ButtonComponent } from '../../button/button.component';

const WIDGET_INFO = {widgetType: 'wm-dialogactions', hostClass: 'app-dialog-footer modal-footer'};

registerProps();

declare const _;

@Component({
    selector: 'div[wmDialogActions]',
    template: '<ng-content></ng-content>'
})
export class DialogActionsComponent extends BaseComponent implements AfterViewInit {

    @ContentChildren(ButtonComponent) buttonComponents;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private dialogService: DialogService) {
        super(WIDGET_INFO, inj, elRef, cdr);
    }

    dialogId;

    closeDialog() {
        this.dialogService.closeDialog(this.dialogId);
    }

    ngAfterViewInit() {
        this.buttonComponents._results.forEach((buttonComponent) => {
            if (_.includes(buttonComponent.$element.getAttribute('click.event'), 'closeDialog()')) {
                buttonComponent.$element.addEventListener('click', () => this.closeDialog());
            }
        });
    }
}
