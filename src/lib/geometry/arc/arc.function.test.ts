import { describe, it, expect } from 'vitest';
import { arcDirection, arcTransform } from './arc.function';
import { degreesToRadians } from "../angle/angle.function";
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

    // TODO fix this test
    // it('should handle rotation', () => {
    //     const arc: ArcData = {
    //         origin: { x: 10, y: 20 },
    //         radius: 5,
    //         startAngle: 0,
    //         endAngle: Math.PI / 2  // 90 degrees
    //     };
    //     const transform: TransformData = {
    //         rotateAngle: Math.PI // 180 degrees
    //     };

    //     const result = arcTransform(transform, arc);

    //     expect(result.origin.x).toBe(10);  // unchanged
    //     expect(result.origin.y).toBe(20);  // unchanged
    //     expect(result.radius).toBe(5);     // unchanged
    //     expect(result.startAngle).toBeCloseTo(Math.PI);      // 0 + π
    //     expect(result.endAngle).toBeCloseTo(3 * Math.PI / 2); // π/2 + π
    // });

    // TODO fix this test
    // it('should handle combined transformations', () => {
    //     const arc: ArcData = {
    //         origin: { x: 10, y: 20 },
    //         radius: 5,
    //         startAngle: 0,
    //         endAngle: Math.PI / 2  // 90 degrees
    //     };
    //     const transform: TransformData = {
    //         translateX: 10,
    //         translateY: 10,
    //         rotateAngle: Math.PI, // 180 degrees
    //         scaleX: 2,
    //         scaleY: 2
    //     };

    //     const result = arcTransform(transform, arc);

    //     expect(result.origin.x).toBeCloseTo(30);  // (10 * 2) + 10
    //     expect(result.origin.y).toBeCloseTo(50);  // (20 * 2) + 10
    //     expect(result.radius).toBe(10);           // 5 * 2
    //     expect(result.startAngle).toBeCloseTo(Math.PI);      // 0 + π
    //     expect(result.endAngle).toBeCloseTo(3 * Math.PI / 2); // π/2 + π
    // });

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

// describe('arcToSvgFlags', () => {
//     it('should handle CCW small arc', () => {
//         // 90 degree arc from 0 to π/2
//         const [largeArc, sweep] = arcToSvgFlags(0, Math.PI / 2, ArcDirectionEnum.CCW);
//         expect(largeArc).toBe(0); // Less than 180 degrees
//         expect(sweep).toBe(0);    // CCW = 0
//     });

//     it('should handle CCW large arc', () => {
//         // 270 degree arc from 0 to 3π/2
//         const [largeArc, sweep] = arcToSvgFlags(0, 3 * Math.PI / 2, ArcDirectionEnum.CCW);
//         expect(largeArc).toBe(1); // Greater than 180 degrees
//         expect(sweep).toBe(0);    // CCW = 0
//     });

//     it('should handle CW small arc', () => {
//         // 90 degree arc from π/2 to 0
//         const [largeArc, sweep] = arcToSvgFlags(Math.PI / 2, 0, ArcDirectionEnum.CW);
//         expect(largeArc).toBe(0); // Less than 180 degrees
//         expect(sweep).toBe(1);    // CW = 1
//     });

//     it('should handle CW large arc', () => {
//         // 270 degree arc from 3π/2 to 0
//         const [largeArc, sweep] = arcToSvgFlags(3 * Math.PI / 2, 0, ArcDirectionEnum.CW);
//         expect(largeArc).toBe(1); // Greater than 180 degrees
//         expect(sweep).toBe(1);    // CW = 1
//     });

//     it('should handle angles crossing 0/2π boundary CCW', () => {
//         // Arc from 3π/2 to π/2 going CCW
//         const [largeArc, sweep] = arcToSvgFlags(3 * Math.PI / 2, Math.PI / 2, ArcDirectionEnum.CCW);
//         expect(largeArc).toBe(0); // Less than 180 degrees
//         expect(sweep).toBe(0);    // CCW = 0
//     });

//     it('should handle angles crossing 0/2π boundary CW', () => {
//         // Arc from π/2 to 3π/2 going CW
//         const [largeArc, sweep] = arcToSvgFlags(Math.PI / 2, 3 * Math.PI / 2, ArcDirectionEnum.CW);
//         expect(largeArc).toBe(0); // Less than 180 degrees
//         expect(sweep).toBe(1);    // CW = 1
//     });

//     it('should handle bulge 1', () => {
//         // Given
//         const arc = {
//             origin: { x: 211.36363636362836, y: 107.40259740260427 },
//             radius: 47.48036673367937,
//             startAngle: 0.6202494859826058,
//             endAngle: -2.0375020302379463,
//             direction: 'cw'
//         };
//         // When
//         const [largeArc, sweep] = arcToSvgFlags(arc.startAngle, arc.endAngle, arc.direction);
//         // Then
//         expect(largeArc).toBe(0);
//         expect(sweep).toBe(0);

//     });

//     it('should handle bulge 2', () => {
//         // Given
//         const arc = {
//             origin: { x: 157.5, y: 0.4939209727494216 },
//             radius: 72.23077066922308,
//             startAngle: 1.1040906233509769,
//             endAngle: 2.0375020302388167,
//             direction: 'ccw'
//         };
//         // When
//         const [largeArc, sweep] = arcToSvgFlags(arc.startAngle, arc.endAngle, arc.direction);
//         // Then
//         expect(largeArc).toBe(0);
//         expect(sweep).toBe(1);

//     });
// }); 