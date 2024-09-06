import { UtilsService } from '@wm/core';
import * as Utils from '../utils/utils';
import * as lodash from 'lodash-es';

describe('UtilsService', () => {
    let utilsService: UtilsService;

    beforeEach(() => {
        jest.spyOn(lodash, 'assign');
        utilsService = new UtilsService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call lodash assign with the Utils object during construction', () => {
        expect(lodash.assign).toHaveBeenCalledWith(expect.any(UtilsService), Utils);
    });

    it('should assign Utils properties and methods to the service instance', () => {
        const utilsKeys = Object.keys(Utils);

        utilsKeys.forEach((key) => {
            expect(utilsService[key]).toBeDefined();
        });
    });

});
