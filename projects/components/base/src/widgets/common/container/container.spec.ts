import { ContainerDirective } from './container.directive';
import { ElementRef, Injector } from '@angular/core';
import { addClass, App } from '@wm/core';
import { styler, APPLY_STYLES_TYPE } from '../../framework/styler';
import { mockApp } from '../../../test/util/component-test-util';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    addClass: jest.fn(),
}));

jest.mock('../../framework/styler', () => ({
    styler: jest.fn(),
    APPLY_STYLES_TYPE: {
        CONTAINER: 'CONTAINER',
    },
}));

describe('ContainerDirective', () => {
    let directive: ContainerDirective;
    let injectorMock: Injector;
    let nativeElementMock: any;
    let elementRefMock: ElementRef;

    beforeEach(() => {
        nativeElementMock = document.createElement('div');
        elementRefMock = { nativeElement: nativeElementMock } as ElementRef;

        injectorMock = {
            get: jest.fn().mockImplementation((token) => {
                if (token === ElementRef) return elementRefMock;

                if (token === App) return mockApp

                return null;
            }),
            _lView: [null, null, null, null, null, null, null, null, { index: 0 }],
            _tNode: {
                attrs: ['attr1', 'value1', 'attr2', 'value2']
            }
        } as any;

        directive = new ContainerDirective(injectorMock);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create the directive instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should call addClass with correct parameters', () => {
        expect(addClass).toHaveBeenCalledWith(nativeElementMock, 'app-container');
    });

    it('should call styler with correct parameters', () => {
        expect(styler).toHaveBeenCalledWith(nativeElementMock, directive, APPLY_STYLES_TYPE.CONTAINER);
    });
});
