import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScriptLoaderService } from './script-loader.service';
import { _WM_APP_PROJECT } from '../utils/utils';

// Mock _WM_APP_PROJECT with desired values
jest.mock('../utils/utils', () => ({
    _WM_APP_PROJECT: { cdnUrl: 'https://cdn.example.com/', ngDest: '' }
}));

describe('ScriptLoaderService', () => {
    let service: ScriptLoaderService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ScriptLoaderService],
        });

        service = TestBed.inject(ScriptLoaderService);
        httpMock = TestBed.inject(HttpTestingController);

        // Mock specific document methods without redefining the entire document object
        jest.spyOn((document as any), 'createElement').mockImplementation(() => ({
            type: 'text/javascript',
            async: false,
            onreadystatechange: null,
            onload: null as (() => void) | null,
            onerror: null as (() => void) | null,
            src: '',
        }));

        jest.spyOn(document, 'getElementsByTagName').mockReturnValue([{
            appendChild: jest.fn(),
        }] as any);

        // Mock pathMappings to prevent errors
        service['pathMappings'] = {
            'testScript': 'mockPath/testScript.js',
            'https://example.com/script.js': 'https://example.com/script.js'
        };
    });

    afterEach(() => {
        httpMock.verify();
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a new script and load it successfully', async () => {
        // Arrange
        service['scripts'] = {}; // No scripts loaded yet
        const appendChildSpy = jest.spyOn(document.getElementsByTagName('head')[0], 'appendChild');

        const mockScriptElement = {
            type: 'text/javascript',
            async: false,
            src: '',
            onload: jest.fn(),
            onerror: jest.fn(),
        };

        jest.spyOn(document, 'createElement').mockReturnValue(mockScriptElement as any);

        // Act
        const promise = service['loadScript']('testScript');
        mockScriptElement.onload!(); // Simulate successful load
        const result = await promise;

        // Assert
        expect(service['scripts']['testScript']).toBeDefined();
        expect(service['scripts']['testScript'].loaded).toBe(true);
        expect(result).toEqual({ script: 'testScript', loaded: true });
        expect(appendChildSpy).toHaveBeenCalled();
    });

    it('should handle script loading error gracefully', async () => {
        // Arrange
        service['scripts'] = {}; // No scripts loaded yet
        const appendChildSpy = jest.spyOn(document.getElementsByTagName('head')[0], 'appendChild');

        const mockScriptElement = {
            type: 'text/javascript',
            async: false,
            src: '',
            onload: jest.fn(),
            onerror: jest.fn(),
        };

        jest.spyOn(document, 'createElement').mockReturnValue(mockScriptElement as any);

        // Act
        const promise = service['loadScript']('testScript');
        mockScriptElement.onerror!({ message: 'Script load error' }); // Simulate script error
        const result = await promise;

        // Assert
        expect(service['scripts']['testScript']).toBeDefined();
        expect(service['scripts']['testScript'].loaded).toBe(false);
        expect(result).toEqual({ script: 'testScript', loaded: false, status: 'Loaded' });
        expect(appendChildSpy).toHaveBeenCalled();
    });

    it('should resolve with the correct src for non-http scripts', async () => {
        // Arrange
        const cdnUrl = 'https://cdn.example.com/';
        // The _WM_APP_PROJECT mock is already in place
        service['scripts'] = {}; // No scripts loaded yet
        const appendChildSpy = jest.spyOn(document.getElementsByTagName('head')[0], 'appendChild');

        const mockScriptElement = {
            type: 'text/javascript',
            async: false,
            src: '',
            onload: jest.fn(),
            onerror: jest.fn(),
        };

        jest.spyOn(document, 'createElement').mockReturnValue(mockScriptElement as any);

        // Act
        const promise = service['loadScript']('testScript.js');
        mockScriptElement.onload!(); // Simulate successful load
        const result = await promise;

        // Assert
        expect(mockScriptElement.src).toBe(cdnUrl + 'testScript.js');
        expect(result).toEqual({ script: 'testScript.js', loaded: true });
        expect(appendChildSpy).toHaveBeenCalled();
    });

    it('should resolve with the correct src for http scripts', async () => {
        // Arrange
        service['scripts'] = {}; // No scripts loaded yet
        const appendChildSpy = jest.spyOn(document.getElementsByTagName('head')[0], 'appendChild');

        const mockScriptElement = {
            type: 'text/javascript',
            async: false,
            src: '',
            onload: jest.fn(),
            onerror: jest.fn(),
        };

        jest.spyOn(document, 'createElement').mockReturnValue(mockScriptElement as any);

        // Act
        const promise = service['loadScript']('https://example.com/script.js');
        mockScriptElement.onload!(); // Simulate successful load
        const result = await promise;

        // Assert
        expect(mockScriptElement.src).toBe('https://example.com/script.js');
        expect(result).toEqual({ script: 'https://example.com/script.js', loaded: true });
        expect(appendChildSpy).toHaveBeenCalled();
    });

    it('should handle script loading in IE using readyState', async () => {
        // Arrange
        service['scripts'] = {}; // No scripts loaded yet
        const appendChildSpy = jest.spyOn(document.getElementsByTagName('head')[0], 'appendChild');

        // Mock the script element with readyState property (for IE)
        const mockScriptElement = {
            type: 'text/javascript',
            async: false,
            src: '',
            readyState: 'loading', // Start with 'loading'
            onreadystatechange: null as (() => void) | null,
        };

        jest.spyOn(document, 'createElement').mockReturnValue(mockScriptElement as any);
        const promise = service['loadScript']('testScript');

        // Simulate the script loading process in IE
        mockScriptElement.readyState = 'loaded'; // Change the readyState to 'loaded'
        if (mockScriptElement.onreadystatechange) {
            mockScriptElement.onreadystatechange(); // Trigger the onreadystatechange event
        }
        const result = await promise;
        // Assert
        expect(service['scripts']['testScript']).toBeDefined();
        expect(service['scripts']['testScript'].loaded).toBe(true);
        expect(result).toEqual({ script: 'testScript', loaded: true });
        expect(appendChildSpy).toHaveBeenCalled();
    });

    describe('load', () => {
        it('should resolve immediately if no scripts are provided', async () => {
            const result = await service.load();
            expect(result).toBeUndefined();
        });

        it('should load scripts when scripts are provided', async () => {
            // Arrange
            const loadScriptSpy = jest.spyOn(service as any, 'loadScript').mockResolvedValue({ script: 'testScript', loaded: true });
            const scripts = ['testScript'];
            const result = await service.load(...scripts);
            expect(loadScriptSpy).toHaveBeenCalledWith('testScript');
            expect(result).toEqual([{ script: 'testScript', loaded: true }]);
        });
    });
});
