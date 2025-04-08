import { TestBed } from '@angular/core/testing';
import { CustomIconsLoaderService } from './custom-icons-loader.service';
import * as utils from '../utils/utils';

jest.mock('../utils/utils');

describe('CustomIconsLoaderService', () => {
    let service: CustomIconsLoaderService;


    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ CustomIconsLoaderService ]
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
            const mockFontConfig = {
                baseFont: '',
                fonts: [
                    {"name":"moon","path":"resources/icons/moon/icomoon.ttf","csspath":"resources/icons/moon/style.css"},
                    {"name":"moon","path":"resources/icons/sun/icosun.ttf","csspath":"resources/icons/sun/style.css"}
                ]};

            const expectedPaths = ['resources/icons/moon/style.css', 'resources/icons/sun/style.css'];

            jest.spyOn(utils, 'getFontConfig').mockReturnValue({default : mockFontConfig});
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
