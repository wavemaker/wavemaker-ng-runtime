import { AfterViewInit, Attribute, Component, Injector, OnDestroy } from '@angular/core';

import { getEvaluatedData, IWidgetConfig, PageDirective, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';

import { registerProps } from './tabbar.props';

registerProps();

declare const $;
declare const _;
const DEFAULT_CLS = 'app-tabbar app-top-nav';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-mobile-tabbar', hostClass: DEFAULT_CLS};

interface TabItem {
    icon: string;
    label: string;
    link?: string;
    value?: string;
}

@Component({
    selector: 'div[wmMobileTabbar]',
    templateUrl: './tabbar.component.html',
    providers: [
        provideAsWidgetRef(MobileTabbarComponent)
    ]
})
export class MobileTabbarComponent extends StylableComponent implements AfterViewInit, OnDestroy {

    public tabItems = [];
    public layout = {};

    private readonly _layouts = [
        {minwidth: 2048, max: 12},
        {minwidth: 1024, max: 10},
        {minwidth: 768, max: 7},
        {minwidth: 480, max: 5},
        {minwidth: 0, max: 4}
    ];

    constructor(
        private page: PageDirective,
        inj: Injector,
        @Attribute('itemlabel.bind') public binditemlabel,
        @Attribute('itemicon.bind') public binditemicon,
        @Attribute('itemicon.bind') public binditemlink
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.$element, this);
        page.notify('wmMobileTabbar:ready', this);
    }

    public onPropertyChange(key, nv, ov?) {
        if (key === 'dataset') {
            if (nv) {
                this.tabItems = this.getTabItems(nv);
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.layout = this.getSuitableLayout();
            $(window).on('resize.tabbar', _.debounce(() => this.layout = this.getSuitableLayout(), 20));
        });
        super.ngAfterViewInit();
    }

    public ngOnDestroy() {
        $(window).off('.tabbar');
        super.ngOnDestroy();
    }

    public onSelect($event, selectedItem: TabItem) {
        this.invokeEventCallback('select', {$event, $item: selectedItem.value || selectedItem.label});
    }

    private getItems(itemArray: any[]): TabItem[] {
        return itemArray.map(item => ({
            label: item,
            icon: 'wi wi-' + item
        }));
    }

    private getSuitableLayout() {
        const avaiableWidth: number = $(this.nativeElement).parent().width();
        return this._layouts.find(l => avaiableWidth >= l.minwidth);
    }

    private getTabItems(value: any): TabItem[] {
        if (_.isArray(value)) {
            if (_.isObject(value[0])) {
                return (value as any[]).map(item => {
                    const link = getEvaluatedData(item, {expression: 'itemlink', 'bindExpression': this.binditemlink}) || item.link;
                    const activePageName = window.location.hash.substr(2);
                    return {
                        label: getEvaluatedData(item, {expression: 'itemlabel', bindExpression: this.binditemlabel}) || item.label,
                        icon: getEvaluatedData(item, {expression: 'itemicon', bindExpression: this.binditemicon}) || item.icon,
                        link: link,
                        active: _.includes([activePageName, '#' + activePageName, '#/' + activePageName], link)
                    };
                });
            } else {
                return this.getItems(value as any[]);
            }
        } else if (_.isString(value)) {
            return this.getItems((value as string).split(','));
        }
    }

}
