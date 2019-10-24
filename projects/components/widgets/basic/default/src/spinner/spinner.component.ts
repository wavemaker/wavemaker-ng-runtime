import { Component, Injector, OnInit } from '@angular/core';

import { DataSource, validateDataSourceCtx } from '@wm/core';
import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, ImagePipe } from '@wm/components/base';

import { registerProps } from './spinner.props';

declare const _;

const DEFAULT_CLS = 'app-spinner';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-spinner', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmSpinner]',
    templateUrl: './spinner.component.html',
    providers: [
        provideAsWidgetRef(SpinnerComponent)
    ]
})
export class SpinnerComponent extends StylableComponent implements OnInit {
    static initializeProps = registerProps();

    public iconclass = '';
    public animation = '';
    public imagewidth;
    public imageheight;
    public servicevariabletotrack: string;
    public show: boolean;
    private picture: string;
    private _spinnerMessages;
    public showCaption = true;
    public type: any;

    public get spinnerMessages() {
        return this._spinnerMessages;
    }

    public set spinnerMessages(newVal) {
        this.showCaption = _.isEmpty(newVal);
        this._spinnerMessages = newVal;
    }

    private listenOnDataSource() {
        const variables = _.split(this.servicevariabletotrack, ',');
        this.getAppInstance().subscribe('toggle-variable-state', data => {
            const name = data.variable.execute(DataSource.Operation.GET_NAME);
            if (_.includes(variables, name) && validateDataSourceCtx(data.variable, this.getViewParent())) {
                this.widget.show = data.active;
            }
        });
    }

    constructor(inj: Injector, private imagePipe: ImagePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'image') {
            this.picture = this.imagePipe.transform(nv);
        } else if (key === 'animation') {
            if (nv === 'spin') {
                this.animation = 'fa-spin';
            } else {
                this.animation = nv || '';
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngOnInit() {
        super.ngOnInit();
        // if variables are to be listened to, hide the widget and set the listener
        if (this.servicevariabletotrack) {
            this.widget.show = false;
            this.listenOnDataSource();
        }
    }
}
