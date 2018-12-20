// This function returns the maximum number of decimal digits allowed.
import { isString } from '@wm/core';

declare const _;

export const getDecimalCount = (val: string) => {
    val = val || '9';
    val = val.replace(/\%$/, '');

    const n = val.lastIndexOf('.');

    return (n === -1) ? 0 : (val.length - n - 1);
};

// returns true if the given value contains '%'
export const isPercentageValue = (val: string): boolean => {
    if (isString(val)) {
        val = val.trim();
        return val.charAt(val.length - 1) === '%';
    }
    return false;
};

export const calculatePercent = (value: number , min: number = 0, max: number = 0): number => {
    const percent: number = ((value - min) / (max - min)) * 100;

    if (_.isNaN(percent)) {
        console.warn('Circle Progress Bar: One of the properties Min, Max or datavalue is not a valid number');
        return 0;
    }
    return Math.abs(percent);
};

// map of progress-bar type and classes
export const TYPE_CLASS_MAP = {
    'default': '',
    'default-striped': 'progress-bar-striped',
    'success': 'progress-bar-success',
    'success-striped': 'progress-bar-success progress-bar-striped',
    'info': 'progress-bar-info',
    'info-striped': 'progress-bar-info progress-bar-striped',
    'warning': 'progress-bar-warning',
    'warning-striped': 'progress-bar-warning progress-bar-striped',
    'danger': 'progress-bar-danger',
    'danger-striped': 'progress-bar-danger progress-bar-striped'
};
