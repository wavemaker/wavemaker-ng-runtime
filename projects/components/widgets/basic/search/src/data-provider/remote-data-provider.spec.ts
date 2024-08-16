import { RemoteDataProvider } from './remote-data-provider';
import { DataSource, AppConstants } from '@wm/core';
import * as baseComponentsModule from '@wm/components/base';
import { IDataProviderConfig } from './data-provider';

jest.mock('@wm/core');
jest.mock('@wm/components/base');

describe('RemoteDataProvider', () => {
    let remoteDataProvider: RemoteDataProvider;
    let mockDataSource: any;

    beforeEach(() => {
        remoteDataProvider = new RemoteDataProvider();
        mockDataSource = {
            execute: jest.fn(),
        };
    });

    describe('filter', () => {
        it('should call filterData and onFilterSuccess when successful', async () => {
            const mockConfig: IDataProviderConfig = {
                datasource: mockDataSource,
                dataset: undefined,
                datafield: '',
                hasData: false,
                query: '',
                isLocalFilter: false,
                page: 0
            };
            const mockResponse = { data: [{ id: 1 }] };

            jest.spyOn(remoteDataProvider as any, 'filterData').mockResolvedValue(mockResponse);
            jest.spyOn(remoteDataProvider as any, 'onFilterSuccess').mockResolvedValue(mockResponse);

            const result = await remoteDataProvider.filter(mockConfig);

            expect(result).toEqual(mockResponse);
            expect((remoteDataProvider as any).filterData).toHaveBeenCalledWith(mockConfig);
            expect((remoteDataProvider as any).onFilterSuccess).toHaveBeenCalledWith(mockConfig, mockResponse);
        });

        it('should call onFilterFailure when filterData fails', async () => {
            const mockConfig: IDataProviderConfig = {
                datasource: mockDataSource,
                dataset: undefined,
                datafield: '',
                hasData: false,
                query: '',
                isLocalFilter: false,
                page: 0
            };
            jest.spyOn(remoteDataProvider as any, 'filterData').mockRejectedValue(new Error('Test error'));
            jest.spyOn(remoteDataProvider as any, 'onFilterFailure').mockReturnValue([]);

            const result = await remoteDataProvider.filter(mockConfig);

            expect(result).toEqual([]);
            expect((remoteDataProvider as any).filterData).toHaveBeenCalledWith(mockConfig);
            expect((remoteDataProvider as any).onFilterFailure).toHaveBeenCalled();
        });
    });

    describe('filterData', () => {
        it('should handle relatedField dataoptions', async () => {
            const mockConfig = {
                dataoptions: { relatedField: 'test', filterExpr: 'expr' },
                datasource: mockDataSource,
                viewParent: {},
            };
            mockDataSource.execute.mockResolvedValue({ data: [{ id: 1 }] });
            (baseComponentsModule.interpolateBindExpressions as jest.Mock).mockImplementation((_, __, callback) => callback('interpolated'));

            await (remoteDataProvider as any).filterData(mockConfig);

            expect(mockDataSource.execute).toHaveBeenCalledWith(
                DataSource.Operation.GET_RELATED_TABLE_DATA,
                expect.objectContaining({ relatedField: 'test', filterExpr: 'interpolated' })
            );
        });

        it('should handle distinctField dataoptions', async () => {
            const mockConfig = {
                dataoptions: { distinctField: 'test', tableName: 'testTable' },
                datasource: mockDataSource,
                limit: 10,
                page: 1,
            };
            mockDataSource.execute.mockResolvedValue({ data: [{ id: 1 }] });

            await (remoteDataProvider as any).filterData(mockConfig);

            expect(mockDataSource.execute).toHaveBeenCalledWith(
                DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS,
                expect.objectContaining({
                    pagesize: 10,
                    page: 1,
                    fields: 'test',
                    entityName: 'testTable',
                })
            );
        });

        it('should handle search records when no dataoptions', async () => {
            const mockConfig = {
                datasource: mockDataSource,
            };
            mockDataSource.execute.mockResolvedValue({ data: [{ id: 1 }] });

            await (remoteDataProvider as any).filterData(mockConfig);

            expect(mockDataSource.execute).toHaveBeenCalledWith(
                DataSource.Operation.SEARCH_RECORDS,
                mockConfig
            );
        });
    });

    describe('isLast', () => {
        it('should return true when current results are less than max results', () => {
            const result = (remoteDataProvider as any).isLast(1, AppConstants.INT_MAX_VALUE, 10, 5);
            expect(result).toBe(true);
        });

        it('should return false when current results equal max results', () => {
            const result = (remoteDataProvider as any).isLast(1, AppConstants.INT_MAX_VALUE, 10, 10);
            expect(result).toBe(false);
        });

        it('should calculate page count when dataSize is not INT_MAX_VALUE', () => {
            const result = (remoteDataProvider as any).isLast(2, 15, 10);
            expect(result).toBe(true);
        });
    });

    describe('getTransformedData', () => {
        it('should transform string response to array', () => {
            const variable = { operation: 'test' };
            const data = { testResult: 'value' };
            const result = (remoteDataProvider as any).getTransformedData(variable, data);
            expect(result).toEqual([{ testResult: 'value' }]);
        });

        it('should transform object response to array', () => {
            const variable = { operation: 'test' };
            const data = { key: 'value' };
            const result = (remoteDataProvider as any).getTransformedData(variable, data);
            expect(result).toEqual([{ key: 'value' }]);
        });
    });

    describe('onFilterFailure', () => {
        it('should return an empty array', () => {
            const result = (remoteDataProvider as any).onFilterFailure();
            expect(result).toEqual([]);
        });
    });

    describe('onFilterSuccess', () => {
        it('should handle pageable data', async () => {
            const mockConfig = {
                datasource: {
                    execute: jest.fn().mockReturnValue(true),
                },
                binddataset: 'testData.dataSet.result',
            };
            const mockResponse = {
                data: [{ id: 1 }, { id: 2 }],
                pagination: {
                    number: 0,
                    totalElements: 10,
                    size: 2,
                    numberOfElements: 2,
                },
            };

            const result = await (remoteDataProvider as any).onFilterSuccess(mockConfig, mockResponse);

            expect(result).toEqual({
                data: [{ id: 1 }, { id: 2 }],
                isLastPage: false,
                hasMoreData: false,
                isPaginatedData: true,
                page: 1,
            });
        });

        it('should handle the last page for distinct API', async () => {
            const mockConfig = {
                datasource: {
                    execute: jest.fn().mockReturnValue(true),
                },
                binddataset: 'testData.dataSet.result',
                limit: 10,
            };
            const mockResponse = {
                data: [],
                pagination: {
                    number: 1,
                    totalElements: AppConstants.INT_MAX_VALUE,
                    size: 10,
                    numberOfElements: 0,
                },
            };

            const result = await (remoteDataProvider as any).onFilterSuccess(mockConfig, mockResponse);

            expect(result).toEqual({
                data: [],
                isLastPage: true,
                hasMoreData: true,
                isPaginatedData: true,
                page: 2,
            });
        });

        it('should handle empty data', async () => {
            const mockConfig = {
                datasource: {
                    execute: jest.fn().mockReturnValue(false),
                },
                binddataset: 'testData.dataSet.result',
            };
            const mockResponse = {
                data: [],
            };

            const result = await (remoteDataProvider as any).onFilterSuccess(mockConfig, mockResponse);

            expect(result).toEqual({
                data: [],
                isLastPage: undefined,
                hasMoreData: false,
                isPaginatedData: undefined,
                page: undefined,
            });
        });
    });
});