interface SkeletonConfig {
    backgroundColor?: string;
    foregroundColor?: string;
    animationDuration?: number;
    borderRadius?: string;
    spacing?: string;
    itemCount?: number;
    height?: string;
    width?: string;
    shimmerColor?: string;
}

export class WMSkeletonLoader extends HTMLElement {
    private config: SkeletonConfig;

    static get observedAttributes() {
        return ['widget-type', 'config'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // Default configuration
        this.config = {
            backgroundColor: '#f9f9f9',
            foregroundColor: '#e0e0e0',
            animationDuration: 1.5,
            borderRadius: '8px',
            spacing: '15px',
            itemCount: 3,
            height: 'auto',
            width: '100%',
            shimmerColor: 'rgba(255, 255, 255, 0.2)'
        };
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'config' && newValue) {
            this.config = { ...this.config, ...JSON.parse(newValue) };
            this.updateLoader(this.getAttribute('widget-type') || 'default');
        } else if (name === 'widget-type') {
            this.updateLoader(newValue || 'default');
        }
    }

    connectedCallback() {
        // Parse configuration from attribute if present
        const configAttr = this.getAttribute('config');
        if (configAttr) {
            this.config = { ...this.config, ...JSON.parse(configAttr) };
        }
        this.updateLoader(this.getAttribute('widget-type') || 'default');
    }

    private getStyles(widgetType: string): string {
        const { animationDuration, borderRadius, shimmerColor } = this.config;

        const baseStyles = `
            :host {
                display: block;
                width: ${this.config.width};
                height: ${this.config.height};
                contain: content;
            }
            .skeleton-loader {
                width: 100%;
                border-radius: ${borderRadius};
                overflow: hidden;
                position: relative;
                box-sizing: border-box;
                contain: content;
            }
            .skeleton-animated::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg, 
                    rgba(255, 255, 255, 0) 0%, 
                    ${shimmerColor} 50%, 
                    rgba(255, 255, 255, 0) 100%
                );
                animation: loading ${animationDuration}s infinite;
                z-index: 1;
            }
            @keyframes loading {
                100% { left: 100%; }
            }
        `;

        const typeStyles: { [key: string]: string } = {
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
                background-color: ${this.config.backgroundColor};
                border-radius: ${this.config.borderRadius};
                padding: ${this.config.spacing};
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                display: grid;
                grid-gap: ${this.config.spacing};
            }
            .card-image {
                width: 100%;
                height: 200px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                margin-bottom: ${this.config.spacing};
            }
            .card-title {
                height: 24px;
                width: 80%;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                margin-bottom: ${this.config.spacing};
            }
            .card-description {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: ${this.config.spacing};
            }
            .card-description-line {
                height: 16px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
            }
            .card-description-line:nth-child(2) {
                width: 90%;
            }
            .card-description-line:nth-child(3) {
                width: 75%;
            }
            .card-footer {
                display: flex;
                gap: ${this.config.spacing};
                margin-top: auto;
            }
            .card-button {
                height: 36px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                flex: 1;
            }
        `;
    }

    private getListStyles(): string {
        return `
            .list-loader {
                background-color: ${this.config.backgroundColor};
                padding: ${this.config.spacing};
                display: flex;
                flex-direction: column;
                gap: ${this.config.spacing};
            }
            .list-item {
                display: flex;
                align-items: center;
                padding: ${this.config.spacing};
                border-bottom: 1px solid ${this.config.foregroundColor};
            }
            .list-item-avatar {
                width: 50px;
                height: 50px;
                background-color: ${this.config.foregroundColor};
                border-radius: 50%;
                margin-right: ${this.config.spacing};
            }
            .list-item-content {
                flex: 1;
            }
            .list-item-title {
                height: 20px;
                width: 70%;
                background-color: ${this.config.foregroundColor};
                margin-bottom: 10px;
                border-radius: ${this.config.borderRadius};
            }
            .list-item-subtitle {
                height: 15px;
                width: 50%;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
            }
        `;
    }

    private getTableStyles(): string {
        return `
            .table-loader {
                background-color: ${this.config.backgroundColor};
                padding: ${this.config.spacing};
                border-radius: ${this.config.borderRadius};
                overflow: hidden;
            }
            .table-header {
                display: flex;
                margin-bottom: ${this.config.spacing};
                gap: ${this.config.spacing};
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                padding: ${this.config.spacing};
            }
            .table-header-cell {
                flex: 1;
                height: 20px;
                background-color: ${this.config.backgroundColor};
                border-radius: ${this.config.borderRadius};
            }
            .table-row {
                display: flex;
                gap: ${this.config.spacing};
                padding: ${this.config.spacing};
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                margin-bottom: ${this.config.spacing};
            }
            .table-row:hover {
                background-color: ${this.config.shimmerColor};
            }
            .table-cell {
                flex: 1;
                height: 15px;
                background-color: ${this.config.backgroundColor};
                border-radius: ${this.config.borderRadius};
            }
        `;
    }

    private getChartStyles(): string {
        return `
            .chart-loader {
                display: flex;
                flex-direction: column;
                height: 300px;
                background-color: ${this.config.backgroundColor};
                padding: ${this.config.spacing};
                border-radius: ${this.config.borderRadius};
                position: relative;
            }
    
            /* Chart title and legend area */
            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
    
            .chart-title {
                width: 150px;
                height: 24px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
            }
    
            .chart-legend {
                display: flex;
                gap: 12px;
            }
    
            .legend-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }
    
            .legend-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: ${this.config.foregroundColor};
            }
    
            .legend-text {
                width: 60px;
                height: 16px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
            }
    
            /* Chart visualization area */
            .chart-visualization {
                flex: 1;
                display: grid;
                grid-template-columns: 50px 1fr;
                grid-template-rows: 1fr 30px;
                gap: 10px;
                padding-top: 20px;
            }
    
            /* Y-axis ticks */
            .y-axis {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding-right: 10px;
            }
    
            .y-tick {
                width: 30px;
                height: 12px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                opacity: 0.6;
            }
    
            /* X-axis ticks */
            .x-axis {
                grid-column: 2;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
    
            .x-tick {
                width: 40px;
                height: 12px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                opacity: 0.6;
            }
    
            /* Chart area with grid lines */
            .chart-area {
                position: relative;
                grid-column: 2;
                border-left: 1px dashed ${this.config.foregroundColor};
                border-bottom: 1px dashed ${this.config.foregroundColor};
            }
    
            .grid-line {
                position: absolute;
                left: 0;
                width: 100%;
                height: 1px;
                background: ${this.config.foregroundColor};
                opacity: 0.1;
            }
    
            /* Animated chart line */
            .chart-line-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
    
            .chart-line {
                position: absolute;
                width: 100%;
                height: 100%;
                fill: none;
                stroke: ${this.config.foregroundColor};
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }
    
            .chart-gradient {
                position: absolute;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    to bottom,
                    ${this.config.foregroundColor}20 0%,
                    transparent 100%
                );
                clip-path: path('');  /* Will be set dynamically */
            }
    
            .chart-point {
                position: absolute;
                width: 8px;
                height: 8px;
                background-color: ${this.config.foregroundColor};
                border-radius: 50%;
                transform: translate(-50%, -50%);
            }
        `;
    }

    private getFormStyles(): string {
        return `
            .form-loader {
                display: flex;
                flex-direction: column;
                gap: ${this.config.spacing};
                padding: ${this.config.spacing};
                background-color: ${this.config.backgroundColor};
                border-radius: ${this.config.borderRadius};
            }
            .form-field {
                height: 40px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                position: relative;
                margin-bottom: ${this.config.spacing};
            }
            .form-label {
                position: absolute;
                top: -20px;
                left: 0;
                width: 30%;
                height: 15px;
                background-color: ${this.config.shimmerColor};
                border-radius: ${this.config.borderRadius};
            }
            .form-section {
                margin-bottom: 20px;
                font-size: 14px;
                font-weight: bold;
                color: ${this.config.foregroundColor};
            }
        `;
    }

    private getAccordionStyles(): string {
        return `
            .accordion-loader {
                display: flex;
                flex-direction: column;
                background-color: ${this.config.backgroundColor};
                border: 1px solid ${this.config.foregroundColor}20;
                border-radius: ${this.config.borderRadius};
            }
    
            .accordion-item {
                border-bottom: 1px solid ${this.config.foregroundColor}20;
            }
    
            .accordion-item:last-child {
                border-bottom: none;
            }
    
            .accordion-header {
                display: flex;
                align-items: center;
                padding: 16px ${this.config.spacing};
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
                background-color: ${this.config.foregroundColor};
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
                height: 20px;
                width: 60%;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
            }
    
            .accordion-subtitle {
                height: 14px;
                width: 40%;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                opacity: 0.7;
            }
    
            /* Badge indicator */
            .accordion-badge {
                width: 32px;
                height: 20px;
                background-color: ${this.config.foregroundColor}30;
                border-radius: 10px;
                margin-left: 12px;
                flex-shrink: 0;
            }
    
            /* Content panel */
            .accordion-content {
                overflow: hidden;
                padding: 0 ${this.config.spacing} 16px 48px;
                border-top: 1px solid ${this.config.foregroundColor}10;
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
                gap: 8px;
            }
    
            .content-heading {
                height: 18px;
                width: 30%;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                opacity: 0.9;
            }
    
            .content-line {
                height: 14px;
                background-color: ${this.config.foregroundColor};
                border-radius: ${this.config.borderRadius};
                opacity: 0.7;
            }
    
            .content-line-full { width: 100%; }
            .content-line-long { width: 90%; }
            .content-line-medium { width: 75%; }
            .content-line-short { width: 60%; }
    
            /* Interactive states */
            .accordion-header:hover {
                background-color: ${this.config.foregroundColor}05;
            }
    
            .accordion-item.expanded .accordion-header {
                background-color: ${this.config.foregroundColor}08;
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
                background-color: ${this.config.backgroundColor};
                padding: ${this.config.spacing};
                border-radius: ${this.config.borderRadius};
                animation: pulse 1.5s infinite ease-in-out;
            }
            .default-loader-item {
                height: 80px;
                width: 80px;
                background-color: ${this.config.foregroundColor};
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
            background-color: ${this.config.backgroundColor};
            border-radius: ${this.config.borderRadius};
            overflow: hidden;
        }
        .tabs-header {
            display: flex;
            gap: ${this.config.spacing};
            padding: ${this.config.spacing};
            border-bottom: 2px solid ${this.config.foregroundColor};
            background-color: ${this.config.backgroundColor};
        }
        .tab-item {
            height: 40px;
            padding: 0 20px;
            background-color: ${this.config.foregroundColor};
            border-radius: ${this.config.borderRadius};
            position: relative;
        }
        .tab-item.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: ${this.config.shimmerColor};
        }
        .tab-content {
            padding: ${this.config.spacing};
        }
        .tab-panel {
            display: flex;
            flex-direction: column;
            gap: ${this.config.spacing};
        }
        .content-line {
            height: 16px;
            background-color: ${this.config.foregroundColor};
            border-radius: ${this.config.borderRadius};
        }
        .content-line:nth-child(2) {
            width: 85%;
        }
        .content-line:nth-child(3) {
            width: 70%;
        }
    `;
    }

    private createLoaderContent(widgetType: string): HTMLElement {
        const loaderContent = document.createElement('div');
        loaderContent.className = `skeleton-loader skeleton-animated ${widgetType}-loader`;

        const creators: { [key: string]: () => void } = {
            list: () => this.createListContent(loaderContent),
            table: () => this.createTableContent(loaderContent),
            chart: () => this.createChartContent(loaderContent),
            form: () => this.createFormContent(loaderContent),
            card: () => this.createCardContent(loaderContent),
            tabs: () => this.createTabsContent(loaderContent),
            accordion: () => this.createAccordionContent(loaderContent),
            default: () => this.createDefaultContent(loaderContent)
        };

        (creators[widgetType] || creators.default)();
        return loaderContent;
    }

    private createTabsContent(container: HTMLElement): void {
        // Create tabs header
        const header = document.createElement('div');
        header.className = 'tabs-header';

        // Create tab items (the number is determined by itemCount or defaults to 3)
        const tabCount = Math.min(this.config.itemCount || 3, 5); // Limit to maximum 5 tabs
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

    private createCardContent(container: HTMLElement): void {
        // Create multiple cards if itemCount is specified
        for (let i = 0; i < this.config.itemCount; i++) {
            const card = document.createElement('div');
            card.className = 'card-loader';

            // Image placeholder
            const image = document.createElement('div');
            image.className = 'card-image skeleton-animated';

            // Title placeholder
            const title = document.createElement('div');
            title.className = 'card-title skeleton-animated';

            // Description lines
            const description = document.createElement('div');
            description.className = 'card-description';

            // Create three lines of varying width for the description
            for (let j = 0; j < 3; j++) {
                const line = document.createElement('div');
                line.className = 'card-description-line skeleton-animated';
                description.appendChild(line);
            }

            // Footer with action buttons
            const footer = document.createElement('div');
            footer.className = 'card-footer';

            const primaryButton = document.createElement('div');
            primaryButton.className = 'card-button skeleton-animated';

            const secondaryButton = document.createElement('div');
            secondaryButton.className = 'card-button skeleton-animated';

            // Assemble the card
            footer.appendChild(primaryButton);
            footer.appendChild(secondaryButton);
            card.appendChild(image);
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(footer);
            container.appendChild(card);
        }
    }

    private createListContent(container: HTMLElement): void {
        for (let i = 0; i < this.config.itemCount; i++) {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            const avatar = document.createElement('div');
            avatar.className = 'list-item-avatar skeleton-animated';

            const content = document.createElement('div');
            content.className = 'list-item-content';

            const title = document.createElement('div');
            title.className = 'list-item-title skeleton-animated';

            const subtitle = document.createElement('div');
            subtitle.className = 'list-item-subtitle skeleton-animated';

            content.appendChild(title);
            content.appendChild(subtitle);
            listItem.appendChild(avatar);
            listItem.appendChild(content);
            container.appendChild(listItem);
        }
    }

    private createTableContent(container: HTMLElement): void {
        const header = document.createElement('div');
        header.className = 'table-header';

        for (let i = 0; i < 3; i++) {
            const headerCell = document.createElement('div');
            headerCell.className = 'table-header-cell skeleton-animated';
            header.appendChild(headerCell);
        }
        container.appendChild(header);

        for (let i = 0; i < this.config.itemCount; i++) {
            const row = document.createElement('div');
            row.className = 'table-row';

            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                cell.className = 'table-cell skeleton-animated';
                row.appendChild(cell);
            }
            container.appendChild(row);
        }
    }

    private createChartContent(container: HTMLElement): void {
        // Create chart header with title and legend
        const header = document.createElement('div');
        header.className = 'chart-header';

        const title = document.createElement('div');
        title.className = 'chart-title skeleton-animated';

        const legend = document.createElement('div');
        legend.className = 'chart-legend';

        // Create two legend items
        for (let i = 0; i < 2; i++) {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';

            const dot = document.createElement('div');
            dot.className = 'legend-dot skeleton-animated';

            const text = document.createElement('div');
            text.className = 'legend-text skeleton-animated';

            legendItem.appendChild(dot);
            legendItem.appendChild(text);
            legend.appendChild(legendItem);
        }

        header.appendChild(title);
        header.appendChild(legend);
        container.appendChild(header);

        // Create chart visualization area
        const visualization = document.createElement('div');
        visualization.className = 'chart-visualization';

        // Create Y-axis
        const yAxis = document.createElement('div');
        yAxis.className = 'y-axis';
        for (let i = 0; i < 5; i++) {
            const tick = document.createElement('div');
            tick.className = 'y-tick skeleton-animated';
            yAxis.appendChild(tick);
        }

        // Create chart area with grid lines
        const chartArea = document.createElement('div');
        chartArea.className = 'chart-area';

        // Add grid lines
        for (let i = 1; i <= 4; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line';
            gridLine.style.top = `${(i * 20)}%`;
            chartArea.appendChild(gridLine);
        }

        // Create animated chart line using SVG for smooth curves
        const lineContainer = document.createElement('div');
        lineContainer.className = 'chart-line-container';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');

        // Helper method to generate smooth curve points
        function generateSmoothCurvePoints(): string {
            const points: [number, number][] = [];
            const pointCount = 6;

            // Generate random points with some constraints to make the curve look natural
            for (let i = 0; i < pointCount; i++) {
                const x = (i / (pointCount - 1)) * 100;
                const y = 30 + Math.random() * 40; // Keep points in middle range for better visual
                points.push([x, y]);
            }

            // Create a smooth curve using cubic bezier
            let path = `M ${points[0][0]} ${points[0][1]}`;

            for (let i = 0; i < points.length - 1; i++) {
                const current = points[i];
                const next = points[i + 1];

                // Calculate control points for smooth curve
                const cp1x = current[0] + (next[0] - current[0]) / 3;
                const cp1y = current[1];
                const cp2x = next[0] - (next[0] - current[0]) / 3;
                const cp2y = next[1];

                path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next[0]} ${next[1]}`;
            }

            return path;
        }

        // Generate smooth curve points
        const points = generateSmoothCurvePoints();
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', points);
        path.setAttribute('class', 'chart-line skeleton-animated');

        svg.appendChild(path);
        lineContainer.appendChild(svg);

        // Add gradient area under the line
        const gradient = document.createElement('div');
        gradient.className = 'chart-gradient';
        gradient.style.clipPath = `path('${points} V 100 H 0 Z')`;
        lineContainer.appendChild(gradient);

        chartArea.appendChild(lineContainer);

        // Create X-axis
        const xAxis = document.createElement('div');
        xAxis.className = 'x-axis';
        for (let i = 0; i < 6; i++) {
            const tick = document.createElement('div');
            tick.className = 'x-tick skeleton-animated';
            xAxis.appendChild(tick);
        }

        // Assemble the visualization
        visualization.appendChild(yAxis);
        visualization.appendChild(chartArea);
        visualization.appendChild(document.createElement('div')); // Empty cell for grid alignment
        visualization.appendChild(xAxis);
        container.appendChild(visualization);
    }

    private createFormContent(container: HTMLElement): void {
        for (let i = 0; i < this.config.itemCount; i++) {
            const field = document.createElement('div');
            field.className = 'form-field skeleton-animated';

            const label = document.createElement('div');
            label.className = 'form-label skeleton-animated';

            field.appendChild(label);
            container.appendChild(field);
        }
    }

    private createAccordionContent(container: HTMLElement): void {
        const itemCount = Math.min(this.config.itemCount || 4, 8);
        
        for (let i = 0; i < itemCount; i++) {
            const accordionItem = document.createElement('div');
            accordionItem.className = `accordion-item ${i === 0 ? 'expanded' : ''}`;
    
            // Create header
            const header = document.createElement('div');
            header.className = 'accordion-header';
    
            // Add chevron indicator
            const chevron = document.createElement('div');
            chevron.className = 'accordion-chevron';
            
            // Create title block with title and subtitle
            const titleBlock = document.createElement('div');
            titleBlock.className = 'accordion-title-block';
            
            const title = document.createElement('div');
            title.className = 'accordion-title skeleton-animated';
            
            const subtitle = document.createElement('div');
            subtitle.className = 'accordion-subtitle skeleton-animated';
            
            titleBlock.appendChild(title);
            titleBlock.appendChild(subtitle);
    
            // Add badge indicator
            const badge = document.createElement('div');
            badge.className = 'accordion-badge skeleton-animated';
    
            // Assemble header
            header.appendChild(chevron);
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
                    heading.className = 'content-heading skeleton-animated';
                    section.appendChild(heading);
    
                    // Add content lines with varying widths
                    const lineClasses = ['full', 'long', 'medium', 'short'];
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