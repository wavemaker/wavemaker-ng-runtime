import { getDecimalCount, isPercentageValue, calculatePercent } from './progress-utils';

describe('getDecimalCount', () => {
    it('should return 0 for integers', () => {
        expect(getDecimalCount('123')).toBe(0);
    });

    it('should return the correct decimal count for numbers with decimals', () => {
        expect(getDecimalCount('123.456')).toBe(3);
        expect(getDecimalCount('0.1')).toBe(1);
    });

    it('should handle percentage values', () => {
        expect(getDecimalCount('75.5%')).toBe(1);
    });

    it('should return 0 for empty string', () => {
        expect(getDecimalCount('')).toBe(0);
    });

    it('should use default value of 9 for falsy inputs', () => {
        expect(getDecimalCount(null as unknown as string)).toBe(0);
        expect(getDecimalCount(undefined as unknown as string)).toBe(0);
    });
});

describe('isPercentageValue', () => {
    it('should return true for valid percentage strings', () => {
        expect(isPercentageValue('50%')).toBe(true);
        expect(isPercentageValue('0%')).toBe(true);
        expect(isPercentageValue('100.5%')).toBe(true);
    });

    it('should return false for non-percentage strings', () => {
        expect(isPercentageValue('50')).toBe(false);
        expect(isPercentageValue('50.5')).toBe(false);
        expect(isPercentageValue('abc')).toBe(false);
    });

    it('should handle whitespace', () => {
        expect(isPercentageValue('  50%  ')).toBe(true);
    });

    it('should return false for non-string inputs', () => {
        expect(isPercentageValue(50 as unknown as string)).toBe(false);
        expect(isPercentageValue(null as unknown as string)).toBe(false);
        expect(isPercentageValue(undefined as unknown as string)).toBe(false);
    });
});

describe('calculatePercent', () => {
    it('should calculate percentage correctly', () => {
        expect(calculatePercent(75, 0, 100)).toBe(75);
        expect(calculatePercent(5, 0, 10)).toBe(50);
    });

    it('should handle negative values', () => {
        expect(calculatePercent(-25, -100, 0)).toBe(75);
    });

    it('should return Infinity when max equals min', () => {
        expect(calculatePercent(50, 100, 100)).toBe(Infinity);
    });

    it('should return Infinity for division by zero', () => {
        expect(calculatePercent(50, 0, 0)).toBe(Infinity);
    });

    it('should use default min and max when not provided', () => {
        expect(calculatePercent(0)).toBe(0);
    });
    it('should handle edge cases', () => {
        expect(calculatePercent(0, 0, 100)).toBe(0);
        expect(calculatePercent(100, 0, 100)).toBe(100);
        expect(calculatePercent(-50, -100, 0)).toBe(50);
    });
});