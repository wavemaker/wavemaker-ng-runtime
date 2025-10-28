import { isDefined } from '@wm/core';

/**
 * Widget Registry
 */
const registryById = new Map<string, any>();

/**
 * returns the widget by the given widgetId
 */
export const getById = (widgetId: string) => registryById.get(widgetId);


/**
 * Registers the Widget with the given id and name
 * Makes the Widget available with the viewParent
 * returns unRegister method
 */
export const register = (widget: any, viewParent: any, widgetId: string, name?: string): () => void => {
    let registered = false;
    registryById.set(widgetId, widget);
    // DEFENSIVE FIX: Check if viewParent exists (might be null if parent destroyed during initialization)
    if (name && viewParent) {
        if (isDefined(viewParent.Widgets)) {
            registered = true;
            viewParent.Widgets[name] = widget;
        }
    }

    // Unregister method.
    return () => {
        registryById.delete(widgetId);
        // DEFENSIVE FIX: Check if viewParent still exists during cleanup
        if (registered && viewParent && viewParent.Widgets) {
            viewParent.Widgets[name] = undefined;
        }
    };
};

/**
 * Deregisters the oldname in widgets registry and sets new name
 */
export const renameWidget = (viewParent: any, widget: any, nv: string, ov?: string) => {
    // DEFENSIVE FIX: Check if viewParent exists before accessing Widgets
    if (!viewParent || !isDefined(viewParent.Widgets)) {
        return;
    }
    if (ov) {
        viewParent.Widgets[ov] = undefined;
    }
    if (nv) {
        viewParent.Widgets[nv] = widget;
    }
};
