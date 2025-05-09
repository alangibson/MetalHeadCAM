import { describe, it, expect } from 'vitest';
import { arcOrientation, arcTransform } from './arc.function';
import { degreesToRadians } from "../angle/angle.function";
import type { ArcData } from './arc.data';
import type { TransformData } from '../transform/transform.data';
import { OrientationEnum } from '../geometry/geometry.enum';
import { arcTangentAt } from './arc.function';
import { arcMiddlePoint } from './arc.function';
import { arcTessellate } from './arc.function';

describe('arcOrientation', () => {
    it('small positive angle difference', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(90);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.COUNTERCLOCKWISE);
    });

    it('half circle positive angle difference', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(180);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.COUNTERCLOCKWISE);
    });

    it('large positive angle difference', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(270);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.COUNTERCLOCKWISE);
    });

    it('should handle full circle', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(360);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.COUNTERCLOCKWISE);
    });

    it('should handle negative angles increasing in size (positive difference)', () => {
        // Arrange
        const startAngle = degreesToRadians(-90);
        const endAngle = degreesToRadians(90);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.COUNTERCLOCKWISE);
    });

    it('should handle reverse large CW sweep > π', () => {
        // Arrange
        const startAngle = degreesToRadians(270); // 270 degrees
        const endAngle = degreesToRadians(60);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.CLOCKWISE);
    });

    it('should handle negative angles decreasing in size (negative difference)', () => {
        // Arrange
        const startAngle = degreesToRadians(90);
        const endAngle = degreesToRadians(-90);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.CLOCKWISE);
    });

    it('should handle small negative angles', () => {
        // Arrange
        const startAngle = 0;
        const endAngle = degreesToRadians(-90);

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.CLOCKWISE);
    });

    it('should handle reverse half circle', () => {
        // Arrange
        const startAngle = degreesToRadians(180);
        const endAngle = 0; // 0

        // Act
        const orientation = arcOrientation(startAngle, endAngle);

        // Assert
        expect(orientation).toBe(OrientationEnum.CLOCKWISE);
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

    it('should handle translation with negative origin', () => {
        const arc: ArcData = {
            origin: { x: -10, y: -20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2  // 90 degrees
        };
        const transform: TransformData = {
            translateX: 10,
            translateY: -5
        };

        const result = arcTransform(transform, arc);

        expect(result.origin.x).toBe(0);   // -10 + 10
        expect(result.origin.y).toBe(-25); // -20 - 5
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

describe('arcBearingAt', () => {
    it('should calculate bearing at start point of CCW arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI, // 180 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const point = { x: 5, y: 0 }; // Start point of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(Math.PI / 2); // 90 degrees
    });

    it('should calculate bearing at end point of CCW arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI, // 180 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const point = { x: -5, y: 0 }; // End point of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(3 * Math.PI / 2); // 270 degrees
    });

    it('should calculate bearing at start point of CW arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI, // 180 degrees
            endAngle: 0,
            orientation: OrientationEnum.CLOCKWISE
        };
        const point = { x: -5, y: 0 }; // Start point of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(Math.PI / 2); // 90 degrees
    });

    it('should calculate bearing at end point of CW arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI, // 180 degrees
            endAngle: 0,
            orientation: OrientationEnum.CLOCKWISE
        };
        const point = { x: 5, y: 0 }; // End point of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(-Math.PI / 2); // -90 degrees
    });

    it('should calculate bearing at midpoint of CCW arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI, // 180 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const point = { x: 0, y: 5 }; // Midpoint of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(Math.PI); // 180 degrees
    });

    it('should calculate bearing at midpoint of CW arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI, // 180 degrees
            endAngle: 0,
            orientation: OrientationEnum.CLOCKWISE
        };
        const point = { x: 0, y: 5 }; // Midpoint of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(0); // 0 degrees
    });

    it('should calculate bearing for point not on arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI, // 180 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const point = { x: 3, y: 4 }; // Point not on arc but on circle

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        // The bearing should still be calculated correctly even if point is not on arc
        const expectedAngle = Math.atan2(4, 3) + Math.PI / 2;
        expect(bearing).toBeCloseTo(expectedAngle);
    });

    it('should handle arc with non-zero origin', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI, // 180 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const point = { x: 15, y: 20 }; // Start point of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(Math.PI / 2); // 90 degrees
    });

    it('should handle rotated CCW arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI / 4, // 45 degrees
            endAngle: 5 * Math.PI / 4, // 225 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const point = {
            x: 5 * Math.cos(Math.PI / 4),
            y: 5 * Math.sin(Math.PI / 4)
        }; // Start point of arc

        // Act
        const bearing = arcTangentAt(arc, point);

        // Assert
        expect(bearing).toBeCloseTo(3 * Math.PI / 4); // 135 degrees
    });

    // FIXME this one is wrong?
    // it('should handle rotated CW arc', () => {
    //     // Arrange
    //     const arc: ArcData = {
    //         origin: { x: 0, y: 0 },
    //         radius: 5,
    //         startAngle: 5 * Math.PI / 4, // 225 degrees
    //         endAngle: Math.PI / 4, // 45 degrees
    //         orientation: OrientationEnum.CLOCKWISE
    //     };
    //     const point = { 
    //         x: 5 * Math.cos(5 * Math.PI / 4), 
    //         y: 5 * Math.sin(5 * Math.PI / 4) 
    //     }; // Start point of arc

    //     // Act
    //     const bearing = arcBearingAt(arc, point);

    //     // Assert
    //     expect(bearing).toBeCloseTo(7 * Math.PI / 4); // 315 degrees
    // });
});

describe('arcMiddlePoint', () => {
    it('should calculate midpoint of CCW 180-degree arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI, // 180 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(0);
        expect(midpoint.y).toBeCloseTo(5);
    });

    it('should calculate midpoint of CW 180-degree arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI, // 180 degrees
            endAngle: 0,
            orientation: OrientationEnum.CLOCKWISE
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(0);
        expect(midpoint.y).toBeCloseTo(5);
    });

    it('should calculate midpoint of CCW 90-degree arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2, // 90 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(5 * Math.cos(Math.PI / 4));
        expect(midpoint.y).toBeCloseTo(5 * Math.sin(Math.PI / 4));
    });

    it('should calculate midpoint of CW 90-degree arc', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI / 2, // 90 degrees
            endAngle: 0,
            orientation: OrientationEnum.CLOCKWISE
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(5 * Math.cos(Math.PI / 4));
        expect(midpoint.y).toBeCloseTo(5 * Math.sin(Math.PI / 4));
    });

    it('should handle arc crossing 0/2π boundary CCW', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 3 * Math.PI / 2, // 270 degrees
            endAngle: Math.PI / 2, // 90 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(5);
        expect(midpoint.y).toBeCloseTo(0);
    });

    it('should handle arc crossing 0/2π boundary CW', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI / 2, // 90 degrees
            endAngle: 3 * Math.PI / 2, // 270 degrees
            orientation: OrientationEnum.CLOCKWISE
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(5);
        expect(midpoint.y).toBeCloseTo(0);
    });

    it('should handle arc with non-zero origin', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI, // 180 degrees
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(10);
        expect(midpoint.y).toBeCloseTo(25);
    });

    it('should handle arc with implicit orientation', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI // 180 degrees
        };

        // Act
        const midpoint = arcMiddlePoint(arc);

        // Assert
        expect(midpoint.x).toBeCloseTo(0);
        expect(midpoint.y).toBeCloseTo(5);
    });
});

describe('arcTessellate', () => {
    it('should generate correct number of points', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2
        };
        const samples = 10;

        // Act
        const points = arcTessellate(arc, samples);

        // Assert
        expect(points).toHaveLength(samples + 1); // +1 because we include both start and end points
    });

    it('should generate points in counterclockwise direction with explicit orientation', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2,
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const samples = 4;

        // Act
        const points = arcTessellate(arc, samples);

        // Assert
        // First point should be at (5,0)
        expect(points[0].x).toBeCloseTo(5);
        expect(points[0].y).toBeCloseTo(0);

        // Last point should be at (0,5)
        expect(points[samples].x).toBeCloseTo(0);
        expect(points[samples].y).toBeCloseTo(5);

        // Middle point should be at (3.5355, 3.5355) - 45 degrees
        expect(points[2].x).toBeCloseTo(3.5355, 4);
        expect(points[2].y).toBeCloseTo(3.5355, 4);
    });

    it('should generate points in clockwise direction with explicit orientation', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI / 2,
            endAngle: 0,
            orientation: OrientationEnum.CLOCKWISE
        };
        const samples = 4;

        // Act
        const points = arcTessellate(arc, samples);

        // Assert
        // First point should be at (0,5)
        expect(points[0].x).toBeCloseTo(0);
        expect(points[0].y).toBeCloseTo(5);

        // Last point should be at (5,0)
        expect(points[samples].x).toBeCloseTo(5);
        expect(points[samples].y).toBeCloseTo(0);

        // Middle point should be at (3.5355, 3.5355) - 45 degrees
        expect(points[2].x).toBeCloseTo(3.5355, 4);
        expect(points[2].y).toBeCloseTo(3.5355, 4);
    });

    it('should infer counterclockwise orientation when not specified', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2
        };
        const samples = 4;

        // Act
        const points = arcTessellate(arc, samples);

        // Assert
        // First point should be at (5,0)
        expect(points[0].x).toBeCloseTo(5);
        expect(points[0].y).toBeCloseTo(0);

        // Last point should be at (0,5)
        expect(points[samples].x).toBeCloseTo(0);
        expect(points[samples].y).toBeCloseTo(5);
    });

    it('should infer clockwise orientation when not specified', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: Math.PI / 2,
            endAngle: 0
        };
        const samples = 4;

        // Act
        const points = arcTessellate(arc, samples);

        // Assert
        // First point should be at (0,5)
        expect(points[0].x).toBeCloseTo(0);
        expect(points[0].y).toBeCloseTo(5);

        // Last point should be at (5,0)
        expect(points[samples].x).toBeCloseTo(5);
        expect(points[samples].y).toBeCloseTo(0);
    });

    it('should handle full circle with explicit orientation', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: 2 * Math.PI,
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const samples = 4;

        // Act
        const points = arcTessellate(arc, samples);

        // Assert
        expect(points).toHaveLength(samples + 1);
        // First and last points should be the same for a full circle
        expect(points[0].x).toBeCloseTo(points[samples].x);
        expect(points[0].y).toBeCloseTo(points[samples].y);
    });

    it('should handle arc with offset origin and explicit orientation', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 10, y: 20 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2,
            orientation: OrientationEnum.COUNTERCLOCKWISE
        };
        const samples = 4;

        // Act
        const points = arcTessellate(arc, samples);

        // Assert
        // First point should be at (15,20)
        expect(points[0].x).toBeCloseTo(15);
        expect(points[0].y).toBeCloseTo(20);

        // Last point should be at (10,25)
        expect(points[samples].x).toBeCloseTo(10);
        expect(points[samples].y).toBeCloseTo(25);
    });

    it('should use default samples when not specified', () => {
        // Arrange
        const arc: ArcData = {
            origin: { x: 0, y: 0 },
            radius: 5,
            startAngle: 0,
            endAngle: Math.PI / 2
        };

        // Act
        const points = arcTessellate(arc);

        // Assert
        expect(points).toHaveLength(1001); // Default is 1000 samples + 1
    });
});

