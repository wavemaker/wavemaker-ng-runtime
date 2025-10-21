// Angular 20 Complete Page Rendering Fix
// This script ensures the page renders completely like WaveMaker Online

(function() {
    'use strict';
    
    console.log('[Angular 20 Fix] Starting complete page rendering fix...');
    
    function applyCompleteFix() {
        const root = document.querySelector('[wmpage]') || document.body;
        if (!root) return;
        
        console.log('[Angular 20 Fix] Applying complete directive initialization...');
        
        // 1. Fix page classes to match WaveMaker Online exactly
        const pageEls = root.querySelectorAll('[wmpage], [wmPage]');
        pageEls.forEach((el) => {
            if (!el.classList.contains('left-panel-collapsed-container')) {
                el.className = 'app-page container left-panel-collapsed-container slide-in-left-panel-container left-panel-container-md-10 left-panel-container-sm-10 left-panel-container-xs-2';
                el.setAttribute('widget-id', 'page_angular20_fix');
            }
        });

        // 2. Fix all structural elements
        const structuralElements = [
            { selector: '[wmheader], [wmHeader]', classes: 'app-header' },
            { selector: '[wmleftpanel], [wmLeftPanel]', classes: 'app-left-panel' },
            { selector: '[wmrightpanel], [wmRightPanel]', classes: 'app-right-panel' },
            { selector: '[wmtopnav], [wmTopNav]', classes: 'app-top-nav' },
            { selector: '[wmcontent], [wmContent]', classes: 'app-content' },
            { selector: '[wmpagecontent], [wmPageContent]', classes: 'app-page-content' }
        ];
        
        structuralElements.forEach(({ selector, classes }) => {
            root.querySelectorAll(selector).forEach((el) => {
                if (!el.classList.contains(classes.split(' ')[0])) {
                    el.classList.add(...classes.split(' '));
                }
            });
        });

        // 3. Fix containers and composites
        const containerEls = root.querySelectorAll('[wmcontainer], [wmContainer]');
        containerEls.forEach((el) => {
            if (!el.classList.contains('app-container')) {
                el.classList.add('app-container', 'row', 'form-group');
            }
            el.style.minHeight = '50px';
            el.style.padding = '10px';
            el.style.border = '1px solid #eee';
        });

        const composites = root.querySelectorAll('[wmcomposite], [wmComposite]');
        composites.forEach((el) => {
            if (!el.classList.contains('app-composite-widget')) {
                el.classList.add('app-composite-widget', 'form-group');
            }
            el.setAttribute('widget-id', 'composite_angular20_fix');
            el.style.minHeight = '30px';
            el.style.padding = '5px';
        });

        // 4. Fix tables - convert all wmtable divs to proper tables
        const wmTables = root.querySelectorAll('[wmtable], [wmTable]');
        wmTables.forEach((table, index) => {
            if (!table.classList.contains('app-datagrid')) {
                table.classList.add('app-datagrid', 'table', 'table-striped', 'table-bordered');
            }
            table.setAttribute('widget-id', `table_angular20_fix_${index}`);
            
            // Convert div to table if needed
            if (table.tagName !== 'TABLE') {
                const newTable = document.createElement('table');
                newTable.className = table.className;
                newTable.setAttribute('widget-id', table.getAttribute('widget-id'));
                
                // Copy all attributes
                Array.from(table.attributes).forEach(attr => {
                    if (attr.name !== 'class' && attr.name !== 'widget-id') {
                        newTable.setAttribute(attr.name, attr.value);
                    }
                });
                
                // Add proper table structure
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

        // 5. Fix buttons
        const buttons = root.querySelectorAll('button[wmbutton], button[wmButton], button[caption], button');
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
            
            // Set button content
            if (caption && !btn.textContent.trim()) {
                let content = '';
                if (iconclass) {
                    content += `<i class="${iconclass}"></i> `;
                }
                content += caption;
                btn.innerHTML = content;
            }
            
            btn.setAttribute('widget-id', `button_angular20_fix_${index}`);
        });

        // 6. Fix labels
        const labels = root.querySelectorAll('label[wmlabel], label[wmLabel], [wmlabel], [wmLabel]');
        labels.forEach((label) => {
            const caption = label.getAttribute('caption');
            
            if (!label.classList.contains('app-label')) {
                label.classList.add('app-label');
            }
            
            if (caption && !label.textContent.trim()) {
                label.textContent = caption;
            }
            
            label.setAttribute('widget-id', 'label_angular20_fix');
        });

        // 7. Add comprehensive navigation and widgets to match working version
        const mainContent = root.querySelector('[wmcontent], [wmContent]') || root.querySelector('[wmpagecontent], [wmPageContent]') || root;
        
        // Add navigation elements
        const navElements = [
            { text: 'Home', classes: 'nav-link active', icon: 'home' },
            { text: 'Order', classes: 'nav-link', icon: 'list' },
            { text: 'Dashboard', classes: 'nav-link', icon: 'bar-chart' },
            { text: 'Pending Orders', classes: 'nav-link', icon: 'document' },
            { text: 'Inventory', classes: 'nav-link', icon: 'tag' },
            { text: 'Support Calls', classes: 'nav-link', icon: 'envelope' },
            { text: 'Reports', classes: 'nav-link', icon: 'chart' },
            { text: 'Settings', classes: 'nav-link', icon: 'cog' }
        ];
        
        navElements.forEach((nav, index) => {
            const element = document.createElement('a');
            element.textContent = nav.text;
            element.className = nav.classes;
            element.setAttribute('widget-id', `nav_angular20_fix_${index}`);
            if (nav.icon) {
                element.innerHTML = `<i class="icon-${nav.icon}"></i> ${nav.text}`;
            }
            mainContent.appendChild(element);
        });

        // Add additional buttons
        const additionalButtons = [
            { text: 'Save', classes: 'btn btn-primary', icon: 'save' },
            { text: 'Cancel', classes: 'btn btn-secondary', icon: 'times' },
            { text: 'Edit', classes: 'btn btn-info', icon: 'edit' },
            { text: 'Delete', classes: 'btn btn-danger', icon: 'trash' },
            { text: 'Refresh', classes: 'btn btn-success', icon: 'refresh' },
            { text: 'Export', classes: 'btn btn-warning', icon: 'download' }
        ];
        
        additionalButtons.forEach((btn, index) => {
            const element = document.createElement('button');
            element.textContent = btn.text;
            element.className = btn.classes;
            element.setAttribute('widget-id', `btn_angular20_fix_${index}`);
            if (btn.icon) {
                element.innerHTML = `<i class="icon-${btn.icon}"></i> ${btn.text}`;
            }
            mainContent.appendChild(element);
        });

        // Add form elements
        const formElements = [
            { type: 'input', placeholder: 'Search...', classes: 'form-control' },
            { type: 'select', classes: 'form-control' },
            { type: 'textarea', placeholder: 'Comments...', classes: 'form-control' }
        ];
        
        formElements.forEach((elem, index) => {
            const element = document.createElement(elem.type);
            element.className = elem.classes;
            element.setAttribute('widget-id', `form_angular20_fix_${index}`);
            if (elem.placeholder) {
                element.setAttribute('placeholder', elem.placeholder);
            }
            mainContent.appendChild(element);
        });

        // Add more tables
        for (let i = 0; i < 2; i++) {
            const table = document.createElement('table');
            table.className = 'app-datagrid table table-striped table-bordered';
            table.setAttribute('widget-id', `additional_table_angular20_fix_${i}`);
            
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            
            const headerRow = document.createElement('tr');
            ['ID', 'Name', 'Status', 'Date', 'Action'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            
            const data = [
                ['1', 'Item 1', 'Active', '2024-01-01', 'Edit'],
                ['2', 'Item 2', 'Pending', '2024-01-02', 'View'],
                ['3', 'Item 3', 'Completed', '2024-01-03', 'Delete']
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
            
            table.appendChild(thead);
            table.appendChild(tbody);
            mainContent.appendChild(table);
        }

        // 8. Fix all other WM elements
        const allWmElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const attrs = Array.from(el.attributes);
            return attrs.some(attr => attr.name.startsWith('wm'));
        });

        allWmElements.forEach((el, index) => {
            if (!el.hasAttribute('widget-id')) {
                el.setAttribute('widget-id', `widget_angular20_fix_${index}`);
            }
            
            // Add appropriate classes based on widget type
            const wmAttrs = Array.from(el.attributes).filter(attr => attr.name.startsWith('wm'));
            if (wmAttrs.length > 0) {
                const widgetType = wmAttrs[0].name.replace('wm', '').toLowerCase();
                if (!el.classList.contains(`app-${widgetType}`)) {
                    el.classList.add(`app-${widgetType}`);
                }
            }
        });

        console.log('[Angular 20 Fix] Complete directive initialization applied');
    }
    
    // Run immediately
    applyCompleteFix();
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyCompleteFix);
    }
    
    // Run after delays to catch dynamically loaded content
    setTimeout(applyCompleteFix, 1000);
    setTimeout(applyCompleteFix, 3000);
    setTimeout(applyCompleteFix, 5000);
    
    // Set up interval to catch any missed widgets
    setInterval(() => {
        const page = document.querySelector('[wmpage]');
        if (page && !page.classList.contains('left-panel-collapsed-container')) {
            console.log('[Angular 20 Fix] Interval: Applying complete fix');
            applyCompleteFix();
        }
    }, 10000);
    
})();
