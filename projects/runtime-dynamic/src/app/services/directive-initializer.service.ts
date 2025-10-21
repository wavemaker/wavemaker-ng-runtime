import { Injectable } from '@angular/core';

/**
 * Angular 20 Workaround Service
 * 
 * In Angular 20, JIT compiler doesn't instantiate standalone directives in dynamically compiled templates.
 * This service manually applies directive logic (classes, properties, content) to elements after compilation.
 */
@Injectable({
    providedIn: 'root'
})
export class DirectiveInitializerService {

    /**
     * Apply directive initialization to a dynamically compiled component
     */
    initializeDirectives(rootElement: HTMLElement): void {
        console.log('[DirectiveInitializer] Starting initialization for:', rootElement.tagName);
        
        // Apply in order: structural first, then widgets
        const pageCount = rootElement.querySelectorAll('[wmpage]').length;
        const tableCount = rootElement.querySelectorAll('[wmtable]').length;
        const buttonCount = rootElement.querySelectorAll('button').length;
        console.log('[DirectiveInitializer] Found widgets - pages:', pageCount, 'tables:', tableCount, 'buttons:', buttonCount);
        
        this.initPageDirectives(rootElement);
        this.initContainerDirectives(rootElement);
        this.initWidgetDirectives(rootElement);
        
        console.log('[DirectiveInitializer] Initialization complete');
    }

    /**
     * Initialize page-level directives (PageDirective, ContentComponent, etc.)
     */
    private initPageDirectives(root: HTMLElement): void {
        // PageDirective: selector '[wmPage]'
        const pageEls = root.querySelectorAll('[wmpage], [wmPage]');
        pageEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-page')) {
                el.classList.add('app-page', 'container');
                el.setAttribute('widget-id', this.generateWidgetId('page'));
            }
        });

        // ContentComponent: selector '[wmContent]'
        const contentEls = root.querySelectorAll('[wmcontent], [wmContent]');
        contentEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-content')) {
                el.classList.add('app-content');
            }
        });

        // PageContentComponent: selector '[wmPageContent]'
        const pageContentEls = root.querySelectorAll('[wmpagecontent], [wmPageContent]');
        pageContentEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-page-content')) {
                el.classList.add('app-page-content');
            }
        });

        // Header: selector '[wmHeader]'
        const headerEls = root.querySelectorAll('[wmheader], [wmHeader]');
        headerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-header')) {
                el.classList.add('app-header');
            }
        });

        // Footer: selector '[wmFooter]'
        const footerEls = root.querySelectorAll('[wmfooter], [wmFooter]');
        footerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-footer')) {
                el.classList.add('app-footer');
            }
        });

        // LeftPanel: selector '[wmLeftPanel]'
        const leftPanelEls = root.querySelectorAll('[wmleftpanel], [wmLeftPanel]');
        leftPanelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-left-panel')) {
                el.classList.add('app-left-panel');
            }
        });

        // RightPanel: selector '[wmRightPanel]'
        const rightPanelEls = root.querySelectorAll('[wmrightpanel], [wmRightPanel]');
        rightPanelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-right-panel')) {
                el.classList.add('app-right-panel');
            }
        });

        // TopNav: selector '[wmTopNav]'
        const topNavEls = root.querySelectorAll('[wmtopnav], [wmTopNav]');
        topNavEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-top-nav')) {
                el.classList.add('app-top-nav');
            }
        });

        // PartialDirective: selector '[wmPartial]'
        const partialEls = root.querySelectorAll('[wmpartial], [wmPartial]');
        partialEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-partial')) {
                el.classList.add('app-partial', 'clearfix');
            }
        });

        // PrefabContainerDirective: selector '[wmPrefabContainer]'
        const prefabContainers = root.querySelectorAll('[wmprefabcontainer], [wmPrefabContainer]');
        prefabContainers.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-prefab-container')) {
                el.classList.add('app-prefab-container');
            }
        });
    }

    /**
     * Initialize container widget directives
     */
    private initContainerDirectives(root: HTMLElement): void {
        // Panel: selector '[wmPanel]'
        const panelEls = root.querySelectorAll('[wmpanel], [wmPanel]');
        panelEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('panel')) {
                el.classList.add('panel', 'app-panel');
            }
        });

        // Container: selector '[wmContainer]'
        const containerEls = root.querySelectorAll('[wmcontainer], [wmContainer]');
        containerEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-container')) {
                el.classList.add('app-container');
            }
        });

        // Accordion: selector '[wmAccordion]'
        const accordionEls = root.querySelectorAll('[wmaccordion], [wmAccordion]');
        accordionEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('panel-group')) {
                el.classList.add('panel-group', 'app-accordion');
            }
        });

        // Tabs: selector '[wmTabs]'
        const tabsEls = root.querySelectorAll('[wmtabs], [wmTabs]');
        tabsEls.forEach((el: HTMLElement) => {
            if (!el.classList.contains('app-tabs')) {
                el.classList.add('app-tabs');
            }
        });
    }

    /**
     * Initialize basic widget directives and set their content
     */
    private initWidgetDirectives(root: HTMLElement): void {
        // Button: selector '[wmButton]'
        const buttons = root.querySelectorAll('button[wmbutton], button[wmButton], button[caption]');
        buttons.forEach((btn: HTMLElement) => {
            const caption = btn.getAttribute('caption');
            const iconclass = btn.getAttribute('iconclass');
            
            // Add button classes
            if (!btn.classList.contains('app-button')) {
                btn.classList.add('app-button', 'btn');
                
                // Add button type class if not present
                if (!btn.classList.contains('btn-primary') && 
                    !btn.classList.contains('btn-secondary') && 
                    !btn.classList.contains('btn-success')) {
                    btn.classList.add('btn-default');
                }
            }
            
            // Set button content from caption
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

        // Label: selector '[wmLabel]'
        const labels = root.querySelectorAll('label[wmlabel], label[wmLabel], [wmlabel], [wmLabel]');
        labels.forEach((label: HTMLElement) => {
            const caption = label.getAttribute('caption');
            
            if (!label.classList.contains('app-label')) {
                label.classList.add('app-label');
            }
            
            // Set label content from caption
            if (caption && !label.textContent.trim()) {
                label.textContent = caption;
            }
            
            label.setAttribute('widget-id', this.generateWidgetId('label'));
        });

        // Text Input: selector '[wmText]'
        const textInputs = root.querySelectorAll('input[wmtext], input[wmText]');
        textInputs.forEach((input: HTMLElement) => {
            if (!input.classList.contains('app-textbox')) {
                input.classList.add('app-textbox', 'form-control');
            }
            input.setAttribute('widget-id', this.generateWidgetId('text'));
        });

        // Textarea: selector '[wmTextarea]'
        const textareas = root.querySelectorAll('textarea[wmtextarea], textarea[wmTextarea]');
        textareas.forEach((textarea: HTMLElement) => {
            if (!textarea.classList.contains('app-textarea')) {
                textarea.classList.add('app-textarea', 'form-control');
            }
            textarea.setAttribute('widget-id', this.generateWidgetId('textarea'));
        });

        // Checkbox: selector '[wmCheckbox]'
        const checkboxes = root.querySelectorAll('input[type="checkbox"][wmcheckbox], input[type="checkbox"][wmCheckbox]');
        checkboxes.forEach((cb: HTMLElement) => {
            if (!cb.classList.contains('app-checkbox')) {
                cb.classList.add('app-checkbox');
            }
            cb.setAttribute('widget-id', this.generateWidgetId('checkbox'));
        });

        // Select: selector '[wmSelect]'
        const selects = root.querySelectorAll('select[wmselect], select[wmSelect]');
        selects.forEach((select: HTMLElement) => {
            if (!select.classList.contains('app-select')) {
                select.classList.add('app-select', 'form-control');
            }
            select.setAttribute('widget-id', this.generateWidgetId('select'));
        });

        // Composite: selector '[wmComposite]'
        const composites = root.querySelectorAll('[wmcomposite], [wmComposite]');
        composites.forEach((comp: HTMLElement) => {
            if (!comp.classList.contains('app-composite-widget')) {
                comp.classList.add('app-composite-widget');
            }
            comp.setAttribute('widget-id', this.generateWidgetId('composite'));
        });

        // Date: selector '[wmDate]'
        const dates = root.querySelectorAll('[wmdate], [wmDate]');
        dates.forEach((date: HTMLElement) => {
            if (!date.classList.contains('app-date')) {
                date.classList.add('app-date');
            }
            date.setAttribute('widget-id', this.generateWidgetId('date'));
        });

        // Table: selector '[wmTable]'
        const tables = root.querySelectorAll('[wmtable], [wmTable]');
        tables.forEach((table: HTMLElement) => {
            if (!table.classList.contains('app-datagrid')) {
                table.classList.add('app-datagrid');
            }
            table.setAttribute('widget-id', this.generateWidgetId('table'));
        });

        // LiveTable: selector '[wmLiveTable]'
        const liveTables = root.querySelectorAll('[wmlivetable], [wmLiveTable]');
        liveTables.forEach((table: HTMLElement) => {
            if (!table.classList.contains('app-live-table')) {
                table.classList.add('app-live-table');
            }
            table.setAttribute('widget-id', this.generateWidgetId('livetable'));
        });

        // Dialog: selector '[wmDialog]'
        const dialogs = root.querySelectorAll('[wmdialog], [wmDialog]');
        dialogs.forEach((dialog: HTMLElement) => {
            if (!dialog.classList.contains('app-dialog')) {
                dialog.classList.add('app-dialog', 'modal');
            }
            dialog.setAttribute('widget-id', this.generateWidgetId('dialog'));
        });

        // Form: selector '[wmForm]'
        const forms = root.querySelectorAll('form[wmform], form[wmForm]');
        forms.forEach((form: HTMLElement) => {
            if (!form.classList.contains('app-form')) {
                form.classList.add('app-form');
            }
            form.setAttribute('widget-id', this.generateWidgetId('form'));
        });

        // List: selector '[wmList]'
        const lists = root.querySelectorAll('[wmlist], [wmList]');
        lists.forEach((list: HTMLElement) => {
            if (!list.classList.contains('app-listtemplate')) {
                list.classList.add('app-listtemplate');
            }
            list.setAttribute('widget-id', this.generateWidgetId('list'));
        });
    }

    private widgetIdCounter = 1000;
    
    private generateWidgetId(prefix: string): string {
        return `${prefix}_${this.widgetIdCounter++}`;
    }
}

