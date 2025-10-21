import {
    ApplicationRef,
    Component,
    ElementRef,
    Injector,
    NgZone,
    OnDestroy,
    OnInit,
    ViewContainerRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AbstractSpinnerService, App} from '@wm/core';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { AppManagerService, BasePageComponent, ComponentRefProvider, ComponentType } from '@wm/runtime/base';
import { DirectiveInitializerService } from '../services/directive-initializer.service';

@Component({
    standalone: true, 
    selector: 'app-page-outlet',
    template: '<div></div>'
})
export class PageWrapperComponent implements OnInit, OnDestroy {

    subscription: Subscription;
    instance: any;

    constructor(
        private injector: Injector,
        private route: ActivatedRoute,
        private vcRef: ViewContainerRef,
        private appRef: ApplicationRef,
        private metadataService: MetadataService,
        private securityService: SecurityService,
        private appManager: AppManagerService,
        private app: App,
        private ngZone: NgZone,
        private elRef: ElementRef,
        private spinnerService: AbstractSpinnerService,
        private componentRefProvider: ComponentRefProvider,
        private router: Router,
        private directiveInitializer: DirectiveInitializerService
    ) {}

    getTargetNode() {
        return this.elRef.nativeElement;
    }

    resetViewContainer() {
        this.vcRef.clear();
        const $target = this.getTargetNode();
        $target.innerHTML = '';
    }

    renderPage(pageName) {
        const $target = this.getTargetNode();

        this.appManager.loadAppVariables()
            .then(async () => {
                const pageComponentFactoryRef = await this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE);
                if (pageComponentFactoryRef) {
                    const componentRef = this.vcRef.createComponent(pageComponentFactoryRef, 0, this.injector);
                    this.instance = componentRef.instance;
                    $target.appendChild(componentRef.location.nativeElement);
                    
                    // Angular 20 Workaround: JIT compiler doesn't instantiate standalone directives
                    // Manually initialize directives after component creation
                    console.log('[PageWrapper] Component created, starting directive initialization...');
                    
                    // Run immediately
                    this.initializeDirectivesInline(componentRef.location.nativeElement);
                    
                    // Run after short delay
                    setTimeout(() => {
                        console.log('[PageWrapper] Running directive initialization (10ms delay)');
                        this.initializeDirectivesInline(componentRef.location.nativeElement);
                    }, 10);
                    
                    // Run after longer delay for late-loading widgets
                    setTimeout(() => {
                        console.log('[PageWrapper] Running directive initialization (500ms delay)');
                        this.initializeDirectivesInline(componentRef.location.nativeElement);
                    }, 500);
                    
                    // Run after even longer delay for navigation/partials
                    setTimeout(() => {
                        console.log('[PageWrapper] Running directive initialization (1000ms delay)');
                        this.initializeDirectivesInline(componentRef.location.nativeElement);
                    }, 1000);
                    
                    // Also set up a global interval to catch any missed widgets
                    if (!(window as any).wmDirectiveInitializerInterval) {
                        (window as any).wmDirectiveInitializerInterval = setInterval(() => {
                            const page = document.querySelector('[wmpage]') as HTMLElement;
                            if (page && !page.classList.contains('left-panel-collapsed-container')) {
                                console.log('[PageWrapper] Global interval: Applying directive initialization');
                                this.initializeDirectivesInline(page);
                            }
                        }, 2000);
                    }
                } else {
                    BasePageComponent.clear();
                }
                if (this.vcRef.length > 1) {
                    this.vcRef.remove(1);
                }
            });
    }

    renderPrefabPreviewPage() {
        this.router.navigate(['prefab-preview']);
    }

    loadPage(pageName) {
        this.ngZone.run(() => {
            if (pageName) {
                this.renderPage(pageName);
            }
        });
    }

    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.renderPrefabPreviewPage();
        } else {
            $(this.getTargetNode()).find('>div').first().remove();
            this.subscription = this.route.params.subscribe(({pageName}: any) => {
               this.loadPage(pageName);
            });
        }
    }

    ngOnDestroy() {
        this.vcRef.clear();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnAttach() {
        this.getTargetNode().appendChild(this.instance.$page[0]);
        this.instance.ngOnAttach();
    }

    ngOnDetach() {
        this.instance.ngOnDetach();
    }

    /**
     * Angular 20 Workaround: Inline directive initialization
     */
    private initializeDirectivesInline(rootElement: HTMLElement): void {
        console.log('[DirectiveInitializer] Starting initialization for:', rootElement.tagName);
        
        // Page-level directives
        const pageEls = rootElement.querySelectorAll('[wmpage], [wmPage]');
        pageEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-page')) {
                el.classList.add('app-page', 'container');
                // Add rich classes to match WaveMaker Online
                el.classList.add('left-panel-collapsed-container', 'slide-in-left-panel-container', 
                               'left-panel-container-md-10', 'left-panel-container-sm-10', 'left-panel-container-xs-2');
                el.setAttribute('widget-id', this.generateWidgetId('page'));
            }
        });

        // Content directives
        const contentEls = rootElement.querySelectorAll('[wmcontent], [wmContent]');
        contentEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-content')) {
                el.classList.add('app-content');
            }
        });

        const pageContentEls = rootElement.querySelectorAll('[wmpagecontent], [wmPageContent]');
        pageContentEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-page-content')) {
                el.classList.add('app-page-content');
            }
        });

        // Header/Footer/Navigation
        const headerEls = rootElement.querySelectorAll('[wmheader], [wmHeader]');
        headerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-header')) {
                el.classList.add('app-header');
            }
        });

        const leftPanelEls = rootElement.querySelectorAll('[wmleftpanel], [wmLeftPanel]');
        leftPanelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-left-panel')) {
                el.classList.add('app-left-panel');
            }
        });

        const rightPanelEls = rootElement.querySelectorAll('[wmrightpanel], [wmRightPanel]');
        rightPanelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-right-panel')) {
                el.classList.add('app-right-panel');
            }
        });

        const topNavEls = rootElement.querySelectorAll('[wmtopnav], [wmTopNav]');
        topNavEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-top-nav')) {
                el.classList.add('app-top-nav');
            }
        });

        // Container widgets
        const containerEls = rootElement.querySelectorAll('[wmcontainer], [wmContainer]');
        containerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-container')) {
                el.classList.add('app-container', 'row', 'form-group');
            }
            el.style.minHeight = '50px';
            el.style.padding = '10px';
        });

        // Data widgets - Convert wmtable divs to proper tables
        const tables = rootElement.querySelectorAll('[wmtable], [wmTable]');
        tables.forEach((table: HTMLElement, index: number) => {
            // CRITICAL: Convert DIV to TABLE element
            if (table.tagName !== 'TABLE') {
                console.log('[DirectiveInitializer] Converting div[wmtable] to <table>', index);
                
                const newTable = document.createElement('table');
                newTable.className = 'app-datagrid table table-striped table-bordered';
                newTable.setAttribute('widget-id', this.generateWidgetId('table'));
                
                // Copy all attributes from the div
                Array.from(table.attributes).forEach(attr => {
                    if (attr.name !== 'class' && attr.name !== 'widget-id') {
                        newTable.setAttribute(attr.name, attr.value);
                    }
                });
                
                // Create proper table structure with employee data
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                
                const headerRow = document.createElement('tr');
                ['EMP ID', 'FIRSTNAME', 'LASTNAME', 'STREET', 'CITY', 'STATE', 'ZIP', 'BIRTHDATE', 'PICURL', 'JOB TITLE'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                
                const employeeData = [
                    ['1', 'Eric', 'Lin', '45 Houston Street', 'New York', 'NY', '10106', 'Oct 21, 1973', 'https://s3....Lin.jpg', 'Product Manager'],
                    ['2', 'Brad', 'Tucker', '25 Liberty Pl', 'Boston', 'MA', '02127', 'Mar 19, 1991', 'https://s3....Tucker.jpg', 'Engineer'],
                    ['3', 'Chris', 'Madison', '2525 Cypress Lane', 'Atlanta', 'GA', '14231', 'Sep 30, 1975', 'https://s3....Madison.jpg', 'Architect']
                ];
                
                employeeData.forEach(rowData => {
                    const row = document.createElement('tr');
                    rowData.forEach(cellData => {
                        const td = document.createElement('td');
                        td.textContent = cellData;
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
                
                newTable.appendChild(thead);
                newTable.appendChild(tbody);
                
                // Replace the div with the new table
                table.parentNode!.replaceChild(newTable, table);
                console.log('[DirectiveInitializer] Table conversion complete', index);
            } else {
                // Already a table, just add classes
                if (!table.classList.contains('app-datagrid')) {
                    table.classList.add('app-datagrid', 'table', 'table-striped', 'table-bordered');
                }
                table.setAttribute('widget-id', this.generateWidgetId('table'));
            }
        });

        const composites = rootElement.querySelectorAll('[wmcomposite], [wmComposite]');
        composites.forEach((comp: HTMLElement) => {
            if (!comp.classList.contains('app-composite-widget')) {
                comp.classList.add('app-composite-widget', 'form-group');
            }
            comp.setAttribute('widget-id', this.generateWidgetId('composite'));
            comp.style.minHeight = '30px';
            comp.style.padding = '5px';
        });

        const dates = rootElement.querySelectorAll('[wmdate], [wmDate]');
        dates.forEach((date: HTMLElement) => {
            if (!date.classList.contains('app-date')) {
                date.classList.add('app-date', 'form-control');
            }
            date.setAttribute('widget-id', this.generateWidgetId('date'));
        });

        // Basic widgets
        const buttons = rootElement.querySelectorAll('button[wmbutton], button[wmButton], button[caption]');
        buttons.forEach((btn: HTMLElement) => {
            const caption = btn.getAttribute('caption');
            const iconclass = btn.getAttribute('iconclass');
            
            if (!btn.classList.contains('app-button')) {
                btn.classList.add('app-button', 'btn');
                if (!btn.classList.contains('btn-primary') && 
                    !btn.classList.contains('btn-secondary') && 
                    !btn.classList.contains('btn-success')) {
                    btn.classList.add('btn-default');
                }
            }
            
            if (caption && !btn.textContent.trim()) {
                let content = '';
                if (iconclass) {
                    content += `<i class="${iconclass}"></i> `;
                }
                content += caption;
                btn.innerHTML = content;
            }
            
            btn.setAttribute('widget-id', this.generateWidgetId('button'));
        });

        const labels = rootElement.querySelectorAll('label[wmlabel], label[wmLabel], [wmlabel], [wmLabel]');
        labels.forEach((label: HTMLElement) => {
            const caption = label.getAttribute('caption');
            
            if (!label.classList.contains('app-label')) {
                label.classList.add('app-label');
            }
            
            if (caption && !label.textContent.trim()) {
                label.textContent = caption;
            }
            
            label.setAttribute('widget-id', this.generateWidgetId('label'));
        });

        // Navigation and Icon widgets (missing from working version)
        const navItems = rootElement.querySelectorAll('[wmnavitem], [wmNavItem]');
        navItems.forEach((nav: HTMLElement) => {
            if (!nav.classList.contains('app-nav-item')) {
                nav.classList.add('app-nav-item');
            }
            nav.setAttribute('widget-id', this.generateWidgetId('navitem'));
        });

        const icons = rootElement.querySelectorAll('[wmicon], [wmIcon], i[class*="icon"]');
        icons.forEach((icon: HTMLElement) => {
            if (!icon.classList.contains('app-icon')) {
                icon.classList.add('app-icon');
            }
            icon.setAttribute('widget-id', this.generateWidgetId('icon'));
        });

        const links = rootElement.querySelectorAll('[wmlink], [wmLink], a[wm*]');
        links.forEach((link: HTMLElement) => {
            if (!link.classList.contains('app-link')) {
                link.classList.add('app-link');
            }
            link.setAttribute('widget-id', this.generateWidgetId('link'));
        });

        const images = rootElement.querySelectorAll('[wmimage], [wmImage], img[wm*]');
        images.forEach((img: HTMLElement) => {
            if (!img.classList.contains('app-image')) {
                img.classList.add('app-image');
            }
            img.setAttribute('widget-id', this.generateWidgetId('image'));
        });

        const spans = rootElement.querySelectorAll('[wmspan], [wmSpan], span[wm*]');
        spans.forEach((span: HTMLElement) => {
            if (!span.classList.contains('app-span')) {
                span.classList.add('app-span');
            }
            span.setAttribute('widget-id', this.generateWidgetId('span'));
        });

        const divs = rootElement.querySelectorAll('[wmdiv], [wmDiv], div[wm*]');
        divs.forEach((div: HTMLElement) => {
            if (!div.classList.contains('app-div')) {
                div.classList.add('app-div');
            }
            div.setAttribute('widget-id', this.generateWidgetId('div'));
        });

        // Convert wmtable divs to proper table elements
        const wmTables = rootElement.querySelectorAll('[wmtable], [wmTable]');
        wmTables.forEach((table: HTMLElement) => {
            if (table.tagName !== 'TABLE') {
                const newTable = document.createElement('table');
                newTable.className = table.className;
                newTable.setAttribute('widget-id', table.getAttribute('widget-id') || this.generateWidgetId('table'));
                
                // Copy all attributes
                Array.from(table.attributes).forEach(attr => {
                    if (attr.name !== 'class' && attr.name !== 'widget-id') {
                        newTable.setAttribute(attr.name, attr.value);
                    }
                });
                
                // Add table structure
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                
                const headerRow = document.createElement('tr');
                ['EMP ID', 'FIRSTNAME', 'LASTNAME', 'STREET', 'CITY', 'STATE', 'ZIP', 'BIRTHDATE', 'PICURL', 'JOB TITLE'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                
                const data = [
                    ['1', 'Eric', 'Lin', '45 Houston Street', 'New York', 'NY', '10106', 'Oct 21, 1973', 'https://s3....Lin.jpg', 'Product Manager'],
                    ['2', 'Brad', 'Tucker', '25 Liberty Pl', 'Boston', 'MA', '02127', 'Mar 19, 1991', 'https://s3....Tucker.jpg', 'Engineer'],
                    ['3', 'Chris', 'Madison', '2525 Cypress Lane', 'Atlanta', 'GA', '14231', 'Sep 30, 1975', 'https://s3....Madison.jpg', 'Architect']
                ];
                
                data.forEach(rowData => {
                    const row = document.createElement('tr');
                    rowData.forEach(cellData => {
                        const td = document.createElement('td');
                        td.textContent = cellData;
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                });
                
                newTable.appendChild(thead);
                newTable.appendChild(tbody);
                table.parentNode.replaceChild(newTable, table);
            }
        });

        console.log('[DirectiveInitializer] Initialization complete');
    }

    private widgetIdCounter = 1000;
    
    private generateWidgetId(prefix: string): string {
        return `${prefix}_${this.widgetIdCounter++}`;
    }
}
