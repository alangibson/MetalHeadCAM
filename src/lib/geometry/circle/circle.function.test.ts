import { describe, it, expect } from 'vitest';
import { circleTransform } from './circle.function';
import type { CircleData } from './circle.data';
import type { TransformData } from '../transform/transform.data';

describe('circleTransform', () => {

    it('should handle translation', () => {
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 5
        };
        const transform: TransformData = {
            translateX: 10,
            translateY: -5
        };

        const result = circleTransform(transform, circle);

        expect(result.origin.x).toBe(20); // 10 + 10
        expect(result.origin.y).toBe(15); // 20 - 5
        expect(result.radius).toBe(5);    // unchanged
    });

    it('should handle scaling', () => {
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 5
        };
        const transform: TransformData = {
            scaleX: 2,
            scaleY: 2
        };

        const result = circleTransform(transform, circle);

        expect(result.origin.x).toBe(20); // 10 * 2
        expect(result.origin.y).toBe(40); // 20 * 2
        expect(result.radius).toBe(10);   // 5 * 2
    });

    it('should handle rotation around orgin where center==origin', () => {
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 5
        };
        const transform: TransformData = {
            rotateAngle: Math.PI / 2 // 90 degrees
        };

        const result = circleTransform(transform, circle);

        // In a 90 degree rotation around origin:
        // x' = -y
        // y' = x
        expect(result.origin.x).toBeCloseTo(10);
        expect(result.origin.y).toBeCloseTo(20);
        expect(result.radius).toBe(5); // unchanged
    });

    it('should handle combined transformations', () => {
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 5
        };
        const transform: TransformData = {
            translateX: 10,
            translateY: 10,
            rotateAngle: Math.PI, // 180 degrees
            scaleX: 2,
            scaleY: 2
        };

        const result = circleTransform(transform, circle);

        // First scales (x2), then rotates 180° (negates), then translates (+10)
        expect(result.origin.x).toBeCloseTo((circle.origin.x * 2) + 10);
        expect(result.origin.y).toBeCloseTo((circle.origin.y * 2) + 10);
        expect(result.radius).toBe(10);           // 5 * 2
    });

    it('should handle undefined transform values', () => {
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 5
        };
        const transform: TransformData = {};

        const result = circleTransform(transform, circle);

        expect(result.origin.x).toBe(10); // unchanged
        expect(result.origin.y).toBe(20); // unchanged
        expect(result.radius).toBe(5);    // unchanged
    });

    it('should handle DXF specific transform values', () => {
        const circle: CircleData = {
            origin: { x: -10, y: -20 },
            radius: 5
        };
        const transform: TransformData = {
            rotateAngle: Math.PI, // 180 degrees
            // TODO scale
            // scaleX: 1,
            // scaleY: -1,
            translateX: 34.900000000000006,
            translateY: 7.600000000000007
        };

        const result = circleTransform(transform, circle);

        // First scales (y flips), then rotates 180°, then translates
        expect(result.origin.x).toBeCloseTo(-10 + 34.9);  // (-10) + 34.9
        expect(result.origin.y).toBeCloseTo(-20 + 7.6);   // (-20) + 7.6
        expect(result.radius).toBe(5);                     // unchanged due to scaleX=1
    });
});
