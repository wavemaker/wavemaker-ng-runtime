import { SecurityContext } from '@angular/core';
import { WmPipe } from './wm-pipe';
import { CustomPipeManager } from '@wm/core';
import { isFunction } from 'lodash-es';
import { TrustAsPipe } from './trust-as.pipe';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SanitizePipe } from './sanitize.pipe';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    CustomPipeManager: jest.fn()
}));

jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    isFunction: jest.fn()
}));

describe('WmPipe', () => {
    let customPipeManagerMock: jest.Mocked<CustomPipeManager>;

    beforeEach(() => {
        customPipeManagerMock = {
            getCustomPipe: jest.fn(),
        } as unknown as jest.Mocked<CustomPipeManager>;

        (isFunction as unknown as jest.Mock).mockImplementation((func) => typeof func === 'function');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create an instance with a custom pipe', () => {
        const mockPipe = {
            formatter: jest.fn(),
        };
        customPipeManagerMock.getCustomPipe.mockReturnValue(mockPipe);

        const wmPipe = new WmPipe('customPipe', customPipeManagerMock);

        expect(wmPipe['pipeRef']).toBe(mockPipe);
        expect(wmPipe['isCustomPipe']).toBe(true);
        expect(customPipeManagerMock.getCustomPipe).toHaveBeenCalledWith('customPipe');
    });

    describe('customFormatter', () => {
        it('should call the custom formatter and return its result', () => {
            const mockPipe = {
                formatter: jest.fn().mockReturnValue('formatted data'),
            };
            customPipeManagerMock.getCustomPipe.mockReturnValue(mockPipe);

            const wmPipe = new WmPipe('customPipe', customPipeManagerMock);
            const result = wmPipe.customFormatter('input data', ['arg1', 'arg2']);

            expect(result).toBe('formatted data');
            expect(mockPipe.formatter).toHaveBeenCalledWith('arg1', 'arg2');
        });

        it('should return the original data if an error occurs', () => {
            const mockPipe = {
                formatter: jest.fn().mockImplementation(() => {
                    throw new Error('Formatting error');
                }),
            };
            customPipeManagerMock.getCustomPipe.mockReturnValue(mockPipe);

            const wmPipe = new WmPipe('customPipe', customPipeManagerMock);
            const result = wmPipe.customFormatter('input data', ['arg1', 'arg2']);

            expect(result).toBe('input data');
            expect(mockPipe.formatter).toHaveBeenCalledWith('arg1', 'arg2');
        });
    });
});

describe('TrustAsPipe', () => {
    let pipe: TrustAsPipe;
    let domSanitizerMock: jest.Mocked<DomSanitizer>;

    beforeEach(() => {
        domSanitizerMock = {
            bypassSecurityTrustHtml: jest.fn(),
            bypassSecurityTrustStyle: jest.fn(),
            bypassSecurityTrustScript: jest.fn(),
            bypassSecurityTrustUrl: jest.fn(),
            bypassSecurityTrustResourceUrl: jest.fn(),
        } as unknown as jest.Mocked<DomSanitizer>;

        TestBed.configureTestingModule({
            providers: [
                TrustAsPipe,
                { provide: DomSanitizer, useValue: domSanitizerMock }
            ]
        });

        pipe = TestBed.inject(TrustAsPipe);
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return empty string for null or undefined input', () => {
        expect(pipe.transform(null, 'html')).toBe('');
        expect(pipe.transform(undefined, 'html')).toBe('');
    });

    it('should sanitize HTML content', () => {
        const content = '<div>Test</div>';
        pipe.transform(content, 'html');
        expect(domSanitizerMock.bypassSecurityTrustHtml).toHaveBeenCalledWith(content);

        pipe.transform(content, SecurityContext.HTML);
        expect(domSanitizerMock.bypassSecurityTrustHtml).toHaveBeenCalledWith(content);
    });

    it('should sanitize style content', () => {
        const content = 'color: red;';
        pipe.transform(content, 'style');
        expect(domSanitizerMock.bypassSecurityTrustStyle).toHaveBeenCalledWith(content);

        pipe.transform(content, SecurityContext.STYLE);
        expect(domSanitizerMock.bypassSecurityTrustStyle).toHaveBeenCalledWith(content);
    });

    it('should sanitize script content', () => {
        const content = 'alert("Hello")';
        pipe.transform(content, 'script');
        expect(domSanitizerMock.bypassSecurityTrustScript).toHaveBeenCalledWith(content);

        pipe.transform(content, SecurityContext.SCRIPT);
        expect(domSanitizerMock.bypassSecurityTrustScript).toHaveBeenCalledWith(content);
    });

    it('should sanitize URL content', () => {
        const content = 'https://example.com';
        pipe.transform(content, 'url');
        expect(domSanitizerMock.bypassSecurityTrustUrl).toHaveBeenCalledWith(content);

        pipe.transform(content, SecurityContext.URL);
        expect(domSanitizerMock.bypassSecurityTrustUrl).toHaveBeenCalledWith(content);
    });

    it('should sanitize resource URL content', () => {
        const content = 'https://example.com/resource';
        pipe.transform(content, 'resource');
        expect(domSanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(content);

        pipe.transform(content, SecurityContext.RESOURCE_URL);
        expect(domSanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(content);
    });
});

describe('SanitizePipe', () => {
    let pipe: SanitizePipe;
    let domSanitizerMock: jest.Mocked<DomSanitizer>;

    beforeEach(() => {
        domSanitizerMock = {
            sanitize: jest.fn()
        } as unknown as jest.Mocked<DomSanitizer>;

        TestBed.configureTestingModule({
            providers: [
                SanitizePipe,
                { provide: DomSanitizer, useValue: domSanitizerMock }
            ]
        });

        pipe = TestBed.inject(SanitizePipe);
    });

    it('should create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return empty string for null or undefined input', () => {
        expect(pipe.transform(null, 'html')).toBe('');
        expect(pipe.transform(undefined, 'html')).toBe('');
    });

    it('should sanitize HTML content', () => {
        const content = '<div>Test</div>';
        pipe.transform(content, 'html');
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, content);

        pipe.transform(content, SecurityContext.HTML);
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, content);
    });

    it('should sanitize style content', () => {
        const content = 'color: red;';
        pipe.transform(content, 'style');
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.STYLE, content);

        pipe.transform(content, SecurityContext.STYLE);
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.STYLE, content);
    });

    it('should sanitize script content', () => {
        const content = 'alert("Hello")';
        pipe.transform(content, 'script');
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.SCRIPT, content);

        pipe.transform(content, SecurityContext.SCRIPT);
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.SCRIPT, content);
    });

    it('should sanitize URL content', () => {
        const content = 'https://example.com';
        pipe.transform(content, 'url');
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.URL, content);

        pipe.transform(content, SecurityContext.URL);
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.URL, content);
    });

    it('should sanitize resource URL content', () => {
        const content = 'https://example.com/resource';
        pipe.transform(content, 'resource');
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.RESOURCE_URL, content);

        pipe.transform(content, SecurityContext.RESOURCE_URL);
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.RESOURCE_URL, content);
    });

    it('should sanitize with NONE context', () => {
        const content = 'some content';
        pipe.transform(content, 'none');
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.NONE, content);

        pipe.transform(content, SecurityContext.NONE);
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.NONE, content);
    });

    it('should handle SafeValue input', () => {
        const safeValue = {} as any;
        pipe.transform(safeValue, 'html');
        expect(domSanitizerMock.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, safeValue);
    });
});