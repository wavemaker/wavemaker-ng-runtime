import { TestBed } from '@angular/core/testing';
import { DialogServiceImpl } from './dialog.service';
import { isMobile, isMobileApp } from '@wm/core';

jest.mock('@wm/core', () => ({
    isMobile: jest.fn(),
    isMobileApp: jest.fn()
}));

describe('DialogServiceImpl', () => {
    let service: DialogServiceImpl;
    let mockBodyElement: HTMLElement;
    let appRoot: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = new DialogServiceImpl();

        // Mocking the DOM for aria-hidden attribute manipulation
        mockBodyElement = document.createElement('body');
        appRoot = document.createElement('app-root');
        appRoot.setAttribute('aria-hidden', 'true');
        mockBodyElement.appendChild(appRoot);
        document.body = mockBodyElement;
        service.getOpenedDialogs().length = 0;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should register a dialog', () => {
        const dialogRef = { open: jest.fn() };
        const scope = { pageName: 'testPage' };

        service.register('testDialog', dialogRef, scope);
        expect(service.getDialogRefsCollection().get('testDialog').get(scope)).toBe(dialogRef);
    });

    it("should not register a dialog when name is not provided", () => {
        const dialogRef = { open: jest.fn() };
        const scope = { pageName: 'testPage' };

        service.register('', dialogRef, scope);
        expect(service.getDialogRefsCollection().get('')).toBeUndefined();
    });

    it("should not de-register a dialog when name is not provided", () => {
        const dialogRef = { open: jest.fn() };
        const scope = { pageName: 'testPage' };
        service.deRegister('', scope);
        expect(service.getDialogRefsCollection().get('')).toBeUndefined();
    })

    it('should de-register a dialog', () => {
        const dialogRef = { open: jest.fn() };
        const scope = { pageName: 'testPage' };

        service.register('testDialog', dialogRef, scope);
        service.deRegister('testDialog', scope);
        expect(service.getDialogRefsCollection().get('testDialog').has(scope)).toBe(false);
    });

    it('should open a dialog', () => {
        const dialogRef = { open: jest.fn() };
        const scope = { pageName: 'testPage' };

        service.register('testDialog', dialogRef, scope);
        service.open('testDialog', scope);

        expect(dialogRef.open).toHaveBeenCalled();
    });

    it("should not open a dialog when dialogRef is undefined it should return nothing", () => {
        const scope = { pageName: 'testPage' };

        service.register('testDialog', undefined, scope);
        expect(service.open('testDialog', scope)).toBeUndefined();
    })

    it('should close a dialog', () => {
        const dialogRef = { close: jest.fn() };
        const scope = { pageName: 'testPage' };

        service.register('testDialog', dialogRef, scope);
        service.close('testDialog', scope);

        expect(dialogRef.close).toHaveBeenCalled();
    });

    it("should not close a dialog when dialogRef is undefined it should return nothing", () => {
        const scope = { pageName: 'testPage' };

        service.register('testDialog', undefined, scope);
        expect(service.close('testDialog', scope)).toBeUndefined();
    })

    it('should close all dialogs', () => {
        const dialogRef1 = { close: jest.fn() };
        const dialogRef2 = { close: jest.fn() };

        service.addToOpenedDialogs(dialogRef1);
        service.addToOpenedDialogs(dialogRef2);

        service.closeAllDialogs();

        expect(dialogRef1.close).toHaveBeenCalled();
        expect(dialogRef2.close).toHaveBeenCalled();
    });

    it('should handle app confirm dialog', () => {
        const dialogRef = { open: jest.fn(), close: jest.fn() };

        service.setAppConfirmDialog('confirmDialog');
        service.register('confirmDialog', dialogRef, {});

        service.showAppConfirmDialog();
        expect(dialogRef.open).toHaveBeenCalled();

        service.closeAppConfirmDialog();
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should add and remove dialogs from openedDialogs', () => {
        const dialogRef = { close: jest.fn() };

        service.addToOpenedDialogs(dialogRef);
        expect(service.getOpenedDialogs()).toContain(dialogRef);

        service.removeFromOpenedDialogs(dialogRef);
        expect(service.getOpenedDialogs()).not.toContain(dialogRef);
    });

    it('should add and remove dialogs from closedDialogs', () => {
        const dialogRef = { close: jest.fn() };

        service.addToClosedDialogs(dialogRef);
        expect(service.getDialogRefFromClosedDialogs()).toBe(dialogRef);

        service.removeFromClosedDialogs(dialogRef);
        expect(service.getDialogRefFromClosedDialogs()).toBeUndefined();
    });

    it('should handle aria-hidden attribute on mobile', () => {
        const dialogRef = { close: jest.fn() };

        isMobile();
        isMobileApp();

        document.body.innerHTML = '<body><app-root></app-root></body>';

        service.addToOpenedDialogs(dialogRef);
        service.removeFromOpenedDialogs(dialogRef);

        expect(document.querySelector('body > app-root')!.getAttribute('aria-hidden')).toBeNull();
    });

    describe('getDialogRef', () => {
        let consoleErrorSpy: jest.SpyInstance;

        beforeEach(() => {
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
        });

        it('should return dialogRef when scope is provided and dialogRef exists', () => {
            const dialogRef = { open: jest.fn() };
            const scope = { pageName: 'testPage' };
            service.register('testDialog', dialogRef, scope);

            const result = service['getDialogRef']('testDialog', scope);

            expect(result).toBe(dialogRef);
        });

        it('should return dialogRef from Common partial when scope is app level and no direct match', () => {
            const commonDialogRef = { open: jest.fn() };
            const commonScope = { partialName: 'Common' };
            const appScope = {};
            service.register('testDialog', commonDialogRef, commonScope);

            const result = service['getDialogRef']('testDialog', appScope);

            expect(result).toBe(commonDialogRef);
        });

        it('should log error when no dialog found in app scope', () => {
            const appScope = {}; // This represents an app-level scope
            const dialogRefMap = new Map();
            dialogRefMap.set({ pageName: 'SomePage' }, { open: jest.fn() }); // Add a non-matching dialog ref

            service['dialogRefsCollection'].set('testDialog', dialogRefMap);

            service['getDialogRef']('testDialog', appScope);

            expect(consoleErrorSpy).toHaveBeenCalledWith('No dialog with the name "testDialog" found in the App scope.');
        });
        it('should log error when no dialog found in given scope', () => {
            const scope = { pageName: 'nonExistentPage' };
            // Initialize the dialogRefsCollection with an empty Map for 'testDialog'
            service['dialogRefsCollection'].set('testDialog', new Map());

            service['getDialogRef']('testDialog', scope);

            expect(consoleErrorSpy).toHaveBeenCalledWith('No dialog with the name "testDialog" found in the given scope.');
        });

        it('should return dialogRef when no scope provided and only one instance exists', () => {
            const dialogRef = { open: jest.fn() };
            const scope = { pageName: 'testPage' };
            service.register('testDialog', dialogRef, scope);

            const result = service['getDialogRef']('testDialog');

            expect(result).toBe(dialogRef);
        });

        it('should log error when no scope provided and multiple instances exist', () => {
            const dialogRef1 = { open: jest.fn() };
            const dialogRef2 = { open: jest.fn() };
            service.register('testDialog', dialogRef1, { pageName: 'page1' });
            service.register('testDialog', dialogRef2, { pageName: 'page2' });

            service['getDialogRef']('testDialog');

            expect(consoleErrorSpy).toHaveBeenCalledWith('There are multiple instances of this dialog name. Please provide the Page/Partial/App instance in which the dialog exists.');
        });
    });

    describe('getLastOpenedDialog', () => {
        it('should return the last opened dialog', () => {
            const dialog1 = { id: 'dialog1' };
            const dialog2 = { id: 'dialog2' };

            service.addToOpenedDialogs(dialog1);
            service.addToOpenedDialogs(dialog2);
            const lastOpenedDialog = service.getLastOpenedDialog();

            expect(lastOpenedDialog).toBe(dialog2); // Should return the last dialog (dialog2)
        });
    });

    describe('removeFromOpenedDialogs', () => {
        it('should remove the dialog reference from openedDialogs', () => {
            // Arrange
            const dialog1 = { id: 'dialog1' };
            const dialog2 = { id: 'dialog2' };

            // Using the service's inbuilt function to add dialogs
            service.addToOpenedDialogs(dialog1);
            service.addToOpenedDialogs(dialog2);

            // Act
            service.removeFromOpenedDialogs(dialog1);

            // Assert
            const openedDialogs = service.getOpenedDialogs(); // Using the service's inbuilt getter
            expect(openedDialogs).toHaveLength(1);
            expect(openedDialogs).toContain(dialog2);
        });

        it('should remove aria-hidden attribute if all dialogs are closed and device is mobile', () => {
            // Arrange
            const dialog1 = { id: 'dialog1' };
            service.addToOpenedDialogs(dialog1);

            (isMobile as jest.Mock).mockReturnValue(true);
            (isMobileApp as jest.Mock).mockReturnValue(false);

            const removeAttributeSpy = jest.spyOn(appRoot, 'removeAttribute');

            // Act
            service.removeFromOpenedDialogs(dialog1); // Removes last dialog

            // Assert
            expect(service.getOpenedDialogs()).toHaveLength(0);
            expect(removeAttributeSpy).toHaveBeenCalledWith('aria-hidden');
        });

        it('should not remove aria-hidden attribute if dialogs are still open', () => {
            // Arrange
            const dialog1 = { id: 'dialog1' };
            const dialog2 = { id: 'dialog2' };

            // Using the service's inbuilt function to add dialogs
            service.addToOpenedDialogs(dialog1);
            service.addToOpenedDialogs(dialog2);

            (isMobile as jest.Mock).mockReturnValue(true);

            const removeAttributeSpy = jest.spyOn(appRoot, 'removeAttribute');

            // Act
            service.removeFromOpenedDialogs(dialog1); // Removes one dialog, but one is still open

            // Assert
            expect(service.getOpenedDialogs()).toHaveLength(1);
            expect(removeAttributeSpy).not.toHaveBeenCalled();
        });

        it('should not remove aria-hidden attribute if not on mobile or mobile app', () => {
            // Arrange
            const dialog1 = { id: 'dialog1' };
            service.addToOpenedDialogs(dialog1);

            (isMobile as jest.Mock).mockReturnValue(false);
            (isMobileApp as jest.Mock).mockReturnValue(false);

            const removeAttributeSpy = jest.spyOn(appRoot, 'removeAttribute');

            // Act
            service.removeFromOpenedDialogs(dialog1); // Removes the last dialog

            // Assert
            expect(removeAttributeSpy).not.toHaveBeenCalled();
        });
    });
});
