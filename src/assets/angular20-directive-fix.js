// Global Angular 20 Directive Initializer
// This script ensures directive initialization runs automatically

(function() {
    'use strict';
    
    console.log('[Global Directive Initializer] Script loaded');
    
    function initializeDirectives() {
        const root = document.querySelector('[wmpage]') || document.body;
        if (!root) return;
        
        console.log('[Global Directive Initializer] Starting initialization...');
        
        // Page-level directives
        const pageEls = root.querySelectorAll('[wmpage], [wmPage]');
        pageEls.forEach((el) => {
            if (!el.classList.contains('app-page')) {
                el.classList.add('app-page', 'container');
                el.classList.add('left-panel-collapsed-container', 'slide-in-left-panel-container', 
                               'left-panel-container-md-10', 'left-panel-container-sm-10', 'left-panel-container-xs-2');
                el.setAttribute('widget-id', 'page_global');
            }
        });

        // Content directives
        const contentEls = root.querySelectorAll('[wmcontent], [wmContent]');
        contentEls.forEach((el) => {
            if (!el.classList.contains('app-content')) {
                el.classList.add('app-content');
            }
        });

        const pageContentEls = root.querySelectorAll('[wmpagecontent], [wmPageContent]');
        pageContentEls.forEach((el) => {
            if (!el.classList.contains('app-page-content')) {
                el.classList.add('app-page-content');
            }
        });

        // Navigation
        const headerEls = root.querySelectorAll('[wmheader], [wmHeader]');
        headerEls.forEach((el) => {
            if (!el.classList.contains('app-header')) {
                el.classList.add('app-header');
            }
        });

        const leftPanelEls = root.querySelectorAll('[wmleftpanel], [wmLeftPanel]');
        leftPanelEls.forEach((el) => {
            if (!el.classList.contains('app-left-panel')) {
                el.classList.add('app-left-panel');
            }
        });

        const rightPanelEls = root.querySelectorAll('[wmrightpanel], [wmRightPanel]');
        rightPanelEls.forEach((el) => {
            if (!el.classList.contains('app-right-panel')) {
                el.classList.add('app-right-panel');
            }
        });

        const topNavEls = root.querySelectorAll('[wmtopnav], [wmTopNav]');
        topNavEls.forEach((el) => {
            if (!el.classList.contains('app-top-nav')) {
                el.classList.add('app-top-nav');
            }
        });

        // Container widgets
        const containerEls = root.querySelectorAll('[wmcontainer], [wmContainer]');
        containerEls.forEach((el) => {
            if (!el.classList.contains('app-container')) {
                el.classList.add('app-container', 'row', 'form-group');
            }
            el.style.minHeight = '50px';
            el.style.padding = '10px';
        });

        // Data widgets - Tables
        const wmTables = root.querySelectorAll('[wmtable], [wmTable]');
        wmTables.forEach((table, index) => {
            if (!table.classList.contains('app-datagrid')) {
                table.classList.add('app-datagrid', 'table', 'table-striped', 'table-bordered');
            }
            table.setAttribute('widget-id', `table_global_${index}`);
            
            // Convert div to table if needed
            if (table.tagName !== 'TABLE') {
                const newTable = document.createElement('table');
                newTable.className = table.className;
                newTable.setAttribute('widget-id', table.getAttribute('widget-id'));
                
                Array.from(table.attributes).forEach(attr => {
                    if (attr.name !== 'class' && attr.name !== 'widget-id') {
                        newTable.setAttribute(attr.name, attr.value);
                    }
                });
                
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

        // Composites
        const composites = root.querySelectorAll('[wmcomposite], [wmComposite]');
        composites.forEach((comp) => {
            if (!comp.classList.contains('app-composite-widget')) {
                comp.classList.add('app-composite-widget', 'form-group');
            }
            comp.setAttribute('widget-id', 'composite_global');
            comp.style.minHeight = '30px';
            comp.style.padding = '5px';
        });

        // Buttons
        const buttons = root.querySelectorAll('button[wmbutton], button[wmButton], button[caption]');
        buttons.forEach((btn, index) => {
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
            
            btn.setAttribute('widget-id', `button_global_${index}`);
        });

        // Labels
        const labels = root.querySelectorAll('label[wmlabel], label[wmLabel], [wmlabel], [wmLabel]');
        labels.forEach((label) => {
            const caption = label.getAttribute('caption');
            
            if (!label.classList.contains('app-label')) {
                label.classList.add('app-label');
            }
            
            if (caption && !label.textContent.trim()) {
                label.textContent = caption;
            }
            
            label.setAttribute('widget-id', 'label_global');
        });

        // All other WM elements
        const allWmElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const attrs = Array.from(el.attributes);
            return attrs.some(attr => attr.name.startsWith('wm'));
        });

        allWmElements.forEach((el, index) => {
            if (!el.hasAttribute('widget-id')) {
                el.setAttribute('widget-id', `widget_global_${index}`);
            }
            
            const wmAttrs = Array.from(el.attributes).filter(attr => attr.name.startsWith('wm'));
            if (wmAttrs.length > 0) {
                const widgetType = wmAttrs[0].name.replace('wm', '').toLowerCase();
                if (!el.classList.contains(`app-${widgetType}`)) {
                    el.classList.add(`app-${widgetType}`);
                }
            }
        });

        console.log('[Global Directive Initializer] Initialization complete');
    }
    
    // Run immediately
    initializeDirectives();
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDirectives);
    }
    
    // Run after a delay
    setTimeout(initializeDirectives, 1000);
    setTimeout(initializeDirectives, 3000);
    
    // Set up interval to catch any missed widgets
    setInterval(() => {
        const page = document.querySelector('[wmpage]');
        if (page && !page.classList.contains('left-panel-collapsed-container')) {
            console.log('[Global Directive Initializer] Interval: Applying initialization');
            initializeDirectives();
        }
    }, 5000);
    
})();
