import { ActivatedRoute } from '@angular/router';
import { ApplicationRef, Component, ViewContainerRef } from '@angular/core';
import { PageUtils } from '../services/page-utils.service';
import { transpile } from '@transpiler/build';


@Component({
    selector: 'app-page-outlet',
    template: '<div></div>'
})
export class PageWrapperComponent {
    constructor(private route: ActivatedRoute, private pageUtil: PageUtils, private vcRef: ViewContainerRef, private appRef: ApplicationRef) {
    }

    renderDynamicComponent(pageName) {


        let { layout: pageLayout } = this.pageUtil.getPageInfo(pageName);
        let layoutTemplate = this.pageUtil.getLayoutTemplate(pageLayout);

        let {componentFactory: layoutRef, postLayoutInitPromise} = this.pageUtil.createDynamicLayoutComponent(`app-layout-${pageLayout}`, layoutTemplate);
        this.vcRef.clear();
        this.vcRef.createComponent(layoutRef);

        postLayoutInitPromise.then(() => {
            this.pageUtil.loadPageResources(pageName)
                .subscribe(({markup, script, styles, variables}: any) => {
                    markup = markup.join('\n');
                    script = script.join('\n');
                    styles = styles.join('\n');

                    markup = transpile(markup);

                    let componentRef = this.pageUtil.createDynamicPageComponent(`app-page-${pageName}`, markup, script, styles, variables);
                    let component = this.vcRef.createComponent(componentRef);
                    this.appRef.components[0].location.nativeElement.querySelector('[page-content-outlet]').appendChild(component.location.nativeElement);
                });
        });
    }

    ngOnInit() {
        this.route.params.subscribe(({ pageName }) => {
            if (pageName) {
                this.renderDynamicComponent(pageName);
            }
        });
    }
}