// Define interface for loader configuration
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

    // Update configuration when attributes change
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

    getStyles(widgetType: string): string {
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
                align-items: center;
                height: 250px;
                background-color: ${this.config.backgroundColor};
                padding: ${this.config.spacing};
                position: relative;
                overflow: hidden;
            }
            .chart-line {
                position: absolute;
                width: 100%;
                height: 2px;
                background-color: ${this.config.foregroundColor};
                transform-origin: left center;
                transition: all 0.3s ease;
            }
            .chart-point {
                width: 10px;
                height: 10px;
                background-color: ${this.config.foregroundColor};
                border-radius: 50%;
                position: absolute;
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

    // First, let's extend the existing code by adding the tabs-specific styling method
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

    // Now add the tab content creation method
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

    createLoaderContent(widgetType: string): HTMLElement {
        const loaderContent = document.createElement('div');
        loaderContent.className = `skeleton-loader skeleton-animated ${widgetType}-loader`;

        const creators: { [key: string]: () => void } = {
            list: () => this.createListContent(loaderContent),
            table: () => this.createTableContent(loaderContent),
            chart: () => this.createChartContent(loaderContent),
            form: () => this.createFormContent(loaderContent),
            card: () => this.createCardContent(loaderContent),
            tabs: () => this.createTabsContent(loaderContent),
            default: () => this.createDefaultContent(loaderContent)
        };

        (creators[widgetType] || creators.default)();
        return loaderContent;
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
        const maxHeight = 200; // Maximum y-coordinate
        const minHeight = 50;  // Minimum y-coordinate
        const pointCount = this.config.itemCount || 5;
        const chartWidth = container.offsetWidth || 250;
        const spacing = chartWidth / (pointCount - 1);

        let previousX = 0;
        let previousY = Math.random() * (maxHeight - minHeight) + minHeight;

        for (let i = 0; i < pointCount; i++) {
            const x = i * spacing;
            const y = Math.random() * (maxHeight - minHeight) + minHeight;

            // Create a line connecting to the previous point
            if (i > 0) {
                const line = document.createElement('div');
                line.className = 'chart-line skeleton-animated';
                const deltaX = x - previousX;
                const deltaY = y - previousY;
                const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
                const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

                line.style.width = `${length}px`;
                line.style.transform = `translate(${previousX}px, ${previousY}px) rotate(${angle}deg)`;
                container.appendChild(line);
            }

            // Create a point
            const point = document.createElement('div');
            point.className = 'chart-point skeleton-animated';
            point.style.left = `${x}px`;
            point.style.bottom = `${y}px`;

            container.appendChild(point);

            // Update previous point
            previousX = x;
            previousY = y;
        }
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

    private createDefaultContent(container: HTMLElement): void {
        const item = document.createElement('div');
        item.className = 'default-loader-item skeleton-animated';
        container.appendChild(item);
    }

    updateLoader(widgetType: string): void {
        const style = document.createElement('style');
        style.textContent = this.getStyles(widgetType);

        const content = this.createLoaderContent(widgetType);

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(content);
    }
}

// Register the custom element
customElements.define('wm-skeleton-loader', WMSkeletonLoader);