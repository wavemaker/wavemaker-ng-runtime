interface SkeletonConfig {
    backgroundColor?: string;
    foregroundColor?: string;
    animationDuration?: number;
    borderRadius?: string;
    spacing?: string;
    itemCount?: number;
    tableRowCount?: number;
    height?: string;
    width?: string;
    shimmerColor?: string;
    chartType?: string;
}
export class WMSkeletonLoader extends HTMLElement {
    private _config: SkeletonConfig;

    private defaultConfig: SkeletonConfig = {
        backgroundColor: '#f9f9f9',
        foregroundColor: '#e0e0e0',
        animationDuration: 1.5,
        borderRadius: '3px',
        spacing: '15px',
        itemCount: 3,
        tableRowCount: 6,
        height: 'auto',
        width: '100%',
        shimmerColor: 'rgba(255, 255, 255, 0.6)'
    };

    static get observedAttributes() {
        return ['widget-type', 'config'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = { ...this.defaultConfig };

        Object.defineProperty(this, 'config', {
            get: () => this._config,
            set: (value) => {
                this._config = { ...this.defaultConfig, ...value };
                this.updateLoader(this.getAttribute('widget-type') || 'default');
            },
            configurable: true,
            enumerable: true
        });
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'config' && newValue) {
            this._config = { ...this._config, ...JSON.parse(newValue) };
            this.updateLoader(this.getAttribute('widget-type') || 'default');
        } else if (name === 'widget-type') {
            this.updateLoader(newValue || 'default');
        }
    }

    connectedCallback() {
        // Parse configuration from attribute if present
        const configAttr = this.getAttribute('config');
        if (configAttr) {
            this._config = { ...this._config, ...JSON.parse(configAttr) };
        }
        this.updateLoader(this.getAttribute('widget-type') || 'default');
    }

    private getStyles(widgetType: string): string {
        const { animationDuration, borderRadius, shimmerColor } = this._config;

        const baseStyles = `
            :host {
                display: block;
                width: ${widgetType === 'app' ? '100%' : this._config.width};
                height: ${widgetType === 'app' ? '100%' : this._config.height};
                contain: content;
                ${widgetType === 'app' ? `
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                    background-color: rgba(255, 255, 255, 0.9);
                ` : ''}
            }
            .skeleton-loader {
                width: 100%;
                border-radius: ${borderRadius};
                overflow: hidden;
                position: relative;
                box-sizing: border-box;
                contain: content;
                ${widgetType === 'app' ? `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                ` : ''}
            }
            .skeleton-animated{
            position:relative;
            overflow: hidden;
            }
            .skeleton-animated::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg, 
                    rgba(255, 255, 255, 0) 0%, 
                    ${shimmerColor} 50%, 
                    rgba(255, 255, 255, 0) 100%
                );
                transform: translateX(-100%);
                animation: loading ${animationDuration}s infinite;
                z-index: 1;
            }
            @keyframes loading {
                100% { transform: translateX(100%); }
            }
    `;

        const typeStyles: { [key: string]: string } = {
            app: this.getAppStyles(),
            list: this.getListStyles(),
            table: this.getTableStyles(),
            chart: this.getChartStyles(),
            form: this.getFormStyles(),
            card: this.getCardStyles(),
            tabs: this.getTabStyles(),
            accordion: this.getAccordionStyles(),
            default: this.getDefaultStyles()
        };

        return `${baseStyles}${typeStyles[widgetType] || typeStyles.default}`;
    }

    private getCardStyles(): string {
        return `
            .card-loader {
                background-color: ${this._config.backgroundColor};
                padding: 0;
                display: flex;
                gap: ${this._config.spacing};
            }
            .card-column {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: ${this._config.spacing};
                background-color: ${this._config.backgroundColor};
                padding: 0;
                border-radius: ${this._config.borderRadius};
            }
            ${this.getListStyles()}
        `;
    }

    private getListStyles(): string {
        return `
            .list-loader {
                background-color: ${this._config.backgroundColor};
                padding: ${this._config.spacing};
                display: flex;
                flex-direction: column;
                gap: ${this._config.spacing};
            }
            .list-item {
                display: flex;
                padding: ${this._config.spacing} 0;
                border-bottom: 1px solid ${this._config.foregroundColor};
            }
            .list-item-avatar {
                width: 50px;
                height: 50px;
                background-color: ${this._config.foregroundColor};
                border-radius: 50%;
                margin-right: ${this._config.spacing};
            }
            .list-item-content {
                flex: 1;
            }
            .list-item-title {
                height: 15px;
                width: 70%;
                background-color: ${this._config.foregroundColor};
                margin-bottom: 10px;
                border-radius: ${this._config.borderRadius};
            }
            .list-item-subtitle {
                height: 15px;
                width: 50%;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
                margin-top:10px;
            }
        `;
    }

    private getTableStyles(): string {
        return `
            .table-loader {
                border-radius: ${this._config.borderRadius};
                overflow: hidden;
            }
            .table-header {
                display: flex;
                margin-bottom: 10px;
                gap: ${this._config.spacing};
                background-color: ${this._config.backgroundColor};
                border-radius: ${this._config.borderRadius};
                padding: ${this._config.spacing};
            }
            .table-header-cell {
                flex: 1;
                height: 15px;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
            .table-row {
                display: flex;
                gap: ${this._config.spacing};
                border-radius: ${this._config.borderRadius};
                padding: ${this._config.spacing};
            }
            .table-row:hover {
                background-color: ${this._config.shimmerColor};
            }
            .table-cell {
                flex: 1;
                height: 15px;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
        `;
    }

    private getChartStyles(): string {
        return `
            .chart-loader {
                padding: ${this._config.spacing};
                border-radius: ${this._config.borderRadius};
                position: relative;
                overflow: hidden;
            }
    
            .chart-area {
                height: 150px; 
                position: relative;
            }
    
            /* Column Chart */
            .column-loader .chart-data {
                display: flex;
                gap: 150px;
                align-items: flex-end;
                height: 100%;
            }
    
            .column-loader .column {
                width: 40px;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius} ${this._config.borderRadius} 0 0;
                height:150px;
            }
    
            /* Bar Chart */
            .bar-loader .chart-data {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
    
            .bar-loader .bar {
                height: 18px;
                background-color: ${this._config.foregroundColor};
                border-radius: 3px;
                width: 80%;
                margin-top: 10px;
            }
    
            /* Line/Area Charts */
           .line-loader .chart-data,
            .area-loader .chart-data {
                position: relative;
                height: 100%;
            }

            .line-loader .line {
                    width: 100%;
                    height: 160px;
                    position: relative;
                    top: 0px;
                    border: 1px solid ${this._config.foregroundColor};
                    border-top: none;
                    border-right: none;
            }
           .line-loader .line .line-segment{
                  width: 100%;
                  height: 3px;
                  background-color: ${this._config.foregroundColor};
                  position: absolute;
                  top: 82px;
                  left: -50px;
                  transform: rotate(173deg);

           }
         .line-loader .bubble {
                position: absolute;
                bottom: 20%;
                left: 0;
                right: 0;
                height: 4px;
            }
            .line-loader .point {
                position: absolute;
                width: 12px;
                height: 12px;
                background-color: ${this._config.foregroundColor};
                border-radius: 50%;
                animation: pointMove 2s infinite ease-in-out;
                box-shadow: 0 0 5px ${this._config.foregroundColor};
            }

            .area-loader .area {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 70%;
                background: linear-gradient(to bottom, 
                    ${this._config.foregroundColor}, 
                    ${this._config.foregroundColor}10
                );
                clip-path: polygon(
                    0 100%, 
                    0 calc(30% + var(--wave-offset, 0%)), 
                    20% calc(45% + var(--wave-offset, 0%)), 
                    40% calc(20% + var(--wave-offset, 0%)), 
                    60% calc(40% + var(--wave-offset, 0%)), 
                    80% calc(25% + var(--wave-offset, 0%)), 
                    100% calc(35% + var(--wave-offset, 0%)), 
                    100% 100%
                );
            }
        
            /* Pie/Donut Charts */
            .pie-loader .chart-area,
            .donut-loader .chart-area {
                height: 100%;
                display: flex; 
                justify-content: center;
            }

            .pie-loader .pie-segment {
                width: 150px;
                height: 150px;
                background-color: ${this._config.foregroundColor};
                border-radius: 50%;
            }

            .donut-loader .donut-segment {
                width: 150px;
                height: 150px;
                background-color: ${this._config.foregroundColor};
                border-radius: 50%;
                position: relative;
            }
                .donut-loader .donut-segment .donut-inside{
                width: 100px;
                height: 100px;
                background-color: #fff;
                border-radius: 50%;
                position: relative;
                left: 25px;
                top: 25px;
            }
    
            /* Animations */
            @keyframes columnGrow {
                0%, 100% { height: 30%; }
                50% { height: 70%; }
            }
    
            @keyframes barGrow {
                0%, 100% { width: 30%; }
                50% { width: 70%; }
            }

            @keyframes rotateLoader {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes lineWave {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(20px); }
            }

            @keyframes pointMove {
                0% { left: 0; bottom: 20%; }
                25% { left: 25%; bottom: 40%; }
                50% { left: 50%; bottom: 20%; }
                75% { left: 75%; bottom: 40%; }
                100% { left: 100%; bottom: 20%; }
            }

            @keyframes areaWave {
                0%, 100% { --wave-offset: 0%; }
                50% { --wave-offset: 15%; }
            }
        `;
    }

    private getFormStyles(): string {
        return `
            .form-loader {
                display: flex;
                flex-direction: column;
                gap: ${this._config.spacing};
                padding: ${this._config.spacing};
                background-color: ${this._config.backgroundColor};
                border-radius: ${this._config.borderRadius};
            }
            .form-field {
                height: 40px;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
                position: relative;
                margin-bottom: ${this._config.spacing};
            }
            .form-label {
                position: absolute;
                top: -20px;
                left: 0;
                width: 30%;
                height: 15px;
                background-color: ${this._config.shimmerColor};
                border-radius: ${this._config.borderRadius};
            }
            .form-section {
                margin-bottom: 20px;
                font-size: 14px;
                font-weight: bold;
                color: ${this._config.foregroundColor};
            }
        `;
    }

    private getAccordionStyles(): string {
        return `
            .accordion-loader {
                display: flex;
                flex-direction: column;
                background-color: ${this._config.backgroundColor};
                border: 1px solid ${this._config.foregroundColor}20;
                border-radius: ${this._config.borderRadius};
            }
    
            .accordion-item {
                border-bottom: 1px solid ${this._config.foregroundColor}20;
            }
    
            .accordion-item:last-child {
                border-bottom: none;
            }
    
            .accordion-header {
                display: flex;
                align-items: center;
                padding: 16px ${this._config.spacing};
                position: relative;
                cursor: wait;
            }
    
            /* Chevron indicator for expand/collapse */
            .accordion-chevron {
                width: 20px;
                height: 20px;
                position: relative;
                margin-right: 12px;
                flex-shrink: 0;
            }
    
            .accordion-chevron::before,
            .accordion-chevron::after {
                content: '';
                position: absolute;
                background-color: ${this._config.foregroundColor};
                border-radius: 2px;
                transform-origin: center;
            }
    
            .accordion-chevron::before {
                width: 2px;
                height: 10px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
    
            .accordion-chevron::after {
                width: 10px;
                height: 2px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
    
            .accordion-item.expanded .accordion-chevron::before {
                opacity: 0;
            }
    
            .accordion-title-block {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
    
            .accordion-title {
                height: 18px;
                width: 60%;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
    
            .accordion-subtitle {
                height: 14px;
                width: 40%;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
                opacity: 0.7;
            }
    
            /* Badge indicator */
            .accordion-badge {
                width: 32px;
                height: 20px;
                background-color: ${this._config.foregroundColor};
                border-radius: 10px;
                margin-left: 12px;
                flex-shrink: 0;
            }
    
            /* Content panel */
            .accordion-content {
                overflow: hidden;
                padding: 0 ${this._config.spacing} 16px 48px;
                border-top: 1px solid ${this._config.foregroundColor};
                margin-top: -1px;
            }
    
            /* Nested content structure */
            .content-block {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding-top: 16px;
            }
    
            .content-section {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
    
            .content-heading {
                height: 15px;
                width: 30%;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
    
            .content-line {
                height: 15px;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
    
            .content-line-full { width: 100%; }
            .content-line-long { width: 90%; }
            .content-line-medium { width: 75%; }
            .content-line-short { width: 60%; }
    
            /* Interactive states */
            .accordion-header:hover {
                background-color: ${this._config.foregroundColor}05;
            }
    
            .accordion-item.expanded .accordion-header {
                background-color: ${this._config.foregroundColor}08;
            }
    
            /* Shimmer animation applied selectively */
            .skeleton-animated {
                position: relative;
                overflow: hidden;
            }
        `;
    }

    private getDefaultStyles(): string {
        return `
            .default-loader {
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: ${this._config.backgroundColor};
                padding: ${this._config.spacing};
                border-radius: ${this._config.borderRadius};
                animation: pulse 1.5s infinite ease-in-out;
            }
            .default-loader-item {
                height: 80px;
                width: 80px;
                background-color: ${this._config.foregroundColor};
                border-radius: 50%;
            }
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
            }
        `;
    }

    private getTabStyles(): string {
        return `
        .tabs-loader {
            display: flex;
            flex-direction: column;
            background-color: ${this._config.backgroundColor};
            border-radius: ${this._config.borderRadius};
            overflow: hidden;
        }
        .tabs-header {
            display: flex;
            gap: 50px;
            padding: ${this._config.spacing};
            border-bottom: 1px solid ${this._config.foregroundColor};
            background-color: ${this._config.backgroundColor};
        }
        .tab-item {
            height: 25px;
            padding: 0 20px;
            background-color: ${this._config.foregroundColor};
            border-radius: ${this._config.borderRadius};
            position: relative;
        }
        .tab-item.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: ${this._config.shimmerColor};
        }
        .tab-content {
            padding: ${this._config.spacing};
        }
        .tab-panel {
            display: flex;
            flex-direction: column;
            gap: ${this._config.spacing};
        }
        .content-line {
            height: 15px;
            background-color: ${this._config.foregroundColor};
            border-radius: ${this._config.borderRadius};
        }
        .content-line:nth-child(2) {
            width: 85%;
        }
        .content-line:nth-child(3) {
            width: 70%;
        }
    `;
    }

    private getAppStyles(): string {
        return `
            .app-loader {
                display: grid;
                grid-template-areas: 
                    "header header"
                    "nav main"
                    "footer footer";
                grid-template-columns: 250px 1fr;
                grid-template-rows: 60px 1fr 50px;
                gap: ${this._config.spacing};
                padding: ${this._config.spacing};
                background-color: transparent;
            }
            
            .header {
                grid-area: header;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
                display: flex;
                align-items: center;
                padding: ${this._config.spacing};
            }
            
            .nav {
                grid-area: nav;
                border-radius: ${this._config.borderRadius};
                padding: ${this._config.spacing};
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .nav-item {
                height: 20px;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
            
            .main {
                grid-area: main;
                border-radius: ${this._config.borderRadius};
                padding: ${this._config.spacing};
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: ${this._config.spacing};
            }
            
            .content-block {
                height: 150px;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
            
            .footer {
                grid-area: footer;
                background-color: ${this._config.foregroundColor};
                border-radius: ${this._config.borderRadius};
            }
        `;
    }

    private createLoaderContent(widgetType: string): HTMLElement {
        const loaderContent = document.createElement('div');
        loaderContent.className = `skeleton-loader  ${widgetType}-loader`;

        const creators: { [key: string]: () => void } = {
            app: () => this.createAppContent(loaderContent),
            list: () => this.createListContent(loaderContent, widgetType),
            table: () => this.createTableContent(loaderContent),
            chart: () => this.createChartContent(loaderContent, this._config.chartType?.toLowerCase()),
            form: () => this.createFormContent(loaderContent),
            card: () => this.createCardContent(loaderContent, widgetType),
            tabs: () => this.createTabsContent(loaderContent),
            accordion: () => this.createAccordionContent(loaderContent),
            default: () => this.createDefaultContent(loaderContent)
        };

        (creators[widgetType] || creators.default)();
        return loaderContent;
    }

    private createAppContent(container: HTMLElement): void {
        const header = document.createElement('div');
        header.className = 'header skeleton-animated';

        const nav = document.createElement('div');
        nav.className = 'nav skeleton-animated';

        // Create nav items
        for (let i = 0; i < 6; i++) {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item skeleton-animated';
            nav.appendChild(navItem);
        }

        const main = document.createElement('div');
        main.className = 'main skeleton-animated';

        // Create content blocks
        for (let i = 0; i < 6; i++) {
            const contentBlock = document.createElement('div');
            contentBlock.className = 'content-block skeleton-animated';
            main.appendChild(contentBlock);
        }

        const footer = document.createElement('div');
        footer.className = 'footer skeleton-animated';

        container.appendChild(header);
        container.appendChild(nav);
        container.appendChild(main);
        container.appendChild(footer);
    }

    private createTabsContent(container: HTMLElement): void {
        // Create tabs header
        const header = document.createElement('div');
        header.className = 'tabs-header';

        // Create tab items (the number is determined by itemCount or defaults to 3)
        const tabCount = Math.min(this._config.itemCount || 3, 5); // Limit to maximum 5 tabs
        for (let i = 0; i < tabCount; i++) {
            const tab = document.createElement('div');
            tab.className = `tab-item skeleton-animated ${i === 0 ? 'active' : ''}`;
            header.appendChild(tab);
        }

        // Create tab content area
        const content = document.createElement('div');
        content.className = 'tab-content';

        // Create active tab panel with content
        const panel = document.createElement('div');
        panel.className = 'tab-panel';

        // Add content lines to simulate text content
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'content-line skeleton-animated';
            panel.appendChild(line);
        }

        content.appendChild(panel);
        container.appendChild(header);
        container.appendChild(content);
    }

    private createCardContent(container: HTMLElement, widget: string): void {
        container.className = 'card-loader';

        const leftColumn = document.createElement('div');
        leftColumn.className = 'card-column';
        const rightColumn = document.createElement('div');
        rightColumn.className = 'card-column';

        const leftList = document.createElement('div');
        leftList.className = 'list-loader';
        const rightList = document.createElement('div');
        rightList.className = 'list-loader';

        this.createListContent(leftList, widget);
        this.createListContent(rightList, widget);

        leftColumn.appendChild(leftList);
        rightColumn.appendChild(rightList);

        container.appendChild(leftColumn);
        container.appendChild(rightColumn);
    }

    private createListContent(container: HTMLElement, widget: string): void {
        const count = widget === 'card' ? 2 : 3;
        for (let i = 0; i < count; i++) {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            const avatar = document.createElement('div');
            avatar.className = 'list-item-avatar skeleton-animated';

            const content = document.createElement('div');
            content.className = 'list-item-content';

            const title = document.createElement('div');
            title.className = 'list-item-title skeleton-animated';
            content.appendChild(title);

            if (widget === 'card') {
                for (let j = 0; j < 3; j++) {
                    const subtitle = document.createElement('div');
                    subtitle.className = 'list-item-subtitle skeleton-animated';
                    content.appendChild(subtitle);
                }
            } else {
                const subtitle = document.createElement('div');
                subtitle.className = 'list-item-subtitle skeleton-animated';
                content.appendChild(subtitle);
            }

            listItem.appendChild(avatar);
            listItem.appendChild(content);
            container.appendChild(listItem);
        }
    }
    private createTableContent(container: HTMLElement): void {
        const header = document.createElement('div');
        header.className = 'table-header';

        for (let i = 0; i < 6; i++) {
            const headerCell = document.createElement('div');
            headerCell.className = 'table-header-cell skeleton-animated';
            header.appendChild(headerCell);
        }
        container.appendChild(header);

        for (let i = 0; i < this._config.tableRowCount; i++) {
            const row = document.createElement('div');
            row.className = 'table-row';

            for (let j = 0; j < 6; j++) {
                const cell = document.createElement('div');
                cell.className = 'table-cell skeleton-animated';
                row.appendChild(cell);
            }
            container.appendChild(row);
        }
    }

    private createChartContent(container: HTMLElement, type: string): void {
        container.className = `chart-loader ${type}-loader`;

        // Create chart area
        const chartArea = document.createElement('div');
        chartArea.className = 'chart-area';

        // Create chart data container
        const chartData = document.createElement('div');
        chartData.className = 'chart-data';

        switch (type) {
            case 'column':
                for (let i = 0; i < 5; i++) {
                    const column = document.createElement('div');
                    column.className = 'column skeleton-animated';
                    column.style.animationDelay = `${i * 0.2}s`;
                    chartData.appendChild(column);
                }
                break;

            case 'bar':
                for (let i = 0; i < 5; i++) {
                    const bar = document.createElement('div');
                    bar.className = 'bar skeleton-animated';
                    // bar.style.animationDelay = `${i * 0.2}s`;
                    chartData.appendChild(bar);
                }
                break;

            case 'line': {
                const line = document.createElement('div');
                line.className = 'line skeleton-animated';
                // for (let i = 0; i < 5; i++) {
                //     const point = document.createElement('div');
                //     point.className = 'point skeleton-animated';
                //     point.style.animationDelay = `${i * 0.4}s`;
                //     chartData.appendChild(point);
                // }
                chartData.appendChild(line);
                const lineSegment = document.createElement('div');
                lineSegment.className = 'line-segment';
                line.appendChild(lineSegment);
                break;
            }
            case 'bubble': {
                const bubble = document.createElement('div');
                bubble.className = 'bubble skeleton-animated';
                for (let i = 0; i < 5; i++) {
                    const point = document.createElement('div');
                    point.className = 'point skeleton-animated';
                    chartData.appendChild(point);
                }
                chartData.appendChild(bubble);
                break;
            }

            case 'area': {
                const area = document.createElement('div');
                area.className = 'area skeleton-animated';
                chartData.appendChild(area);
                break;
            }

            case 'pie':
                {
                    const pieSegment = document.createElement('div');
                    pieSegment.className = 'pie-segment skeleton-animated';
                    chartData.appendChild(pieSegment);
                }
                break;

            case 'donut':
                {
                    const donutSegment = document.createElement('div');
                    donutSegment.className = 'donut-segment skeleton-animated';
                    chartData.appendChild(donutSegment);
                    const donutInside =  document.createElement('div');
                    donutInside.className = 'donut-inside';
                    donutSegment.appendChild(donutInside);

                }
                break;
        }

        chartArea.appendChild(chartData);
        container.appendChild(chartArea);
    }

    private createFormContent(container: HTMLElement): void {
        for (let i = 0; i < this._config.itemCount; i++) {
            const field = document.createElement('div');
            field.className = 'form-field skeleton-animated';

            const label = document.createElement('div');
            label.className = 'form-label skeleton-animated';

            field.appendChild(label);
            container.appendChild(field);
        }
    }

    private createAccordionContent(container: HTMLElement): void {
        const itemCount = Math.min(this._config.itemCount || 4, 8);

        for (let i = 0; i < itemCount; i++) {
            const accordionItem = document.createElement('div');
            accordionItem.className = `accordion-item ${i === 0 ? 'expanded' : ''}`;

            // Create header
            const header = document.createElement('div');
            header.className = 'accordion-header';

            // Add chevron indicator
            // const chevron = document.createElement('div');
            // chevron.className = 'accordion-chevron';

            // Create title block with title and subtitle
            const titleBlock = document.createElement('div');
            titleBlock.className = 'accordion-title-block';

            const title = document.createElement('div');
            title.className = 'accordion-title skeleton-animated';

            // const subtitle = document.createElement('div');
            // subtitle.className = 'accordion-subtitle skeleton-animated';

            titleBlock.appendChild(title);
            // titleBlock.appendChild(subtitle);

            // Add badge indicator
            const badge = document.createElement('div');
            badge.className = 'accordion-badge skeleton-animated';

            // Assemble header
            // header.appendChild(chevron);
            header.appendChild(titleBlock);
            header.appendChild(badge);
            accordionItem.appendChild(header);

            // Create expanded content for first item
            if (i === 0) {
                const content = document.createElement('div');
                content.className = 'accordion-content';

                const contentBlock = document.createElement('div');
                contentBlock.className = 'content-block';

                // Create two content sections
                for (let j = 0; j < 1; j++) {
                    const section = document.createElement('div');
                    section.className = 'content-section';

                    const heading = document.createElement('div');
                    // heading.className = 'content-heading skeleton-animated';
                    // section.appendChild(heading);

                    // Add content lines with varying widths
                    const lineClasses = ['full', 'long', 'medium'];
                    lineClasses.forEach(width => {
                        const line = document.createElement('div');
                        line.className = `content-line content-line-${width} skeleton-animated`;
                        section.appendChild(line);
                    });

                    contentBlock.appendChild(section);
                }

                content.appendChild(contentBlock);
                accordionItem.appendChild(content);
            }

            container.appendChild(accordionItem);
        }
    }

    private createDefaultContent(container: HTMLElement): void {
        const item = document.createElement('div');
        item.className = 'default-loader-item skeleton-animated';
        container.appendChild(item);
    }

    private updateLoader(widgetType: string): void {
        const style = document.createElement('style');
        style.textContent = this.getStyles(widgetType);

        const content = this.createLoaderContent(widgetType);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(content);
    }
}

customElements.define('wm-skeleton-loader', WMSkeletonLoader);