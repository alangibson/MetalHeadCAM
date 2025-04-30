import { describe, it, expect } from 'vitest';
import { splineTessellate } from './spline.function';
import type { SplineData } from './spline.data';
import type { PointData } from '../point/point.data';
import { splineIsClamped } from './spline.function';

describe('splineTessellate', () => {
    // Helper function to check if points are approximately equal
    const pointsApproximatelyEqual = (p1: PointData, p2: PointData, tolerance = 0.0001): boolean => {
        return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
    };

    // Helper function to check if a point is within bounds
    const pointWithinBounds = (point: PointData, bounds: { minX: number, maxX: number, minY: number, maxY: number }): boolean => {
        return point.x >= bounds.minX && point.x <= bounds.maxX && 
               point.y >= bounds.minY && point.y <= bounds.maxY;
    };

    it('should tessellate a quadratic spline (degree 2)', () => {
        // Create a simple quadratic spline (parabola)
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 }
            ],
            degree: 2
        };

        const points = splineTessellate(spline, 10);

        // Check number of points
        expect(points).toHaveLength(11); // samples + 1

        // Check start and end points to make sure that curve is clamped
        expect(pointsApproximatelyEqual(points[0], spline.controlPoints[0])).toBe(true);
        expect(pointsApproximatelyEqual(points[points.length - 1], spline.controlPoints[2])).toBe(true);

        // Check middle point (should be at the peak of the parabola)
        expect(pointsApproximatelyEqual(points[5], { x: 1, y: 0.5 })).toBe(true);
    });

    it('should tessellate a cubic spline (degree 3)', () => {
        // Create a cubic spline
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 0 }
            ],
            degree: 3
        };

        const points = splineTessellate(spline, 10);

        // Check number of points
        expect(points).toHaveLength(11);

        // Check start and end points
        expect(pointsApproximatelyEqual(points[0], spline.controlPoints[0])).toBe(true);
        expect(pointsApproximatelyEqual(points[points.length - 1], spline.controlPoints[3])).toBe(true);

        // Check that all points are within bounds
        const bounds = {
            minX: 0,
            maxX: 3,
            minY: 0,
            maxY: 1.5 // Allow some margin for the curve
        };

        points.forEach(point => {
            expect(pointWithinBounds(point, bounds)).toBe(true);
        });
    });

    it('should tessellate a NURBS curve with weights', () => {
        // Create a NURBS curve (circular arc)
        const spline: SplineData = {
            controlPoints: [
                { x: 1, y: 0 },
                { x: 1, y: 1 },
                { x: 0, y: 1 }
            ],
            degree: 2,
            weights: [1, 0.7071, 1], // Weights for a 90-degree circular arc
            knots: [0, 0, 0, 1, 1, 1] // Uniform knots for degree 2
        };

        const points = splineTessellate(spline, 10);

        // Check number of points
        expect(points).toHaveLength(11);

        // Check start and end points
        expect(pointsApproximatelyEqual(points[0], spline.controlPoints[0])).toBe(true);
        expect(pointsApproximatelyEqual(points[points.length - 1], spline.controlPoints[2])).toBe(true);

        // Check that points approximately form a quarter circle
        points.forEach(point => {
            const distance = Math.sqrt(point.x * point.x + point.y * point.y);
            expect(Math.abs(distance - 1)).toBeLessThan(0.1); // Points should be roughly on unit circle
        });
    });

    it('should handle a closed spline', () => {
        // Create a closed spline (triangle)
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 0.5, y: 1 },
                { x: 0, y: 0 } // Same as first point to close the spline
            ],
            degree: 2
        };

        const points = splineTessellate(spline, 10);

        // Check number of points
        expect(points).toHaveLength(11);

        // Check start and end points
        expect(pointsApproximatelyEqual(points[0], spline.controlPoints[0])).toBe(true);
        expect(pointsApproximatelyEqual(points[points.length - 1], spline.controlPoints[3])).toBe(true);
    });

    it('should handle a single point spline', () => {
        const spline: SplineData = {
            controlPoints: [{ x: 1, y: 1 }],
            degree: 0
        };

        const points = splineTessellate(spline, 10);

        // Should return a single point
        expect(points).toHaveLength(11);
        points.forEach(point => {
            expect(pointsApproximatelyEqual(point, spline.controlPoints[0])).toBe(true);
        });
    });

    it('should handle a line segment', () => {
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 }
            ],
            degree: 1
        };

        const points = splineTessellate(spline, 10);

        // Check number of points
        expect(points).toHaveLength(11);

        // Check start and end points
        expect(pointsApproximatelyEqual(points[0], spline.controlPoints[0])).toBe(true);
        expect(pointsApproximatelyEqual(points[points.length - 1], spline.controlPoints[1])).toBe(true);

        // Check that points are evenly distributed along the line
        for (let i = 0; i < points.length; i++) {
            const t = i / 10;
            const expectedPoint = {
                x: t,
                y: t
            };
            expect(pointsApproximatelyEqual(points[i], expectedPoint)).toBe(true);
        }
    });
});

describe('splineIsClamped', () => {
    it('should return false for spline without knots', () => {
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 }
            ],
            degree: 2
        };

        expect(splineIsClamped(spline)).toBe(false);
    });

    it('should return true for a clamped cubic spline', () => {
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 0 }
            ],
            degree: 3,
            knots: [0, 0, 0, 0, 1, 1, 1, 1] // Clamped cubic spline knots
        };

        expect(splineIsClamped(spline)).toBe(true);
    });

    it('should return false for an unclamped cubic spline', () => {
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 0 }
            ],
            degree: 3,
            knots: [0, 0.2, 0.4, 0.6, 0.8, 1] // Uniform knots (not clamped)
        };

        expect(splineIsClamped(spline)).toBe(false);
    });

    it('should return true for a clamped quadratic spline', () => {
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 }
            ],
            degree: 2,
            knots: [0, 0, 0, 1, 1, 1] // Clamped quadratic spline knots
        };

        expect(splineIsClamped(spline)).toBe(true);
    });

    it('should handle spline with implicit degree', () => {
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 0 }
            ],
            knots: [0, 0, 0, 1, 1, 1] // Clamped quadratic spline knots
        };

        expect(splineIsClamped(spline)).toBe(true);
    });

    it('should return false for partially clamped spline', () => {
        const spline: SplineData = {
            controlPoints: [
                { x: 0, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
                { x: 3, y: 0 }
            ],
            degree: 3,
            knots: [0, 0, 0, 0, 0.5, 0.8, 1, 1] // Only clamped at start
        };

        expect(splineIsClamped(spline)).toBe(false);
    });
});
