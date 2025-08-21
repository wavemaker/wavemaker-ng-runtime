import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ContentChildren, Inject, Injector, Optional, OnInit, OnDestroy, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { noop, removeAttr } from '@wm/core';
import {
    APPLY_STYLES_TYPE,
    IWidgetConfig,
    provideAsWidgetRef,
    RedrawableDirective,
    StylableComponent,
    styler,
} from '@wm/components/base';

import { registerProps } from './accordion-pane.props';
import { AccordionDirective } from '../accordion.directive';
import { AccordionWidgetManagerService } from '../accordion-widget-manager.service';

const DEFAULT_CLS = 'app-accordion-panel panel';
const WIDGET_CONFIG: IWidgetConfig = { widgetType: 'wm-accordionpane', hostClass: DEFAULT_CLS };

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'div[wmAccordionPane]',
    templateUrl: './accordion-pane.component.html',
    providers: [
        provideAsWidgetRef(AccordionPaneComponent)
    ],
    exportAs: 'wmAccordionPane'
})
export class AccordionPaneComponent extends StylableComponent implements OnInit, AfterViewInit, OnDestroy {
    static readonly properties = registerProps();

    // Basic accordion pane properties
    public isActive = false;
    public iconclass: string;
    public title: any;
    public subheading: string;
    public badgetype: any;
    public badgevalue: string;
    public smoothscroll: any;
    public tabindex: number;
    public name: string;

    @ContentChildren(RedrawableDirective)
    set redrawableChildren(value: QueryList<RedrawableDirective>) {
        this._redrawableChildren = value;
        this.updateRedrawableChildren();
    }
    get redrawableChildren(): QueryList<RedrawableDirective> {
        return this._redrawableChildren;
    }

    @ViewChildren(RedrawableDirective)
    set redrawableViewChildren(value: QueryList<RedrawableDirective>) {
        this._redrawableViewChildren = value;
        this.updateRedrawableChildren();
    }
    get redrawableViewChildren(): QueryList<RedrawableDirective> {
        return this._redrawableViewChildren;
    }

    private _redrawableChildren: QueryList<RedrawableDirective>;
    private _redrawableViewChildren: QueryList<RedrawableDirective>;
    private _widgetManager: AccordionWidgetManagerService;
    private _paneId: string;
    private _accordionId: string;
    private _wmAccordion: AccordionDirective;

    constructor(
        @Inject(Injector) private injector: Injector,
        @Optional() @Inject(AccordionDirective) wmAccordion: AccordionDirective,
        private cdr: ChangeDetectorRef,
        private elementRef: ElementRef
    ) {
        super(injector, WIDGET_CONFIG);
        this._wmAccordion = wmAccordion;
        this._widgetManager = injector.get(AccordionWidgetManagerService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.generatePaneId();
        this.registerWithWidgetManager();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.initializePaneWidgets();
    }

    ngOnDestroy() {
        this.unregisterFromWidgetManager();
        super.ngOnDestroy();
    }

    /**
     * Expand the accordion pane
     */
    expand(evt?: Event) {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        
        // Initialize child widgets after expansion
        setTimeout(() => {
            this.initializeChildWidgets();
        }, 100);
        
        this.invokeEventCallback('expand', { $event: evt });
    }

    /**
     * Collapse the accordion pane
     */
    collapse(evt?: Event) {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.invokeEventCallback('collapse', { $event: evt });
    }

    /**
     * Toggle the accordion pane
     */
    toggle(evt?: Event) {
        if (this.isActive) {
            this.collapse(evt);
        } else {
            this.expand(evt);
        }
    }

    /**
     * Initialize child widgets when accordion pane is expanded
     */
    private initializeChildWidgets() {
        try {
            // Force change detection to ensure all child widgets are rendered
            this.cdr.detectChanges();
            
            // Find and initialize search widgets specifically
            const searchWidgets = this.elementRef.nativeElement.querySelectorAll('[wmSearch]');
            searchWidgets.forEach((searchWidget: any) => {
                if (searchWidget.widget && typeof searchWidget.widget.ngAfterViewInit === 'function') {
                    // Re-trigger afterViewInit for search widgets
                    searchWidget.widget.ngAfterViewInit();
                }
            });

            // Force another change detection cycle
            setTimeout(() => {
                this.cdr.detectChanges();
            }, 50);
        } catch (error) {
            console.warn('Error initializing child widgets in accordion pane:', error);
        }
    }

    /**
     * Remove this pane from the accordion
     */
    remove() {
        if (this._wmAccordion) {
            const paneIndex = (this as any)._wmAccordion.getPaneIndexByRef(this);
            if (this.isActive && this._wmAccordion.panes.length > 1) {
                this === this._wmAccordion.panes.last ? this._wmAccordion.panes.toArray()[paneIndex - 1].expand() : this._wmAccordion.panes.toArray()[paneIndex + 1].expand();
            }
            const availablePanes = this._wmAccordion.panes.toArray();
            availablePanes.splice((this as any)._wmAccordion.getPaneIndexByRef(this), 1);
            this._wmAccordion.panes.reset([...availablePanes]);
        }
        this.nativeElement.remove();
    }

    /**
     * Notify parent accordion about pane state changes
     */
    private notifyParent(isExpand: boolean, evt: Event) {
        if (this._wmAccordion) {
            // Notify the parent accordion about the change
            this._wmAccordion.notifyChange(this, isExpand, evt);
        }
    }

    /**
     * Handle property changes
     */
    onPropertyChange(key, nv, ov) {
        if (key === 'content') {
            if (this.isActive) {
                // Add delay to ensure content is properly loaded
                setTimeout(() => {
                    // Re-initialize widgets after content change
                    setTimeout(() => {
                        this.initializeChildWidgets();
                    }, 100);
                }, 100);
            }
        } else if (key === 'tabindex') {
            return;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    /**
     * Redraw children components when needed
     */
    private redrawChildren() {
        if (this._redrawableChildren && this._redrawableChildren.length) {
            this._redrawableChildren.forEach(component => {
                if (component && typeof component.redraw === 'function') {
                    try {
                        component.redraw();
                    } catch (error) {
                        console.warn('Error redrawing component:', error);
                    }
                }
            });
        }
    }

    /**
     * Update redrawable children with accordion-aware timing
     */
    private updateRedrawableChildren() {
        const children = [...(this._redrawableChildren || []), ...(this._redrawableViewChildren || [])];
        
        // For accordion contexts, delay the update to ensure proper rendering
        setTimeout(() => {
            children.forEach(child => {
                if (child && typeof child.redraw === 'function') {
                    try {
                        child.redraw();
                    } catch (error) {
                        console.warn('Error redrawing child:', error);
                    }
                }
            });
        }, 100);
    }

    /**
     * Generate unique pane ID
     */
    private generatePaneId() {
        this._paneId = `pane-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this._accordionId = this._wmAccordion?.widgetId || 'accordion-default';
    }

    /**
     * Register this pane with the widget manager
     */
    private registerWithWidgetManager() {
        if (this._widgetManager) {
            // Register the pane itself
            this._widgetManager.registerWidget(
                this.widgetId,
                'wm-accordionpane',
                false,
                this._accordionId,
                this._paneId
            );
        }
    }

    /**
     * Unregister from widget manager
     */
    private unregisterFromWidgetManager() {
        if (this._widgetManager) {
            this._widgetManager.unregisterWidget(this.widgetId);
        }
    }

    /**
     * Initialize widgets inside this pane
     */
    private initializePaneWidgets() {
        if (!this._widgetManager) return;

        // Find all child widgets and register them
        const childWidgets = this.elementRef.nativeElement.querySelectorAll('[wmSearch], [wmTable], [wmList], [wmInput], [wmButton]');
        
        childWidgets.forEach((widgetElement: Element, index: number) => {
            const widgetType = this.getWidgetTypeFromElement(widgetElement);
            if (widgetType) {
                const widgetId = widgetElement.getAttribute('data-widget-id') || 
                                widgetElement.getAttribute('id') || 
                                `${widgetType}-${index}`;
                
                this._widgetManager.registerWidget(
                    widgetId,
                    widgetType,
                    true, // This is an accordion child
                    this._accordionId,
                    this._paneId
                );
            }
        });

        // Listen for widget ready events
        this.setupWidgetEventListeners();
    }

    /**
     * Get widget type from element
     */
    private getWidgetTypeFromElement(element: Element): string | null {
        const attributes = element.attributes;
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (attr.name.startsWith('wm') && attr.name !== 'wmAccordionpane') {
                return attr.name.toLowerCase();
            }
        }
        return null;
    }

    /**
     * Setup event listeners for widget initialization
     */
    private setupWidgetEventListeners() {
        // Listen for search widget ready events
        this.elementRef.nativeElement.addEventListener('search-widget-ready', (event: CustomEvent) => {
            const { searchWidget } = event.detail;
            if (this._widgetManager) {
                this._widgetManager.updateWidgetStatus(
                    searchWidget.widgetId || 'search-widget',
                    'ready'
                );
            }
        });

        // Listen for general widget initialization events
        this.elementRef.nativeElement.addEventListener('initialize-widget', (event: CustomEvent) => {
            const { widgetId, widgetType } = event.detail;
            if (this._widgetManager) {
                this._widgetManager.updateWidgetStatus(widgetId, 'initializing');
            }
        });
    }

    /**
     * Get pane ID for external reference
     */
    get paneId(): string {
        return this._paneId;
    }

    /**
     * Get accordion ID for external reference
     */
    get accordionId(): string {
        return this._accordionId;
    }

    /**
     * Check if all widgets in this pane are ready
     */
    areWidgetsReady(): boolean {
        if (!this._widgetManager) return true;
        return this._widgetManager.arePaneWidgetsReady(this._accordionId, this._paneId);
    }

    /**
     * Force reinitialization of all widgets in this pane
     */
    reinitializeWidgets() {
        if (!this._widgetManager) return;
        
        // Get current widget status from the service
        const currentStatus = this._widgetManager.getWidgetStatus(this.widgetId);
        if (currentStatus) {
            this._widgetManager.forceReinitializeWidget(this.widgetId);
        }
    }
}
