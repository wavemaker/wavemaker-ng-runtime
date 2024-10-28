import { TestBed } from '@angular/core/testing';
import { ElementRef, Renderer2 } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DialogBodyDirective } from './dialog-body.directive';
import { DialogRef } from '@wm/components/base';
import { Subject } from 'rxjs';

// Mock the required modules
jest.mock('@wm/core', () => ({
    addClass: jest.fn(),
    setAttr: jest.fn(),
    setCSS: jest.fn()
}));

// Mock FormWidgetType
jest.mock('@wm/components/base', () => ({
    FormWidgetType: {
        SELECT: 'select',
        CHECKBOXSET: 'checkboxset',
        RADIOSET: 'radioset',
        SWITCH: 'switch',
        AUTOCOMPLETE: 'autocomplete',
        CHIPS: 'chips',
        TYPEAHEAD: 'typeahead',
        RATING: 'rating'
    },
    DialogRef: jest.fn()
}));

describe('DialogBodyDirective', () => {
    let directive: DialogBodyDirective;
    let mockElementRef: ElementRef;
    let mockDialogRef: DialogRef<any>;
    let mockBsModalService: jest.Mocked<BsModalService>;
    let mockRenderer: jest.Mocked<Renderer2>;

    beforeEach(() => {
        mockElementRef = {
            nativeElement: document.createElement('div')
        } as ElementRef;

        mockDialogRef = {
            width: '500px',
            height: '300px',
            tabindex: '0',
            name: 'testDialog'
        } as unknown as DialogRef<any>;

        mockBsModalService = {
            onShown: new Subject()
        } as unknown as jest.Mocked<BsModalService>;

        mockRenderer = {
            appendChild: jest.fn(),
            setAttribute: jest.fn(),
            setStyle: jest.fn()
        } as unknown as jest.Mocked<Renderer2>;

        // Mock jQuery
        (global as any).$ = jest.fn(() => ({
            closest: jest.fn().mockReturnValue([{
                style: {},
                setAttribute: jest.fn()
            }])
        }));

        TestBed.configureTestingModule({
            declarations: [DialogBodyDirective],
            providers: [
                { provide: ElementRef, useValue: mockElementRef },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: BsModalService, useValue: mockBsModalService },
                { provide: Renderer2, useValue: mockRenderer }
            ]
        });

        directive = new DialogBodyDirective(mockElementRef, mockDialogRef, mockBsModalService, mockRenderer);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should add default class to element', () => {
        const { addClass } = require('@wm/core');
        expect(addClass).toHaveBeenCalledWith(mockElementRef.nativeElement, 'app-dialog-body modal-body');
    });

    it('should set dialog properties when modal is shown', () => {
        const { setCSS, setAttr } = require('@wm/core');
        mockBsModalService.onShown.next(null);

        expect(setCSS).toHaveBeenCalledWith(expect.anything(), 'width', '500px');
        expect(setAttr).toHaveBeenCalledWith(expect.anything(), 'tabindex', '0');
        expect(setAttr).toHaveBeenCalledWith(expect.anything(), 'name', 'testDialog');
    });

    it('should handle microfrontend scenario', () => {
        const mockDialogBackdrop = document.createElement('div');
        const mockParentContainer = document.createElement('div');
        const mockWmApp = document.createElement('div');

        // Mock the jQuery selections
        (global as any).$ = jest.fn()
            .mockReturnValueOnce({ closest: () => [] }) // for .app-dialog
            .mockReturnValueOnce([undefined]) // for body.wm-app
            .mockReturnValueOnce([mockDialogBackdrop])
            .mockReturnValueOnce([mockParentContainer])
            .mockReturnValueOnce([mockWmApp]);

        mockBsModalService.onShown.next(null);

        expect(mockRenderer.appendChild).toHaveBeenCalledWith(mockWmApp, mockDialogBackdrop);
        expect(mockRenderer.appendChild).toHaveBeenCalledWith(mockWmApp, mockParentContainer);
    });
});