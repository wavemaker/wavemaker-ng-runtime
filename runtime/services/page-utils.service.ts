import {
    AfterViewInit,
    Compiler,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Injectable,
    Injector,
    NgModule,
    ViewContainerRef
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WmComponentsModule, PageWidgets } from '@components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PartialContainerDirective } from '../components/partial-container/partial-container.directive';
import { transpile } from '@transpiler/build';
import { VariablesService } from '@variables/services/variables.service';
import { App } from './app.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';


const pageScriptCache = new Map<string, Function>();

@NgModule({
    declarations: [PartialContainerDirective],
    exports: [
        PartialContainerDirective
    ]
})
class TempModule {

}

@Injectable()
export class PageUtils {
    constructor(private $http: HttpClient, private compiler: Compiler, private app: App,
                private injector: Injector, private route: ActivatedRoute) {
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

    loadPageResources(pageName) {
        return this.$http.get(`./pages/${pageName}/page.min.json`).toPromise();
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

    getComponentFactory(componentDef, moduleDef) {
        let retVal = this.compiler
            .compileModuleAndAllComponentsSync(moduleDef)
            .componentFactories
            .filter((factory) => {
                return factory.componentType === componentDef;
            })[0];
        return retVal;
    }

    getDynamicComponent(selector, template, styles, providers, scriptFn) {
        @Component({
            selector,
            template,
            styles,
            providers
        })
        class DynamicComponent {
            constructor(inj: Injector) {
                scriptFn(this, inj);
            }
        }

        return DynamicComponent;
    }

    getDynamicModule(component) {
        @NgModule({
            declarations: [component],
            imports: [WmComponentsModule, FormsModule, ReactiveFormsModule, TempModule, CommonModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
        class DynamicModule {
        }

        return DynamicModule;
    }

    getScriptFn($js, containerName, pageName, variables) {

        let scriptFn = pageScriptCache.get(pageName);

        // $js = '';

        $js = `console.log(${containerName ? 'Partial' : 'Page'}, App, Injector); ${$js}`;

        if (!scriptFn) {
            scriptFn = new Function(containerName ? 'Partial' : 'Page', 'App', 'Injector', $js);
            pageScriptCache.set(pageName, scriptFn);
        }

        return (instance, inj) => {
            const variablesService = inj.get(VariablesService);

            if (!containerName) {
                (<any>instance).Widgets = PageWidgets;
            }
            const $variables = variablesService.register(pageName, variables, instance);
            instance.Variables = $variables.Variables;
            instance.Actions = $variables.Actions;

            this.route.queryParams.subscribe(params => {
                instance.pageParams = params;
            });

            scriptFn(instance, this.app, this.injector)

            // const scriptFn = new Function('Application', $js);
            // const ctrlCache = {};
            // const Application = {
            //     $controller: function (ctrlName, ctrlDef) {
            //         ctrlCache[ctrlName] = ctrlDef;
            //     }
            // };
            // scriptFn(Application);
            //
            // Object.keys(ctrlCache).forEach(ctrlName => {
            //     let ctrlArray = ctrlCache[ctrlName];
            //     let args = [];
            //     if (ctrlArray.length > 1) {
            //
            //         for (let i = 0; i < ctrlArray.length - 1; i++) {
            //             let value = ctrlArray[i];
            //             if (value === '$scope') {
            //                 args.push(this);
            //             }
            //
            //             if (value === '$rootScope') {
            //                 args.push({});
            //             }
            //
            //             if (value === 'Utils') {
            //                 args.push({toString: () => void 0});
            //             }
            //
            //             if (value === '$http') {
            //                 args.push(inj.get(HttpClient));
            //             }
            //
            //             if (value === '$timeout') {
            //                 args.push(setTimeout);
            //             }
            //
            //             if (value === '$interval') {
            //                 args.push(setInterval);
            //             }
            //         }
            //
            //         ctrlArray[ctrlArray.length - 1].apply(this, args);
            //     }
            // });

        }
    }

    renderPage_(pageName, containerName, markup, script, styles, variables, vcRef, $target) {

        const fn: Function = this.getScriptFn(script, containerName, pageName, variables);

        const providers = [{provide: '@namespace', useValue: containerName }];

        const selector = `app-${containerName ? 'partial' : 'page'}-${pageName}`;

        const componentDef = this.getDynamicComponent(
            selector,
            markup,
            styles,
            providers,
            fn
        );
        const moduleDef = this.getDynamicModule(componentDef);
        const componentRef = this.getComponentFactory(componentDef, moduleDef);

        const component = vcRef.createComponent(componentRef);
        $target.appendChild(component.location.nativeElement);
    }

    renderPage(pageName, containerName, vcRef: ViewContainerRef, $target: HTMLElement) {

        this.loadPageResources(pageName)
            .then(({markup, script, styles, variables}: any) => {

                this.renderPage_(
                    pageName,
                    containerName,
                    transpile(markup.join('\n')),
                    script.join('\n'),
                    [styles.join('\n')],
                    variables,
                    vcRef,
                    $target
                )
            })
            .catch(e => {
                console.error(`error loading the page: '${pageName}'`, e);
            });
    }

}
