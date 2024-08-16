import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { DialogFooterDirective } from './dialog-footer.directive';
import { provideAsWidgetRef, PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';
import { registerProps } from './dialog-footer.props';

// Mock only the necessary parts
jest.mock('@wm/components/base', () => ({
    ...jest.requireActual('@wm/components/base'),
    BaseComponent: class {
        constructor() { }
    },
    provideAsWidgetRef: jest.fn(),
    register: jest.fn()
}));

describe('DialogFooterDirective', () => {
    let directive: DialogFooterDirective;
    let mockInjector: jest.Mocked<Injector>;

    beforeEach(() => {
        mockInjector = {
            get: jest.fn()
        } as unknown as jest.Mocked<Injector>;

        TestBed.configureTestingModule({
            declarations: [DialogFooterDirective],
            providers: [
                { provide: Injector, useValue: mockInjector },
                { provide: 'EXPLICIT_CONTEXT', useValue: null }
            ]
        });

        directive = new DialogFooterDirective(mockInjector, null);
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should register the correct properties', () => {
        registerProps();

        expect(register).toHaveBeenCalledWith(
            'wm-dialogfooter',
            expect.any(Map)
        );

        const propsMap = (register as jest.Mock).mock.calls[0][1];
        expect(propsMap.get('class')).toBe(PROP_STRING);
        expect(propsMap.get('name')).toBe(PROP_STRING);
        expect(propsMap.get('show')).toEqual({ value: true, ...PROP_BOOLEAN });
    });

    it('should provide itself as a widget ref', () => {
        expect(provideAsWidgetRef).toHaveBeenCalledWith(DialogFooterDirective);
    });

});