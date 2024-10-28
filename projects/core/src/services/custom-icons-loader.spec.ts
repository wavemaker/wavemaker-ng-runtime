import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomIconsLoaderService } from './custom-icons-loader.service';
import { loadStyleSheets } from '../utils/utils';

jest.mock('../utils/utils', () => ({
    loadStyleSheets: jest.fn(),
}));

describe('CustomIconsLoaderService', () => {
    let service: CustomIconsLoaderService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CustomIconsLoaderService],
        });

        service = TestBed.inject(CustomIconsLoaderService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Ensure that there are no outstanding requests
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load and parse font configuration and call loadStyleSheets', () => {
        const mockFontConfig = `
        [
            {"csspath": "path/to/stylesheet1.css"},
            {"csspath": "path/to/stylesheet2.css"}
        ]`;

        service.load();

        const req = httpMock.expectOne('./font.config.js');
        expect(req.request.method).toBe('GET');
        req.flush(mockFontConfig);

        expect(loadStyleSheets).toHaveBeenCalledWith([
            'path/to/stylesheet1.css',
            'path/to/stylesheet2.css'
        ]);
    });

    it('should handle errors without throwing', () => {
        service.load();

        const req = httpMock.expectOne('./font.config.js');
        expect(req.request.method).toBe('GET');
        req.error(new ErrorEvent('Network error'));

        // Expect no errors to be thrown
        expect(loadStyleSheets).not.toHaveBeenCalled();
    });
});
