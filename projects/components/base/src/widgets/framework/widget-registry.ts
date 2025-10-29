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
    
    // CRITICAL FIX: Don't register widget if viewParent or viewParent.Widgets is null
    // This prevents orphaned widgets that can't be cleaned up
    // Return early cleanup function to prevent memory leaks
    if (!viewParent || !viewParent.Widgets) {
        console.warn(`Widget ${name || widgetId} attempted to register with null ${!viewParent ? 'viewParent' : 'viewParent.Widgets'} - parent was destroyed during async child initialization`);
        return () => {
            registryById.delete(widgetId);
        };
    }
    
    registryById.set(widgetId, widget);
    
    if (name) {
        // Double-check Widgets still exists (might be nulled between checks)
        if (isDefined(viewParent.Widgets) && viewParent.Widgets) {
            registered = true;
            viewParent.Widgets[name] = widget;
        }
    }

    // Unregister method.
    return () => {
        registryById.delete(widgetId);
        // DEFENSIVE FIX: Check if viewParent and Widgets still exist during cleanup
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
