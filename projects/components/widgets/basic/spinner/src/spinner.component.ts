import { CommonModule } from '@angular/common';
import {Component, Inject, Injector, OnDestroy, OnInit, Optional} from '@angular/core';

import {DataSource, validateDataSourceCtx} from '@wm/core';
import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, ImagePipe } from '@wm/components/base';

import { registerProps } from './spinner.props';
import {includes, isEmpty, split} from "lodash-es";

const DEFAULT_CLS = 'app-spinner';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-spinner', hostClass: DEFAULT_CLS};

@Component({
  standalone: true,
  imports: [CommonModule, ImagePipe],
    selector: '[wmSpinner]',
    templateUrl: './spinner.component.html',
    providers: [
        provideAsWidgetRef(SpinnerComponent)
    ],
    exportAs: 'wmSpinner'
})
export class SpinnerComponent extends StylableComponent implements OnInit, OnDestroy {
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
    private dataSourceSubscription;

    public get spinnerMessages() {
        return this._spinnerMessages;
    }

    public set spinnerMessages(newVal) {
        this.showCaption = isEmpty(newVal);
        this._spinnerMessages = newVal;
    }

    private listenOnDataSource() {
        const variables = split(this.servicevariabletotrack, ',');
        this.dataSourceSubscription = this.getAppInstance().subscribe('toggle-variable-state', data => {
            const name = data.variable.execute(DataSource.Operation.GET_NAME);
            if (includes(variables, name) && validateDataSourceCtx(data.variable, this.getViewParent())) {
                this.widget.show = data.active;
            }
        });
    }

    constructor(inj: Injector, private imagePipe: ImagePipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
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

    ngOnDestroy() {
        // Unsubscribe from data source subscription to prevent memory leak
        if (this.dataSourceSubscription) {
            this.dataSourceSubscription();
        }
        super.ngOnDestroy();
    }
}
