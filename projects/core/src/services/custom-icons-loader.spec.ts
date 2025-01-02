import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { CustomIconsLoaderService } from './custom-icons-loader.service';
import * as utils from '../utils/utils';

jest.mock('../utils/utils');

describe('CustomIconsLoaderService', () => {
    let service: CustomIconsLoaderService;
    let httpClientMock: jest.Mocked<HttpClient>;

    beforeEach(() => {
        httpClientMock = {
            get: jest.fn(),
        } as any;

        TestBed.configureTestingModule({
            providers: [
                CustomIconsLoaderService,
                { provide: HttpClient, useValue: httpClientMock }
            ]
        });

        service = TestBed.inject(CustomIconsLoaderService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('load', () => {
        it('should extract CSS paths and load stylesheets', () => {
            // Arrange
            const mockFontConfig = `{
        "csspath": "/path1/style.css",
        "other": "value",
        "csspath": "/path2/style.css"
      }`;
            const expectedPaths = ['/path1/style.css', '/path2/style.css'];

            jest.spyOn(utils, 'getFontConfig').mockReturnValue(mockFontConfig);
            const loadStyleSheetsSpy = jest.spyOn(utils, 'loadStyleSheets');

            // Act
            service.load();

            // Assert
            expect(utils.getFontConfig).toHaveBeenCalledTimes(1);
            expect(loadStyleSheetsSpy).toHaveBeenCalledWith(expectedPaths);
        });

        it('should handle empty font config', () => {
            // Arrange
            const mockFontConfig = '{}';
            jest.spyOn(utils, 'getFontConfig').mockReturnValue(mockFontConfig);
            const loadStyleSheetsSpy = jest.spyOn(utils, 'loadStyleSheets');

            // Act
            service.load();

            // Assert
            expect(loadStyleSheetsSpy).toHaveBeenCalledWith([]);
        });
    });
});