import { CustomPipeManager, UtilsService } from '@wm/core';
import * as Utils from '../utils/utils';
import * as lodash from 'lodash-es';
import { TestBed } from '@angular/core/testing';

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


describe('CustomPipeManager', () => {
    let service: CustomPipeManager;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CustomPipeManager);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get a custom pipe', () => {
        const key = 'testPipe';
        const value = () => 'test';

        service.setCustomPipe(key, value);
        const retrievedPipe = service.getCustomPipe(key);

        expect(retrievedPipe).toBe(value);
    });

    it('should return undefined for non-existent pipe', () => {
        const key = 'nonExistentPipe';

        const retrievedPipe = service.getCustomPipe(key);

        expect(retrievedPipe).toBeUndefined();
    });

    it('should correctly check if a custom pipe exists', () => {
        const key = 'existingPipe';
        const value = () => 'test';

        service.setCustomPipe(key, value);

        expect(service.hasCustomPipe(key)).toBe(true);
        expect(service.hasCustomPipe('nonExistentPipe')).toBe(false);
    });

    it('should override existing pipe when setting with the same key', () => {
        const key = 'overridePipe';
        const initialValue = () => 'initial';
        const newValue = () => 'new';

        service.setCustomPipe(key, initialValue);
        service.setCustomPipe(key, newValue);

        const retrievedPipe = service.getCustomPipe(key);

        expect(retrievedPipe).toBe(newValue);
    });
});