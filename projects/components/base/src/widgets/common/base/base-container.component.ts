import { ContentChildren } from "@angular/core";
import { StylableComponent } from "./stylable.component";
import { RedrawableDirective } from "../redraw/redrawable.directive";

export abstract class BaseContainerComponent extends StylableComponent{
    // reference to the components which needs a redraw(eg, grid, chart) when the show of this component changes
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;
    private redrawChildren() {
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
