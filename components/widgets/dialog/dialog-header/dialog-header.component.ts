import { ChangeDetectorRef, Component, ElementRef, HostBinding, Injector } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { registerProps } from './dialog-header.props';
import { DialogService } from '../dialog.service';

const WIDGET_INFO = {widgetType: 'wm-dialogheader', hostClass: 'app-dialog-header modal-header'};

registerProps();

@Component({
    selector: 'div[wmDialogHeader]',
    templateUrl: './dialog-header.component.html'
})
export class DialogHeaderComponent extends BaseComponent {

    @HostBinding('attr.title') hint: string;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private dialogService: DialogService) {
        super(WIDGET_INFO, inj, elRef, cdr);
    }

    _iconclass;

    dialogId;

    private iconurl;

    set iconclass(newVal) {
        if (newVal && newVal !== '_none_') {
            this.iconurl = '';
            this.iconwidth = this.iconheight = this.defaultIconDimensions;
        } else {
            this.iconwidth = this.iconheight = '';
        }
        this._iconclass = newVal;
    }
    /*This property defines the margin of the icon that is applied to the header title.*/
    iconmargin: string;
    /*This property defines the label caption that is applied to the header*/
    caption: string;
    /*This property defines the subheading for the caption property that is applied to the header.*/
    subheading: string;

    private defaultIconDimensions: string = '21px';
    /*This property defines the width of the icon that is applied to the header title.*/
    iconwidth: string = this.defaultIconDimensions;
    /*This property defines the height of the icon that is applied to the header title.*/
    iconheight: string = this.defaultIconDimensions;

    closeDialog() {
        this.dialogService.closeDialog(this.dialogId);
    }

}
