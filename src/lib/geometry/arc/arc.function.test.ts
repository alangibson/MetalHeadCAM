import { describe, it, expect } from 'vitest';
import { arcDirection, arcTransform, degreesToRadians } from './arc.function';
import { ArcDirectionEnum } from './arc.enum';
import type { ArcData } from './arc.data';
import type { TransformData } from '../transform/transform.data';

describe('arcDirection', () => {
    it('small positive angle difference', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(90);

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CCW);
    });

    it('half circle positive angle difference', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(180);

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CCW);
    });

    it('large positive angle difference', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(270);

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CCW);
    });

    it('should handle full circle', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(360);

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CCW);
    });

    it('should handle negative angles increasing in size (positive difference)', () => {
        // Arrange
        const startAngle = degreesToRadians(-90);
        const endAngle = degreesToRadians(90);

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CCW);
    });

    it('should handle reverse large CW sweep > π', () => {
        // Arrange
        const startAngle = degreesToRadians(270); // 270 degrees
        const endAngle = degreesToRadians(60); 

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CW);
    });

    it('should handle negative angles decreasing in size (negative difference)', () => {
        // Arrange
        const startAngle = degreesToRadians(90);
        const endAngle = degreesToRadians(-90);

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CW);
    });

    it('should handle small negative angles', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(-90);

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CW);
    });

    it('should handle reverse half circle', () => {
        // Arrange
        const startAngle = degreesToRadians(180);
        const endAngle = 0; // 0

        // Act
        const direction = arcDirection(startAngle, endAngle);

        // Assert
        expect(direction).toBe(ArcDirectionEnum.CW);
    });

});

describe('arcTransform', () => {

    it('should handle translation', () => {
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2  // 90 degrees
        };
        const transform: TransformData = {
            translateX: 10,
            translateY: -5
        };

        const result = arcTransform(transform, arc);

        expect(result.origin.x).toBe(20);  // 10 + 10
        expect(result.origin.y).toBe(15);  // 20 - 5
        expect(result.radius).toBe(5);     // unchanged
        expect(result.startAngle).toBe(0); // unchanged
        expect(result.endAngle).toBe(Math.PI / 2); // unchanged
    });

    it('should handle scaling', () => {
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2  // 90 degrees
        };
        const transform: TransformData = {
            scaleX: 2,
            scaleY: 2
        };

        const result = arcTransform(transform, arc);

        expect(result.origin.x).toBe(20);  // 10 * 2
        expect(result.origin.y).toBe(40);  // 20 * 2
        expect(result.radius).toBe(10);    // 5 * 2
        expect(result.startAngle).toBe(0); // unchanged
        expect(result.endAngle).toBe(Math.PI / 2); // unchanged
    });

    it('should handle rotation', () => {
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2  // 90 degrees
        };
        const transform: TransformData = {
            rotateAngle: Math.PI // 180 degrees
        };

        const result = arcTransform(transform, arc);

        expect(result.origin.x).toBe(10);  // unchanged
        expect(result.origin.y).toBe(20);  // unchanged
        expect(result.radius).toBe(5);     // unchanged
        expect(result.startAngle).toBeCloseTo(Math.PI);      // 0 + π
        expect(result.endAngle).toBeCloseTo(3 * Math.PI/2); // π/2 + π
    });

    it('should handle combined transformations', () => {
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2  // 90 degrees
        };
        const transform: TransformData = {
            translateX: 10,
            translateY: 10,
            rotateAngle: Math.PI, // 180 degrees
            scaleX: 2,
            scaleY: 2
        };

        const result = arcTransform(transform, arc);

        expect(result.origin.x).toBeCloseTo(30);  // (10 * 2) + 10
        expect(result.origin.y).toBeCloseTo(50);  // (20 * 2) + 10
        expect(result.radius).toBe(10);           // 5 * 2
        expect(result.startAngle).toBeCloseTo(Math.PI);      // 0 + π
        expect(result.endAngle).toBeCloseTo(3 * Math.PI/2); // π/2 + π
    });

    it('should handle undefined transform values', () => {
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2  // 90 degrees
        };
        const transform: TransformData = {};

        const result = arcTransform(transform, arc);

        expect(result.origin.x).toBe(10);
        expect(result.origin.y).toBe(20);
        expect(result.radius).toBe(5);
        expect(result.startAngle).toBe(0);
        expect(result.endAngle).toBe(Math.PI / 2);
    });

    it('should handle DXF specific transform values', () => {
        const arc: ArcData = {
            origin: { x: 7, y: 5 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2
        };

        const transform: TransformData = {
            // rotateAngle: Math.PI, // 180 degrees
            scaleX: 1,
            scaleY: -1,
            translateX: 34.900000000000006,
            translateY: 7.600000000000007
        };

        const result = arcTransform(transform, arc);

        expect(result.origin.x).toBeCloseTo((arc.origin.x * 1) + 34.9);
        expect(result.origin.y).toBeCloseTo((arc.origin.y * -1) + 7.6);
        expect(result.radius).toBe(5);              // 5 * 1
        // expect(result.startAngle).toBeCloseTo(Math.PI);      // 0 + π
        // expect(result.endAngle).toBeCloseTo(3 * Math.PI/2); // π/2 + π
    });
}); 