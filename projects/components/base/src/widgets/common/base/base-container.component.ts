import {ContentChildren, Directive, Inject, Injector, Optional} from '@angular/core';
import { StylableComponent } from "./stylable.component";
import { RedrawableDirective } from "../redraw/redrawable.directive";
import { IWidgetConfig } from '../../framework/types';
import {includes, pickBy} from "lodash-es";

@Directive()
export abstract class BaseContainerComponent extends StylableComponent {
    // reference to the components which needs a redraw(eg, grid, chart) when the show of this component changes
    @ContentChildren(RedrawableDirective, { descendants: true }) reDrawableComponents;
    public content;
    public Widgets;

    constructor(inj: Injector, WIDGET_CONFIG: IWidgetConfig, explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
    }

    private updateRedrawableComponents(widgets) {
        pickBy(widgets, widget => {
            // check for redrawable widget and whether it is already exist in reDrawableComponents query list or not
            if (widget && widget.nativeElement && widget.nativeElement.hasAttribute('redrawable') && !includes(this.reDrawableComponents._results, widget)) {
                this.reDrawableComponents._results.push(widget);
            }
            if (widget && widget.Widgets) {
                this.updateRedrawableComponents(widget.Widgets);
            }
        });
    }

    private redrawChildren() {
        // If container is bound to partial content, manually updating reDrawableComponents query list.
        if (this.content && this.Widgets) {
            this.updateRedrawableComponents(this.Widgets);
        }
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
        }, 100);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        super.onPropertyChange(key, nv, ov);
        if (key === 'show') {
            if (nv) {
                this.redrawChildren();
            }
        }
    }
}
