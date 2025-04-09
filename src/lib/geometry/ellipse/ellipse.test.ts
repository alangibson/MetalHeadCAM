import { describe, it, expect } from 'vitest';
import { ellipseIsClosed, ellipsePointAtAngle } from './ellipse.function';
import type { PointData } from '../point/point.data';

describe('getPointAtAngleOnEllipse', () => {
    it('should calculate points on an unrotated ellipse correctly', () => {
        // Arrange
        const ellipse = {
            origin: { x: 0, y: 0 },
            majorLength: 2,
            minorLength: 1,
            rotation: 0,
            startAngle: 0,
            endAngle: 2 * Math.PI
        };

        // Act & Assert
        // Test right point (0 radians)
        const rightPoint = ellipsePointAtAngle(ellipse, 0);
        expect(rightPoint.x).toBeCloseTo(2);
        expect(rightPoint.y).toBeCloseTo(0);

        // Test top point (π/2 radians)
        const topPoint = ellipsePointAtAngle(ellipse, Math.PI/2);
        expect(topPoint.x).toBeCloseTo(0);
        expect(topPoint.y).toBeCloseTo(1);

        // Test left point (π radians)
        const leftPoint = ellipsePointAtAngle(ellipse, Math.PI);
        expect(leftPoint.x).toBeCloseTo(-2);
        expect(leftPoint.y).toBeCloseTo(0);

        // Test bottom point (3π/2 radians)
        const bottomPoint = ellipsePointAtAngle(ellipse, 3*Math.PI/2);
        expect(bottomPoint.x).toBeCloseTo(0);
        expect(bottomPoint.y).toBeCloseTo(-1);
    });

    it('should calculate correct points on rotated ellipse', () => {
        // Arrange
        const origin: PointData = { x: 0, y: 0 };
        const majorLength = 2;
        const minorLength = 1;
        const rotation = Math.PI/4; // 45 degrees

        // Act
        const point = ellipsePointAtAngle({
            origin,
            majorLength,
            minorLength,
            rotation,
            startAngle: 0,
            endAngle: 2 * Math.PI
        }, 0);

        // Assert
        // At 0 radians with 45-degree rotation, point should be at (√2, √2) scaled by major radius
        const expected = Math.SQRT2; // ≈ 1.4142
        expect(point.x).toBeCloseTo(expected);
        expect(point.y).toBeCloseTo(expected);
    });

    it('should respect origin offset', () => {
        // Arrange
        const origin: PointData = { x: 1, y: 2 };
        const majorLength = 2;
        const minorLength = 1;
        const rotation = 0;

        // Act
        const point = ellipsePointAtAngle({
            origin,
            majorLength,
            minorLength,
            rotation,
            startAngle: 0,
            endAngle: 2 * Math.PI
        }, 0);

        // Assert
        expect(point.x).toBeCloseTo(3); // origin.x + majorLength
        expect(point.y).toBeCloseTo(2); // origin.y + 0
    });
});

describe('ellipseIsClosed', () => {

    it('ellipseIsClosed -> true because full sweep', () => {
        // Given
        const startAngle = 0;
        const endAngle = 2 * Math.PI;
        // When
        const isClosed = ellipseIsClosed(startAngle, endAngle);
        // Then
        expect(isClosed).toBe(true);
    });

    it('ellipseIsClosed -> false because no arc sweep', () => {
        // Given
        const startAngle = Math.PI;
        const endAngle = Math.PI;
        // When
        const isClosed = ellipseIsClosed(startAngle, endAngle);
        // Then
        expect(isClosed).toBe(false);
    });

    it('ellipseIsClosed -> false', () => {
        // Given
        const startAngle = 1.286463370861387;
        const endAngle = 4.502415467522527;
        // When
        const isClosed = ellipseIsClosed(startAngle, endAngle);
        // Then
        expect(isClosed).toBe(false);
    });

});