import { TestBed } from '@angular/core/testing';
import { DialogServiceImpl } from './dialog.service';
import { isMobile, isMobileApp } from '@wm/core';

jest.mock('@wm/core', () => ({
    isMobile: jest.fn(),
    isMobileApp: jest.fn()
}));

describe('DialogServiceImpl', () => {
    let service: DialogServiceImpl;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = new DialogServiceImpl();
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

    it('should close a dialog', () => {
        const dialogRef = { close: jest.fn() };
        const scope = { pageName: 'testPage' };

        service.register('testDialog', dialogRef, scope);
        service.close('testDialog', scope);

        expect(dialogRef.close).toHaveBeenCalled();
    });

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
});
