import { AfterViewInit, Compiler, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WmComponentsModule } from '@components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Injectable()
export class PageUtils {
    constructor(private $http: HttpClient, private compiler: Compiler) {
    }

    getPageInfo(pageName) {
        return {
            layout: 'adminLayout'
        };
    }

    getLayoutTemplate(layoutName) {
        //return App.layouts[layoutName];

        return `
        <div layout-template="x-template" layout-name="adminLayout" link="wm-page">
            <header link="wm-header" fragment="header"></header>
            <main link="wm-content">
                <div link="wm-page-content" page-content-outlet></div>
            </main>
            <footer fragment="footer" link="wm-footer"></footer>
        </div>
        `.trim();
    }

    // loadPageMarkup(pageName) {
    //     return this.$http.get(`./pages-next/${pageName}/${pageName}.html`).toPromise();
    // }
    //
    // loadPageScript(pageName) {
    //     return this.$http.get(`./pages-next/${pageName}/${pageName}.js`).toPromise();
    // }
    //
    // loadPageStyles(pageName) {
    //     return this.$http.get(`./pages-next/${pageName}/${pageName}.css`).toPromise();
    // }
    //
    // loadPageVariables(pageName) {
    //     return this.$http.get(`./pages-next/${pageName}/${pageName}.variables.json`).toPromise();
    // }

    loadPageResources(pageName) {
        return this.$http.get(`./pages/${pageName}/page.min.json`);
    }


    createDynamicLayoutComponent(selector, template, postLayoutInitFn?) {
        let res, rej;

        let promise = new Promise((resolve, reject) => {
            res = resolve;
            rej = reject;
        });

        (<any>promise).resolve = () => res();
        (<any>promise).reject = () => rej();


        @Component({
            selector,
            template
        })
        class DynamicComponent implements AfterViewInit {
            ngAfterViewInit() {
                (<any>promise).resolve();
            }
        }

        @NgModule({
            declarations:[DynamicComponent]
        })
        class DynamicModule {
        }

        return {
            componentFactory: this.getComponentFactory(DynamicComponent, DynamicModule),
            postLayoutInitPromise: promise
        };
    }


    createDynamicPageComponent(selector, template, $js, $css, $variables) {

        const $http = this.$http;

        @Component({
            selector,
            template
        })
        class DynamicComponent {
            constructor() {
                let scriptFn = new Function('Application', $js);
                let ctrlCache = {};
                let Application = {
                    $controller: function (ctrlName, ctrlDef) {
                        ctrlCache[ctrlName] = ctrlDef;
                    }
                };
                scriptFn(Application);
                Object.keys(ctrlCache).forEach((ctrlName) => {
                    let ctrlArray = ctrlCache[ctrlName];
                    let args = [];
                    if (ctrlArray.length > 1) {

                        for (let i = 0; i < ctrlArray.length - 1; i++) {
                            let value = ctrlArray[i];
                            if (value === '$scope') {
                                args.push(this);
                            }

                            if (value === '$rootScope') {
                                args.push({});
                            }

                            if (value === 'Utils') {
                                args.push({toString: () => void 0});
                            }

                            if (value === '$http') {
                                args.push($http);
                            }

                            if (value === '$timeout') {
                                args.push(setTimeout);
                            }

                            if (value === '$interval') {
                                args.push(setInterval);
                            }
                        }

                        ctrlArray[ctrlArray.length - 1].apply(this, args);
                    }
                });
            }
        }

        @NgModule({
            declarations: [DynamicComponent],
            imports: [WmComponentsModule, FormsModule, ReactiveFormsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
        class DynamicModule {
        }

        return this.getComponentFactory(DynamicComponent, DynamicModule);
    }

    getComponentFactory(componentDef, moduleDef) {
        let retVal = this.compiler
            .compileModuleAndAllComponentsSync(moduleDef)
            .componentFactories
            .filter((factory) => {
                return factory.componentType === componentDef;
            })[0];
        return retVal;
    }
}
