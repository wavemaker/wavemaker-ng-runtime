import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import { PictureDirective } from '@wm/components/basic';
import { MenuComponent } from '@wm/components/navigation/menu';
import {
    AfterViewInit,
    Component,
    ElementRef,
    Injector,
    OnInit,
    Renderer2,
    Optional,
    SkipSelf,
    ViewChild,
    Inject
} from '@angular/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, styler } from '@wm/components/base';
import { MenuAdapterComponent } from '@wm/components/navigation/menu';

import { registerProps } from './card.props';
import {removeAttr, setAttr} from '@wm/core';

const DEFAULT_CLS = 'app-card card app-panel';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-card',
    hostClass: DEFAULT_CLS
};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule, PictureDirective, MenuComponent],
    selector: '[wmCard]',
    templateUrl: './card.component.html',
    providers: [
        provideAsWidgetRef(CardComponent)
    ]
})
export class CardComponent extends MenuAdapterComponent implements OnInit, AfterViewInit {
    static initializeProps = registerProps();

    public showHeader: boolean;
    public title: string;
    public subheading: string;
    public iconclass: string;
    public iconurl: string;
    public actions: string;
    public picturesource;

    @ViewChild('cardContainerWrapper', { static: true }) private cardContainerElRef: ElementRef;

    constructor(inj: Injector, private render2: Renderer2, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.cardContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.INNER_SHELL);
    }
    ngOnInit() {
        super.ngOnInit();
        removeAttr(this.nativeElement.parentElement, 'tabindex');
        setAttr(this.nativeElement, 'tabindex', 0);
        this.render2.listen(this.nativeElement, 'keydown.Enter', (e) => {
            e.preventDefault();
            this.nativeElement.click();
        });
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'title' || key === 'subheading' || key === 'iconclass' || key === 'iconurl' || key === 'actions') {
            this.showHeader = !!(this.title || this.subheading || this.iconclass || this.iconurl || this.actions);
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}

// Todo(swathi) - menu
