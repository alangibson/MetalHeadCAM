import { describe, it, expect } from 'vitest';
import { circleEndPoint, circleStartPoint, circleTransform } from './circle.function';
import type { CircleData } from './circle.data';
import type { TransformData } from '../transform/transform.data';
import { circleTessellate } from './circle.function';
import type { PointData } from '../point/point.data';

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
        // x' = x*cos(π/2) - y*sin(π/2) = 10*0 - 20*1 = -20
        // y' = x*sin(π/2) + y*cos(π/2) = 10*1 + 20*0 = 10
        expect(result.origin.x).toBeCloseTo(-20);
        expect(result.origin.y).toBeCloseTo(10);
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

        // Transformations are applied in reverse order of compose:
        // 1. Scale (x2) -> (20,40)
        // 2. Rotate 180° -> (-20,-40)
        // 3. Translate (+10,+10) -> (-10,-30)
        expect(result.origin.x).toBeCloseTo(-10);  // (10 * 2) * -1 + 10
        expect(result.origin.y).toBeCloseTo(-30);  // (20 * 2) * -1 + 10
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

        // First scales (none in this case), then rotates 180° (negates coordinates), then translates
        expect(result.origin.x).toBeCloseTo(10 + 34.9);  // -(-10) + 34.9
        expect(result.origin.y).toBeCloseTo(20 + 7.6);   // -(-20) + 7.6
        expect(result.radius).toBe(5);                    // unchanged due to scaleX=1
    });
});

describe('circleTessellate', () => {
    // Helper function to check if a point is approximately equal to another point
    const pointsApproximatelyEqual = (p1: PointData, p2: PointData, tolerance = 0.0001) => {
        return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
    };

    it('should generate correct number of points', () => {
        // Arrange
        const circle: CircleData = {
            origin: { x: 0, y: 0 },
            radius: 5
        };
        const samples = 100;

        // Act
        const points = circleTessellate(circle, samples);

        // Assert
        expect(points).toHaveLength(samples + 1); // +1 because we include both start and end points
    });

    it('should generate points in correct positions for unit circle at origin', () => {
        // Arrange
        const circle: CircleData = {
            origin: { x: 0, y: 0 },
            radius: 1
        };
        const samples = 4; // Use 4 points to check cardinal directions

        // Act
        const points = circleTessellate(circle, samples);

        // Assert
        // Check right point (0 degrees)
        expect(pointsApproximatelyEqual(points[0], { x: 1, y: 0 })).toBe(true);
        // Check top point (90 degrees)
        expect(pointsApproximatelyEqual(points[1], { x: 0, y: 1 })).toBe(true);
        // Check left point (180 degrees)
        expect(pointsApproximatelyEqual(points[2], { x: -1, y: 0 })).toBe(true);
        // Check bottom point (270 degrees)
        expect(pointsApproximatelyEqual(points[3], { x: 0, y: -1 })).toBe(true);
    });

    it('should generate points in correct positions for translated circle', () => {
        // Arrange
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 5
        };
        const samples = 4;

        // Act
        const points = circleTessellate(circle, samples);

        // Assert
        // Check right point (0 degrees)
        expect(pointsApproximatelyEqual(points[0], { x: 15, y: 20 })).toBe(true);
        // Check top point (90 degrees)
        expect(pointsApproximatelyEqual(points[1], { x: 10, y: 25 })).toBe(true);
        // Check left point (180 degrees)
        expect(pointsApproximatelyEqual(points[2], { x: 5, y: 20 })).toBe(true);
        // Check bottom point (270 degrees)
        expect(pointsApproximatelyEqual(points[3], { x: 10, y: 15 })).toBe(true);
    });

    it('should generate points in counter-clockwise order', () => {
        // Arrange
        const circle: CircleData = {
            origin: { x: 0, y: 0 },
            radius: 1
        };
        const samples = 8; // Use 8 points to check order

        // Act
        const points = circleTessellate(circle, samples);

        // Assert
        // Check that points are in counter-clockwise order by comparing angles
        for (let i = 0; i < points.length - 1; i++) {
            const angle1 = Math.atan2(points[i].y, points[i].x);
            const angle2 = Math.atan2(points[i + 1].y, points[i + 1].x);
            // Handle the wrap-around case
            const angleDiff = (angle2 - angle1 + 2 * Math.PI) % (2 * Math.PI);
            expect(angleDiff).toBeGreaterThan(0);
        }
    });

    it('should handle zero radius circle', () => {
        // Arrange
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 0
        };
        const samples = 4;

        // Act
        const points = circleTessellate(circle, samples);

        // Assert
        expect(points).toHaveLength(samples + 1);
        points.forEach(point => {
            expect(point.x).toBe(10);
            expect(point.y).toBe(20);
        });
    });

    it('should have same start and end points', () => {
        // Arrange
        const circle: CircleData = {
            origin: { x: 10, y: 20 },
            radius: 5
        };
        const samples = 100;

        // Act
        const points = circleTessellate(circle, samples);

        // Assert
        expect(points[0]).toEqual(points[points.length - 1]);
    });
});

