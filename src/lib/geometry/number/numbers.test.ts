import { describe, it, expect } from 'vitest';
import { roundToDecimalPlaces } from './numbers';

describe('roundToDecimalPlaces', () => {
    it('should round to 2 decimal places by default', () => {
        expect(roundToDecimalPlaces(3.14159)).toBe(3.14);
        expect(roundToDecimalPlaces(2.71828)).toBe(2.72);
    });

    it('should round to specified number of decimal places', () => {
        expect(roundToDecimalPlaces(3.14159, 3)).toBe(3.142);
        expect(roundToDecimalPlaces(2.71828, 4)).toBe(2.7183);
    });

    it('should handle zero', () => {
        expect(roundToDecimalPlaces(0)).toBe(0);
        expect(roundToDecimalPlaces(0, 3)).toBe(0);
    });

    it('should handle negative numbers', () => {
        expect(roundToDecimalPlaces(-3.14159)).toBe(-3.14);
        expect(roundToDecimalPlaces(-2.71828, 3)).toBe(-2.718);
    });

    it('should handle numbers with trailing zeros', () => {
        expect(roundToDecimalPlaces(3.14000)).toBe(3.14);
        expect(roundToDecimalPlaces(2.70000, 3)).toBe(2.7);
    });
}); 