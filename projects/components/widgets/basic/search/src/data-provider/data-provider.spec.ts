import { DataProvider, IDataProviderConfig } from './data-provider';
import { DataSource } from '@wm/core';
import { RemoteDataProvider } from './remote-data-provider';
import { LocalDataProvider } from './local-data-provider';

jest.mock('./remote-data-provider');
jest.mock('./local-data-provider');
jest.mock('@wm/core');

describe('DataProvider', () => {
    let dataProvider: DataProvider;
    let mockConfig: IDataProviderConfig;

    beforeEach(() => {
        dataProvider = new DataProvider();
        mockConfig = {
            dataset: [],
            datafield: 'testField',
            query: [],
            isLocalFilter: false,
            page: 1,
            hasData: false
        };

        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(dataProvider).toBeTruthy();
    });

    describe('filter', () => {
        it('should use RemoteDataProvider when conditions are met', async () => {
            mockConfig.dataoptions = { someOption: true };
            mockConfig.searchKey = 'testKey';
            mockConfig.datasource = {
                execute: jest.fn().mockReturnValue(true)
            };

            const mockResponse = {
                hasMoreData: true,
                isLastPage: false,
                page: 2,
                isPaginatedData: true
            };

            (RemoteDataProvider.prototype.filter as jest.Mock).mockResolvedValue(mockResponse);

            const result = await dataProvider.filter(mockConfig);

            expect(RemoteDataProvider.prototype.filter).toHaveBeenCalledWith(mockConfig);
            expect(LocalDataProvider.prototype.filter).not.toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
            expect(dataProvider.hasMoreData).toBe(true);
            expect(dataProvider.isLastPage).toBe(false);
            expect(dataProvider.page).toBe(2);
            expect(dataProvider.isPaginatedData).toBe(true); 
        });

        it('should use LocalDataProvider when conditions are not met', async () => {
            mockConfig.isLocalFilter = true;

            const mockResponse = {
                hasMoreData: false,
                isLastPage: true,
                page: 1,
                isPaginatedData: false
            };

            (LocalDataProvider.prototype.filter as jest.Mock).mockResolvedValue(mockResponse);

            const result = await dataProvider.filter(mockConfig);

            expect(LocalDataProvider.prototype.filter).toHaveBeenCalledWith(mockConfig);
            expect(RemoteDataProvider.prototype.filter).not.toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
            expect(dataProvider.hasMoreData).toBe(false);
            expect(dataProvider.isLastPage).toBe(true);
            expect(dataProvider.page).toBe(1);
            expect(dataProvider.isPaginatedData).toBe(false); 
        });

        it('should use LocalDataProvider when datasource is a serviceVariable with no input params', async () => {
            mockConfig.datasource = {
                execute: jest.fn().mockImplementation((operation) => {
                    if (operation === DataSource.Operation.IS_API_AWARE) return true;
                    if (operation === DataSource.Operation.IS_UPDATE_REQUIRED) return false;
                    return false;
                })
            };

            const mockResponse = {
                hasMoreData: false,
                isLastPage: true,
                page: 1,
                isPaginatedData: false
            };

            (LocalDataProvider.prototype.filter as jest.Mock).mockResolvedValue(mockResponse);

            await dataProvider.filter(mockConfig);

            expect(LocalDataProvider.prototype.filter).toHaveBeenCalledWith(mockConfig);
            expect(RemoteDataProvider.prototype.filter).not.toHaveBeenCalled();
        });

        it('should set updateDataset correctly', async () => {
            mockConfig.datasource = {
                execute: jest.fn().mockImplementation((operation) => {
                    if (operation === DataSource.Operation.IS_API_AWARE) return true;
                    if (operation === DataSource.Operation.IS_UPDATE_REQUIRED) return true;
                    if (operation === DataSource.Operation.SUPPORTS_CRUD) return false;
                    return false;
                })
            };
            mockConfig.searchKey = 'testKey';

            const mockResponse = {
                hasMoreData: true,
                isLastPage: false,
                page: 1,
                isPaginatedData: true
            };

            (RemoteDataProvider.prototype.filter as jest.Mock).mockResolvedValue(mockResponse);

            await dataProvider.filter(mockConfig);

            expect(dataProvider.updateDataset).toBe(true);
        });
    });
});