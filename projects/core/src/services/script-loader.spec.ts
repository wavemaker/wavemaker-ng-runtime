import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ScriptLoaderService, ScriptStore } from './script-loader.service';
import { _WM_APP_PROJECT } from '../utils/utils';
import { HttpClient } from '@angular/common/http';

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

        // Mock the global document object
        (global as any).document = {
            createElement: jest.fn().mockImplementation(() => ({
                type: '',
                async: false,
                onreadystatechange: null,
                onload: null,
                onerror: null,
                src: '',
            })),
            getElementsByTagName: jest.fn().mockReturnValue([{
                appendChild: jest.fn(),
            }]),
        };
    });

    afterEach(() => {
        httpMock.verify();
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize scripts from ScriptStore', () => {
        ScriptStore.push({ name: 'testScript', src: 'testScript.js' });
        const newService = new ScriptLoaderService(TestBed.inject(HttpClient));
        expect(newService['scripts']['testScript']).toEqual({ loaded: false, src: 'testScript.js' });
    });

    it('should skip loading scripts when no scripts are provided', async () => {
        const loadScriptPromise = service.load();
        const result = await loadScriptPromise;
        expect(result).toEqual(undefined);
    });
});
