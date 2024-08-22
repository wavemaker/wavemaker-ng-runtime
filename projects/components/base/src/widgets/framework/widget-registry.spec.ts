import { getById, register, renameWidget } from './widget-registry';
import { isDefined } from '@wm/core';

jest.mock('@wm/core', () => ({
    isDefined: jest.fn()
}));

describe('Widget Registry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('should return the widget for a given widgetId', () => {
            const widget = { name: 'TestWidget' };
            register(widget, {}, 'test-id');

            expect(getById('test-id')).toBe(widget);
        });

        it('should return undefined for a non-existent widgetId', () => {
            expect(getById('non-existent-id')).toBeUndefined();
        });
    });

    describe('register', () => {
        it('should register a widget and return an unregister function', () => {
            const widget = { name: 'TestWidget' };
            const viewParent = { Widgets: {} };
            (isDefined as jest.Mock).mockReturnValue(true);

            const unregister = register(widget, viewParent, 'test-id', 'TestWidget');

            expect(getById('test-id')).toBe(widget);
            expect(viewParent.Widgets['TestWidget']).toBe(widget);

            unregister();

            expect(getById('test-id')).toBeUndefined();
            expect(viewParent.Widgets['TestWidget']).toBeUndefined();
        });

        it('should not register widget name if viewParent.Widgets is undefined', () => {
            const widget = { name: 'TestWidget' };
            const viewParent = {};
            (isDefined as jest.Mock).mockReturnValue(false);

            register(widget, viewParent, 'test-id', 'TestWidget');

            expect(getById('test-id')).toBe(widget);
            expect(viewParent).not.toHaveProperty('Widgets');
        });

        it('should register widget without name if name is not provided', () => {
            const widget = { name: 'TestWidget' };
            const viewParent = { Widgets: {} };

            register(widget, viewParent, 'test-id');

            expect(getById('test-id')).toBe(widget);
            expect(viewParent.Widgets).toEqual({});
        });
    });

    describe('renameWidget', () => {
        it('should rename a widget', () => {
            const widget = { name: 'TestWidget' };
            const viewParent = { Widgets: { OldName: widget } };
            (isDefined as jest.Mock).mockReturnValue(true);

            renameWidget(viewParent, widget, 'NewName', 'OldName');

            expect(viewParent.Widgets['OldName']).toBeUndefined();
            expect(viewParent.Widgets['NewName']).toBe(widget);
        });

        it('should do nothing if viewParent.Widgets is undefined', () => {
            const widget = { name: 'TestWidget' };
            const viewParent = {};
            (isDefined as jest.Mock).mockReturnValue(false);

            renameWidget(viewParent, widget, 'NewName', 'OldName');

            expect(viewParent).not.toHaveProperty('Widgets');
        });

        it('should remove old name if new name is not provided', () => {
            const widget = { name: 'TestWidget' };
            const viewParent = { Widgets: { OldName: widget } };
            (isDefined as jest.Mock).mockReturnValue(true);

            renameWidget(viewParent, widget, '', 'OldName');

            expect(viewParent.Widgets['OldName']).toBeUndefined();
            expect(viewParent.Widgets).not.toHaveProperty('');
        });
    });
});