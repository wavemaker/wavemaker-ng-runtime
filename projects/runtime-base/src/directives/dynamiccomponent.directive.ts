import { ArrayType } from '@angular/compiler';
import {
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    Inject,
    Injector,
    Optional,
    Self,
    ViewContainerRef
} from '@angular/core';
import { getWatchIdentifier, styler } from '@wm/components/base';
import { DatasetAwareFormComponent } from '@wm/components/input';
import { $watch, App, findParent, noop } from '@wm/core';
import { VariablesService } from '@wm/variables';
import { extend, get, map, startsWith } from 'lodash-es';
import { Subject } from 'rxjs';
const DEFAULT_CLS = 'app-html-container';

@Directive({
    selector: '[wmdynamiccomponent]'
})
export class DynamicComponentDirective {
    widgetProps: Map<string, any>;
    Actions: any;
    Variables: any;
    pageVariables: any;
    Widgets: any;
    widgetName: any;
    viewParent: any;
    private readonly destroy = new Subject();
    context: any;
    widgetId: any;
    App: App;
    constructor(
        private inj: Injector, private el: ElementRef,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        const WIDGET_CONFIG = { widgetType: 'wm-custom', hostClass: DEFAULT_CLS };
        let resolveFn: Function = noop;
        this.App = this.inj.get(App);
        this.widgetName = this.el.nativeElement.nodeName;
        let lView = (this.inj as any)._lView;
        this.viewParent = findParent(lView, this.App);
        //console.log("---*************--context--*************---", lView[8]);
        this.context = (this.inj as any)._lView[8];
        this.widgetId = this.el.nativeElement.getAttribute('widget-id');

        // this.registerPropertyChangeListener(((key: string, nv: any, ov?: any) => {
        //    console.log('/////', key);
        // }))

    }

    ngOnInit(): void {
        this.initVariables();
    }

    initVariables() {
        const variablesService = this.inj.get(VariablesService);

        // get variables and actions instances for the page
        // const variableCollection = variablesService.register(this.App.activePageName, this.getVariables(), this);

        // const variableCollection = variablesService.register(this.widgetName, this.getVariables(), this);

        // create namespace for Variables nad Actions on page/partial, which inherits the Variables and Actions from App instance
        this.Variables = Object.create(this.App.Variables);
        this.Actions = Object.create(this.App.Actions);
        this.pageVariables = this.App.activePage.Variables;
        this.Widgets = this.App.activePage.Widgets;
        // this.Variables = this.Variables;
        // this.containerWidget.Actions = this.Actions;

        // // assign all the page variables to the pageInstance
        // Object.entries(variableCollection.Variables).forEach(([name, variable]) => this.Variables[name] = variable);
        // Object.entries(variableCollection.Actions).forEach(([name, action]) => this.Actions[name] = action);


        // this.viewInit$.subscribe(noop, noop, () => {
        //     // TEMP: triggering watchers so variables watching over params are updated
        //     $invokeWatchers(true, true);
        //     variableCollection.callback(variableCollection.Variables).catch(noop);
        //     variableCollection.callback(variableCollection.Actions);
        // });
    }

    ngAfterViewInit(): void {
        const attributesMap = this.el.nativeElement.attributes;
  const actualAttributes: Record<string, string> = {};

  for (let i = 0; i < attributesMap.length; i++) {
    const attr = attributesMap[i];
    actualAttributes[attr.name] = attr.value; // Preserve attribute name & value
  }

  console.log('^^^^^^^' , actualAttributes);
        let resolveFn: Function;
        this.registerComponent(this.el.nativeElement);
        this.processBindExp();
        // this.registerPropsInContainerWidget(resolveFn);
    }

    processBindExp() {
        const attrs = this.el.nativeElement.getAttributeNames();
        let derivatedVal;
        attrs.forEach(attr => {
            const attrVal = this.el.nativeElement.getAttribute(attr);
            let modifiedKey = attr.replace('.bind', '');
            modifiedKey = Object.keys(this.widgetProps).find(key => key.toLowerCase() === modifiedKey.toLowerCase());
            if (attr.endsWith('.bind')) {
                const globalVar = {...this.Variables, ...this.pageVariables};
                // if (attrVal.indexOf('$i') === -1) {
                //     if (startsWith(attrVal, 'Variables.')) {
                //         derivatedVal = get(globalVar, attrVal.replace('Variables.', ''));
                //     } else if (startsWith(attrVal, 'Widgets.')) {
                //         derivatedVal = get(this.Widgets, attrVal.replace('Widgets.', ''));
                //     }
                //     this.el.nativeElement[modifiedKey] = derivatedVal;
                //     console.log('.....', derivatedVal);
                // } else {
                //     // Extract the path before "[$i]" (object path) and after "[$i]" (property path)
                //     const [objectPath, propertyPath] = attrVal.split('[$i]');

                //     // Remove leading dot from propertyPath, if present
                //     const cleanedPropertyPath = propertyPath.replace(/^\./, '');
                //       // Get the dataset array dynamically using lodash
                //     const dataSet = get(globalVar, objectPath.replace('Variables.', ''), []);
                //       // Ensure dataSet is an array and map through it to get values
                //     derivatedVal = Array.isArray(dataSet) 
                //         ? map(dataSet, item => String(get(item, cleanedPropertyPath, '')))
                //         : [];
                //         console.log('.........??????', derivatedVal);
                //         this.el.nativeElement[modifiedKey] = derivatedVal;
                // }
                this.registerDestroyListener(
                    $watch(
                        attrVal,
                        this.viewParent,
                        this.context,
                        nv => {
                            console.log('////', modifiedKey, nv, attrVal);
                            this.el.nativeElement[modifiedKey] = nv;
                        },
                        undefined,
                        false,
                        {arrayType: attrVal.indexOf('$i') > -1}
                    )
                );
            }
        });
    }

    public registerDestroyListener(fn: Function, ctx?: any) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.destroy.subscribe(() => {}, () => {}, () => fn());
    }

    registerComponent(element: HTMLElement): any {
        // This is a simplified example; you may need a more robust way to get the component type
        // For Angular Elements, you might need to use a mapping or metadata to retrieve the component class
        const el = this.el.nativeElement;
        const tagName = el.tagName.toLowerCase();
        // Get the web component class
        const webComponentClass = customElements.get(tagName);
        // Inspect observed attributes for inputs
        if (webComponentClass) {
            // Fetch input properties dynamically
            this.bindInputs(element, webComponentClass);
      
            // Subscribe to output events dynamically
            // this.bindOutputs(element, this.webComponentInstance);
          }
      }
    
      private bindInputs(element: any, webComponentClass: any) {
        const inputs: any = {};
        if (webComponentClass.observedAttributes) {
            webComponentClass.observedAttributes.forEach((attr: string) => {
              const camelCaseAttr = this.toCamelCase(attr); // Convert to camelCase
      
              // Check if the attribute exists on the element
              inputs[camelCaseAttr] = {show: true, value: element.getAttribute(camelCaseAttr), type: 'string'};
              if (element.hasAttribute(camelCaseAttr)) {
                (element as any)[camelCaseAttr] = element.getAttribute(camelCaseAttr);
                console.log(`Bound @Input: ${camelCaseAttr} =`, (element as any)[camelCaseAttr]);
              } else {
                console.log(`Optional @Input not provided: ${camelCaseAttr}`);
              }
            });
          }
          this.widgetProps = inputs;
          console.log('////', this.widgetProps);
      }
    
      private toCamelCase(attr: string): string {
        return attr.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      }

      ngOnDestroy() {
        this.destroy.complete();
    }

    // registerPropsInContainerWidget(resolveFn: Function) {
    //     this.customwidgetConfigProvider.getConfig(this.customWidgetName).then((config) => {
    //         if (config) {
    //             Object.entries((config.properties || {})).forEach(([key, prop]: [string, any]) => {
    //                 let expr;
    //                 const value = _.trim(prop.value);

    //                 if (_.startsWith(value, 'bind:')) {
    //                     expr = value.replace('bind:', '');
    //                 }

    //                 Object.defineProperty(this, key, {
    //                     get: () => this.containerWidget[key],
    //                     set: nv => this.containerWidget.widget[key] = nv
    //                 });

    //                 if (expr) {
    //                     //[Todo-CSP]: expr will be generated with prefab.comp.expr.ts
    //                     this.registerDestroyListener(
    //                         $watch(expr, this, {}, nv => this.containerWidget.widget[key] = nv)
    //                     );
    //                 }
    //             })
    //         }
    //         this.containerWidget.setProps(config, resolveFn);
    //         // Reassigning the proxy handler for prefab inbound properties as we
    //         // will get them only after the prefab config call.
    //         if (isIE()) {
    //             this.containerWidget.widget = this.containerWidget.createProxy();
    //         }
    //     })
    // }
}
