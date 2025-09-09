import { LocalDataProvider } from './local-data-provider';
import { IDataProviderConfig } from './data-provider';

describe('LocalDataProvider', () => {
    let localDataProvider: LocalDataProvider;
    let mockConfig: IDataProviderConfig;

    beforeEach(() => {
        localDataProvider = new LocalDataProvider();
        mockConfig = {
            dataset: [],
            datafield: 'testField',
            query: 'test',
            isLocalFilter: true,
            page: 1,
            hasData: true
        };
    });

    describe('filter', () => {
        it('should filter data based on searchKey', async () => {
            if (mockConfig) { mockConfig.dataset = [
                { name: 'John Doe', age: 30 },
                { name: 'Jane Doe', age: 25 },
                { name: 'Bob Smith', age: 40 }
            ]; }
            mockConfig.searchKey = 'name';
            mockConfig.query = 'Doe';

            const result = await localDataProvider.filter(mockConfig);

            expect(result.data).toHaveLength(2);
            expect(result.data[0].name).toBe('John Doe');
            expect(result.data[1].name).toBe('Jane Doe');
        });

        it('should filter data case-insensitively by default', async () => {
            if (mockConfig) { mockConfig.dataset = [
                { name: 'John Doe', age: 30 },
                { name: 'Jane doe', age: 25 },
                { name: 'Bob Smith', age: 40 }
            ]; }
            mockConfig.searchKey = 'name';
            mockConfig.query = 'doe';

            const result = await localDataProvider.filter(mockConfig);

            expect(result.data).toHaveLength(2);
            expect(result.data[0].name).toBe('John Doe');
            expect(result.data[1].name).toBe('Jane doe');
        });

        it('should filter data case-sensitively when specified', async () => {
            if (mockConfig) { mockConfig.dataset = [
                { name: 'John Doe', age: 30 },
                { name: 'Jane doe', age: 25 },
                { name: 'Bob Smith', age: 40 }
            ]; }
            mockConfig.searchKey = 'name';
            mockConfig.query = 'doe';
            mockConfig.casesensitive = true;

            const result = await localDataProvider.filter(mockConfig);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Jane doe');
        });

        it('should filter data using start match mode', async () => {
            if (mockConfig) { mockConfig.dataset = [
                { name: 'John Doe', age: 30 },
                { name: 'Jane Doe', age: 25 },
                { name: 'Bob Smith', age: 40 }
            ]; }
            mockConfig.searchKey = 'name';
            mockConfig.query = 'Jo';
            mockConfig.matchMode = 'start';

            const result = await localDataProvider.filter(mockConfig);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('John Doe');
        });

        it('should filter data using end match mode', async () => {
            if (mockConfig) { mockConfig.dataset = [
                { name: 'John Doe', age: 30 },
                { name: 'Jane Doe', age: 25 },
                { name: 'Bob Smith', age: 40 }
            ]; }
            mockConfig.searchKey = 'name';
            mockConfig.query = 'oe';
            mockConfig.matchMode = 'end';

            const result = await localDataProvider.filter(mockConfig);

            expect(result.data).toHaveLength(2);
            expect(result.data[0].name).toBe('John Doe');
            expect(result.data[1].name).toBe('Jane Doe');
        });

        it('should filter data using exact match mode', async () => {
            if (mockConfig) { mockConfig.dataset = [
                { name: 'John Doe', age: 30 },
                { name: 'Jane Doe', age: 25 },
                { name: 'Bob Smith', age: 40 }
            ]; }
            mockConfig.searchKey = 'name';
            mockConfig.query = 'John Doe';
            mockConfig.matchMode = 'exact';

            const result = await localDataProvider.filter(mockConfig);

            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('John Doe');
        });

        it('should filter data without searchKey', async () => {
            if (mockConfig) { mockConfig.dataset = [
                { name: 'John Doe', age: 30 },
                { name: 'Jane Doe', age: 25 },
                { name: 'Bob Smith', age: 40 }
            ]; }
            mockConfig.query = 'Doe';

            const result = await localDataProvider.filter(mockConfig);

            expect(result.data).toHaveLength(2);
            expect(result.data[0].name).toBe('John Doe');
            expect(result.data[1].name).toBe('Jane Doe');
        });

        it('should return correct metadata', async () => {
            if (mockConfig) { mockConfig.dataset = ['apple', 'banana', 'cherry', 'date']; }
            mockConfig.query = 'a';

            const result = await localDataProvider.filter(mockConfig);

            expect(result.hasMoreData).toBe(false);
            expect(result.isLastPage).toBe(true);
        });
    });
});