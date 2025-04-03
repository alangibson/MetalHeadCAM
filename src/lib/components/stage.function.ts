
/**
 * Convert millimeters to inches.
 * 
 * @param mm - The measurement in millimeters to convert
 * @returns The equivalent measurement in inches
 */
export function mmToInches(mm: number): number {
    const MM_PER_INCH = 25.4;
    return mm / MM_PER_INCH;
}


/**
 * Convert inches to pixels at 96 DPI (dots per inch).
 * 
 * @param inches - The measurement in inches to convert
 * @returns The equivalent measurement in pixels
 */
export function inchesToPixels(inches: number): number {
    const DPI = 96;
    return inches * DPI;
}

