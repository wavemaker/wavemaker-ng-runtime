import { PipeProvider } from './pipe-provider.service'; // Adjust the path accordingly
import { Compiler, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AbstractI18nService, CustomPipeManager } from '@wm/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { ToDatePipe } from '@wm/components/base';

describe('PipeProvider', () => {
    let pipeProvider: PipeProvider;
    let mockCompiler: Compiler;
    let mockInjector: Injector;
    let mockDomSanitizer: DomSanitizer;
    let mockI18nService: AbstractI18nService;
    let mockCustomPipeManager: any;

    beforeEach(() => {
        mockCompiler = {} as Compiler;
        mockCustomPipeManager = {
            getCustomPipe: jest.fn().mockReturnValue({ formatter: jest.fn() }),
        };
        mockInjector = {
            get: jest.fn((token) => {
                if (token === CustomPipeManager) {
                    return mockCustomPipeManager;
                }
                if (token === AbstractI18nService) {
                    return mockI18nService;
                }
                return null;
            })
        } as any;

        mockDomSanitizer = {} as DomSanitizer;
        mockI18nService = {
            getwidgetLocale: jest.fn().mockReturnValue({}),
        } as any;

        pipeProvider = new PipeProvider(mockCompiler, mockInjector, mockDomSanitizer, mockI18nService);
    });

    describe('constructor', () => {
        it('should initialize _pipeMeta and _pipeData correctly', () => {
            expect(pipeProvider._pipeMeta).toBeDefined();
            expect(pipeProvider._pipeData.length).toBeGreaterThan(0);
        });

        it('should set formatsByLocale using i18service', () => {
            expect(mockI18nService.getwidgetLocale).toHaveBeenCalled();
            expect(pipeProvider.formatsByLocale).toEqual({});
        });

        it('should set default locale if session storage item not present', () => {
            expect(pipeProvider._locale).toEqual('en');
        });
    });

    describe('meta', () => {
        it('should return the pipe metadata for a valid pipe name', () => {
            const meta = pipeProvider.meta('uppercase');
            expect(meta).toBeDefined();
            expect(meta.name).toBe('uppercase');
        });

        it('should throw an error if the pipe name is invalid', () => {
            expect(() => pipeProvider.meta('invalidPipe')).toThrow("The pipe 'invalidPipe' could not be found");
        });
    });

    describe('getPipeNameVsIsPureMap', () => {
        it('should return a map of pipe names and their purity', () => {
            const pureMap = pipeProvider.getPipeNameVsIsPureMap();
            expect(pureMap.get('uppercase')).toBe(true);
            expect(pureMap.get('json')).toBe(false);
        });
    });

    describe('resolveDep', () => {
        it('should resolve a dependency from the injector', () => {
            const mockDep = { token: { identifier: { reference: CustomPipeManager } } };
            const result = pipeProvider.resolveDep(mockDep);
            expect(mockInjector.get).toHaveBeenCalledWith(CustomPipeManager);
            expect(result).toBeDefined();
        });
    });

    describe('getInstance', () => {
        it('should return an instance of the pipe with dependencies', () => {
            const instance = pipeProvider.getInstance('toDate');
            expect(instance).toBeDefined();
            expect(instance).toBeInstanceOf(ToDatePipe); // Now checking for the correct pipe instance (ToDatePipe)
            expect(mockCustomPipeManager.getCustomPipe).toHaveBeenCalled(); // Ensure the mock method was called
        });

        it('should return an instance of the pipe with no dependencies', () => {
            const instance = pipeProvider.getInstance('uppercase');
            expect(instance).toBeInstanceOf(UpperCasePipe);
        });

        it('should throw an error if the pipe name is invalid', () => {
            expect(() => pipeProvider.getInstance('invalidPipe')).toThrow("The pipe 'invalidPipe' could not be found");
        });
    });
});
